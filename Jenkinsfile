pipeline {
    agent none

    options {
        skipDefaultCheckout true
    }

    parameters {
        string(name: 'PLATFORM', defaultValue: 'staging', description: 'target platform')
    }

    stages {
        stage('Checkout') {
            agent {
                label 'master'
            }
            steps {
                withCredentials([
                    usernamePassword(credentialsId: 'github', passwordVariable: 'GITHUB_TOKEN', usernameVariable: 'GITHUB_USER')
                ]) {
                    sh "git init"
                    sh "git fetch https://github.com/fhunkeler/test"
                    sh "git checkout -f master"
                }
            }
        }
    }
}
