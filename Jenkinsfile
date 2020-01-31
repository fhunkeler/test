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
}pipeline {
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
