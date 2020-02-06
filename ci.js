const { Octokit } = require('@octokit/rest');
const {Repository, Signature} = require('nodegit');
const git = require('isomorphic-git');
const fs = require('fs');
git.plugins.set('fs', fs);

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
  const labelExist = process.env.LABEL_EXIST.split(',').map(elm => elm.trim());
  const labelNotExist = process.env.LABEL_NOT_EXIST.split(',').map(elm => elm.trim());
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
  PR.forEach(pr => {
    console.log(`merging ${pr.head.ref}`);
    git.merge({
      dir: '.',
      theirs: `origin/${pr.head.ref}`
    }).then(merge => console.log(merge))
      .catch(e => {
        console.error(e);
        process.exit(1);
      });
  })
};

run();

