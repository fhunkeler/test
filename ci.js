const { Octokit } = require('@octokit/rest');
const { exec } = require('child_process');


const owner = process.env.OWNER || 'fhunkeler';
const repo = process.env.REPOSITORY || 'test';

process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
});

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

const filterPR = (key) => {
  const labelExist = (process.env.LABEL_EXIST || '').split(',').map(elm => elm.trim());
  const labelNotExist = (process.env.LABEL_NOT_EXIST || '').split(',').map(elm => elm.trim());
  return key.labels.some(label => labelExist.includes(label.name))
    || key.labels.some(label => labelNotExist.includes(label.name))
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
    return prList.data.filter(k => filterPR(k));
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

const run = async () => {
  const PR = await listPR();
  const refs = PR.map(pr => pr.head.ref);
  exec(`git merge -Xignore-space-change ${refs.join(' ')}`, (err, stdout, stderr) => {
    if (err) {
      //some err occurred
      console.error(err)
    } else {
      // the *entire* stdout and stderr (buffered)
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
    }
  });
  exec("git log --graph --pretty=format:'%h -%d %s (%cr)' --abbrev-commit --date=relative --all -n20", (err, stdout, stderr) => {
    if (err) {
      //some err occurred
      console.error(err)
    } else {
      // the *entire* stdout and stderr (buffered)
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
    }
  });
};

run();

