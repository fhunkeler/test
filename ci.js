const { Octokit } = require('@octokit/rest');
const util = require('util');
const exec = util.promisify(require('child_process').exec);


const owner = process.env.OWNER || 'fhunkeler';
const repo = process.env.REPOSITORY || 'test';

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

/**
 * Merge all Pull Request
 * @param refs
 * @returns {Promise<void>}
 */
const mergePR = async (refs) => {
  try {
    console.log('------------------------------------ MERGE -------------------------------------');
    const { stdout, stderr } = await exec(`git merge -Xignore-space-change ${refs.join(' ')}`);
    console.log('stdout:', stdout);
    if (stderr) {
      console.log(stderr);
      process.exit(1);
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
    console.log('stdout:', stdout);
    console.log('stderr:', stderr);
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
    const { stdout, stderr } = exec('git config set user.name "Jenkins" && git config set user.email "jenkins@odial.net"');
    console.log('----------------------------------- CONFIG -------------------------------------');
    console.log('stdout:', stdout);
    console.log('stderr:', stderr);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

const run = async () => {
  const PR = await listPR();
  const refs = PR.map(pr => `origin/${pr.head.ref}`);
  await gitConfig();
  try {
    await mergePR(refs);
    await mergeLog();
  } catch (e) {
    console.error(e);
  }
};

run();

