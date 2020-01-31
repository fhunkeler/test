pipeline {
  agent any
  stages {
    stage('Env') {
      steps {
        sh "printenv"
      }
    }

    stage('Checkout') {
      steps {
        sh "git checkout -f master"
      }
    }

    stages {
        stage('SCM - Till Plugin get matured enough') {
            when { expression { !env.GITHUB_TAG_NAME } }
            steps {
                withCredentials([
                        usernamePassword( usernameVariable: 'GITHUB_USER', passwordVariable: 'GITHUB_TOKEN', credentialsId: 'my-github-token-from-vault')
                ]) {
                    script {
                        sh "rm -rf * .git .gitignore"
                        def giturl = env.GITHUB_REPO_GIT_URL.replace('git://github','https://'+env.GITHUB_USER+':'+env.GITHUB_TOKEN+'@github')
                        if (env.GITHUB_PR_NUMBER){
                            sh "git init"
                            sh "git fetch ${giturl} pull/${env.GITHUB_PR_NUMBER}/head:PR_BRANCH"
                            sh "git checkout PR_BRANCH"
                        } else{
                            sh "git clone ${giturl} --branch ${env.GITHUB_BRANCH_NAME} --single-branch --depth 1 ."
                        }
                        sh "git fetch --tags"
                        env.SEMVER = sh(returnStdout: true,
                                script: "git tag -l --sort=v:refname | grep -E '^v[0-9]+.[0-9]+.0\$' | tail -n 1 | awk -F. '{printf \"%s.%s.%s\", \$1, \$2 + 1, \$3}' | cut -c2-")
                        println 'new Version in making - ' + env.SEMVER
                    }
                }
            }
        }

    stage('Merge') {
      when {
        not {
          branch 'master'
        }
      }
      steps {
        sh "git merge --ff-only ${env.BRANCH_NAME}"
      }
    }

    stage('List') {
      steps {
        sh "cat ./README.md"
      }
    }

  }
  parameters {
    string(name: 'PLATFORM', defaultValue: 'staging', description: 'target platform')
  }
}
