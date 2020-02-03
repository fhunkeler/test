const { Octokit } = require('@octokit/rest');

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

octokit.issues.list({
  state: 'open'
}).then(data => {
  console.log(data)
}).catch(err => console.log(err));
