pipeline {
    agent any

    options {
        skipDefaultCheckout true
    }

    parameters {
        string(name: 'PLATFORM', defaultValue: 'staging', description: 'target platform')
        string(name: 'LABEL_EXIST', defaultValue: '', description: 'Trigger build if Label exist')
        string(name: 'LABEL_NOT_EXIST', defaultValue: 'DO_NOT_INTEGRATE', description: 'Trigger build if Label do not exist')
    }

    stages {
        stage('Checkout') {
            /* agent {
                label 'master'
            } */
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
        }

        stage('LS') {
            /* agent {
                label 'master'
            } */
            steps {
                sh 'ls -lrta'
                sh 'env'
            }
        }

        stage('Merge all') {
            /* agent {
                label 'master'
            } */
            tools {
                nodejs "node-12"
            }
            steps {
                withCredentials([
                    usernamePassword(credentialsId: 'github', passwordVariable: 'GITHUB_TOKEN', usernameVariable: 'GITHUB_USER')
                ]) {
                    sh '''
                        env
                        type node
                        npm install
                        npm run ci
                    '''
                    /* nodejs(nodeJSInstallationName: 'node-12') {
                        sh 'env'
                        sh 'which node'
                        sh 'npm install'
                        sh 'npm run ci'
                    } */
                }
            }
        }
    }
}
