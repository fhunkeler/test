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
             checkout([
                $class: 'GitSCM',
                branches: [[name: '*/master']],
                doGenerateSubmoduleConfigurations: false,
                extensions: [],
                submoduleCfg: [],
                userRemoteConfigs: [[
                    credentialsId: 'github',
                    url: 'https://github.com/fhunkeler/test.git'
                ]]
             ])
            }
            /* steps {
                withCredentials([
                    usernamePassword(credentialsId: 'github', passwordVariable: 'GITHUB_TOKEN', usernameVariable: 'GITHUB_USER')
                ]) {
                    sh "git init"
                    sh "git fetch https://github.com/fhunkeler/test"
                    sh "git checkout master"
                }
            } */
        }

        stage('LS') {
            agent {
                label 'master'
            }
            steps {
                sh 'ls -lrta'
            }
        }
    }
}
