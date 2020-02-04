const { Octokit } = require('@octokit/rest');
const Git = require('nodegit');


process.on('unhandledRejection', (err) => {
  console.error(err)
  process.exit(1)
});

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

/*octokit.pulls.list({
  owner: 'fhunkeler',
  repo: 'test',
  state: 'open'
}).then(res => {
  console.log(res.data.map(pull => console.log(pull.labels)))
}).catch(err => console.log(err));*/


async function listPR() {
  try {
    const prLsit = await octokit.pulls.list({
      owner: 'fhunkeler',
      repo: 'test',
      state: 'open'
    });
    return prLsit.data.filter(k => k.labels.some(e => e.name !== 'DO_NOT_INTEGRATE'));
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

async function run() {
  console.log(await listPR());
}

run();