pipeline {
    agent any

    options {
        skipDefaultCheckout true
    }

    parameters {
        string(name: 'OWNER', defaultValue: 'fhunkeler', description: 'Github repository owner')
        string(name: 'REPOSITORY', defaultValue: 'test', description: 'Github repository name')
        string(name: 'PLATFORM', defaultValue: 'staging', description: 'target platform, comma separated list')
        string(name: 'LABEL_NOT_EXIST', defaultValue: 'DO_NOT_INTEGRATE', description: 'Trigger build if Label do not exist, comma separated list')
        string(name: 'LABEL_EXIST', defaultValue: '', description: 'Trigger build if Label do not exist, comma separated list')
    }

    stages {
        stage('Checkout') {
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

        stage('Merge all') {
            tools {
                nodejs "node_lts"
            }
            steps {
                withCredentials([
                    usernamePassword(credentialsId: 'github', passwordVariable: 'GITHUB_TOKEN', usernameVariable: 'GITHUB_USER')
                ]) {
                    sh '''
                        npm install
                        npm run ci
                    '''
                }
            }
        }

        stage('Env') {
            steps {
                sh 'env'
            }
        }
    }
}
