const { Octokit } = require('@octokit/rest');
const util = require('util');
const prependFile = require('prepend-file');
const json2md = require('json2md');
const exec = util.promisify(require('child_process').exec);


const owner = process.env.OWNER || 'Dialler';
const repo = process.env.REPOSITORY || 'dialler_backend';
const labelExist = (process.env.LABEL_EXIST || '').split(',').map(elm => elm.trim());
const labelNotExist = (process.env.LABEL_NOT_EXIST || '').split(',').map(elm => elm.trim());
const prFile = process.env.PR_FILE_LIST || './PULL_REQUEST_MERGE.md';

process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
});

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

/**
 * Pull request filter
 * @param key
 * @returns {boolean}
 */
const filterPR = (key) => {
  return key.labels.some(label => labelExist.includes(label.name))
    || !key.labels.some(label => labelNotExist.includes(label.name))
    || key.labels.length === 0;
};

/**
 * List pull request based on filter options
 * @returns {Promise<Octokit.PullsListResponseItem[]>}
 */
const listPR = async () => {
  try {
    const prList = await octokit.pulls.list({
      owner,
      repo,
      state: 'open'
    });

    // Need to get all PR individually to retrieve mergeable PR status from github API
    return Promise.all(prList.data.filter(key => filterPR(key)).map(pr => octokit.pulls.get({owner, repo, pull_number: pr.number })))
      .then(response => {
        const prs = response.map(pr => pr.data);
        const notMergeable = prs.filter(pr => !pr.mergeable);
        if (notMergeable.length === 0) {
          return prs;
        }
        console.log('------------------------------ NOT MERGEABLE PR --------------------------------');
        notMergeable.forEach(pr => {
          console.log(` - origin/${pr.head.ref}`)
        });
        process.exit(1);
      });

  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

/**
 * Get commit data
 * @param prs
 * @returns {Promise<Octokit.Response<Octokit.GitGetCommitResponse>>}
 */
const getCommit = async (prs) => {
  return Promise.all(prs.map(async pr => {
    const commit  = await octokit.git.getCommit({
      owner,
      repo,
      commit_sha: pr.head.sha
    });
    return {
      ...pr,
      commit: commit.data
    }
  }));
};

/**
 * Merge all Pull Request
 * @param refs
 * @returns {Promise<void>}
 */
const mergePR = async (refs) => {
  try {
    console.log('------------------------------------ MERGE -------------------------------------');
    if (refs.length > 0) {
      const { stdout, stderr } = await exec(`git merge -Xignore-space-change ${refs.join(' ')}`);
      if (stdout) {
        console.log(stdout);
      }
      if (stderr) {
        console.log(stderr);
        process.exit(1);
      }
    } else {
      console.log('No branch to merge')
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

/**
 * Display merge log
 * @returns {Promise<void>}
 */
const mergeLog = async () => {
  try {
    const { stdout, stderr } = await exec("git log --graph --pretty=format:'%h -%d %s (%cr)' --abbrev-commit --date=relative --all -n20");
    console.log('------------------------------------- LOG --------------------------------------');
    if (stdout) {
      console.log(stdout);
    }
    if (stderr) {
      console.log(stderr);
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

/**
 * Configure git user name and email
 * @returns {Promise<void>}
 */
const gitConfig = async () => {
  try {
    const { stdout, stderr } = exec('git config --global user.name "Jenkins" && git config --global user.email "jenkins@odial.net"');
    console.log('----------------------------------- CONFIG -------------------------------------');
    if (stdout) {
      console.log(stdout);
    }
    if (stderr) {
      console.log(stderr);
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

/**
 * Creating tracking pull request file
 * @param prs
 */
const mergedPRFile = async (prs) => {
  getCommit(prs)
    .then(pulls => {
      const ul = [
        `Date: ${new Date().toISOString()}`
      ];
      if (process.env.BUILD_URL) {
        ul.push({
          link: { title: process.env.BUILD_URL, source: process.env.BUILD_URL }
        });
      }

      const md = [
        { h1: 'Pull Request merged' },
        { h2: process.env.BUILD_TAG || 'Non CI build' },
        { ul },
        { table: {
            headers: [ "branch", "number", "title", "last commit", "message", "committer" ],
            rows: pulls.map(pull => {
              return [
                pull.head.ref.replace(/(\r\n|\n|\r)/gm, " "),
                pull.number,
                pull.title.replace(/(\r\n|\n|\r)/gm, " "),
                pull.commit.committer.date.replace(/(\r\n|\n|\r)/gm, " "),
                pull.commit.message.replace(/(\r\n|\n|\r)/gm, " "),
                pull.commit.committer.name.replace(/(\r\n|\n|\r)/gm, " ")
              ]
            })
          }}
      ];

      prependFile(prFile, json2md(md), (err) => {
        if (err) {
          console.error(err);
          process.exit(1);
        }

        console.log('Pull request file updated');
      });
    });
};

/**
 * Main
 * @returns {Promise<void>}
 */
const run = async () => {
  const PR = await listPR();
  console.log('--------------------------------- PR TO MERGE ----------------------------------');
  PR.forEach(pr => {
    console.log({
      title: pr.title,
      number: pr.number,
      labels: pr.labels.map(label => label.name)
    });

  });
  const refs = PR.map(pr => `origin/${pr.head.ref}`);
  await gitConfig();
  try {
    await mergePR(refs);
    await mergeLog();
    await mergedPRFile(PR)
  } catch (e) {
    console.error(e);
  }
};

run();
