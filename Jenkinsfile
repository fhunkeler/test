pipeline {
    agent none

    options {
        skipDefaultCheckout true
    }

    parameters {
        string(name: 'PLATFORM', defaultValue: 'staging', description: 'target platform')
    }

    stage('Checkout') {
        agent {
            label 'master'
        }
        steps {
            withCredentials([
                usernamePassword(credentialsId: 'github', passwordVariable: 'GITHUB_TOKEN', usernameVariable: 'GITHUB_USER')
            ]) {
                sh "echo ${GITHUB_USER}/${GITHUB_TOKEN}"
                sh "git init"
                sh "git fetch master"
                sh "git checkout -f master"
            }
        }
    }
}
