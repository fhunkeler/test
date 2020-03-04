pipeline {
    agent any

    options {
        skipDefaultCheckout true
    }

    environment {
        OD_DOCKER_ORG="od-backend"
        REGION="eu-west-0"
        // OD_DOCKER_REGISTRY=registry.${REGION}.prod-cloud-ocb.orange-business.com
        OD_DOCKER_REGISTRY="100.125.0.94:20202"
        OD_FE_ACCESS_KEY="LVT3CCXO15Z60SJ4BVWL"
    }

    parameters {
        string(name: 'OWNER', defaultValue: 'Dialler', description: 'Github repository owner')
        string(name: 'REPOSITORY', defaultValue: 'dialler_backend', description: 'Github repository name')
        string(name: 'PLATFORM', defaultValue: 'staging', description: 'target platform, comma separated list')
        string(name: 'LABEL_NOT_EXIST', defaultValue: 'DO_NOT_INTEGRATE', description: 'Trigger build if Label do not exist, comma separated list')
        // string(name: 'LABEL_EXIST', defaultValue: '', description: 'Trigger build if Label do not exist, comma separated list')
    }

    stages {

        stage('Clean') {
            steps {
                sh 'rm -rf ..?* .[!.]* *'
            }
        }

        stage('Checkout') {
            steps {
             /* sh '''
                git config --global credential.helper cache
                git config --global push.default simple
             ''' */
             /* checkout([
                $class: 'GitSCM',
                branches: [[name: '*//* master']],
                doGenerateSubmoduleConfigurations: false,
                extensions: [],
                submoduleCfg: [],
                userRemoteConfigs: [[
                    credentialsId: 'github',
                    url: 'https://github.com/fhunkeler/test.git'
                ]]
             ]) */
             git credentialsId: 'github', url: 'https://github.com/fhunkeler/test.git'
            }
        }

        stage('Merge') {
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
        /*
        stage('Build') {
            steps {
                withCredentials([
                    string( credentialsId: 'OD_FE_SECRET_KEY',  variable: 'OD_FE_SECRET_KEY')
                ]) {
                    sh '''
                        OD_DOCKER_KEY=$(printf "$OD_FE_ACCESS_KEY" | openssl dgst -binary -sha256 -hmac "$OD_FE_SECRET_KEY" | od -An -vtx1 | tr -d [:space:])
                        echo ${OD_DOCKER_KEY} | docker login -u ${REGION}@${OD_FE_ACCESS_KEY} --password-stdin ${OD_DOCKER_REGISTRY}

                        IMAGE_NAME=${OD_DOCKER_REGISTRY}/${OD_DOCKER_ORG}/dialler-app

                        touch .env
                        echo 'IMAGE_NAME='$IMAGE_NAME > .env
                        echo 'IMAGE_TAG='$BUILD_TAG >> .env
                        echo 'PLATFORM=dev' >> .env
                        echo 'DATA_PATH=./tmp/data' >> .env
                        echo 'KEYS=./keys' >> .env
                        echo 'MAILDIR=/home/devdialler/Maildir' >> .env

                        docker-compose build --no-cache --pull
                        #docker-compose push
                        #docker image tag $IMAGE_NAME:$IMAGE_TAG $IMAGE_NAME:staging
                        #docker image push $IMAGE_NAME:staging
                        #docker image rm $IMAGE_NAME:$IMAGE_TAG
                    '''
                }
            }
        }
        */
        stage("Push") {
            environment {
                GIT_AUTH = credentials('github')
            }
            steps {
                sh('''
                    git config --local credential.helper "!f() { echo username=\\$GIT_AUTH_USR; echo password=\\$GIT_AUTH_PSW; }; f"
                    git checkout -b ci
                    git add .
                    git commit -m "[$BUILD_TAG]"
                    git tag -a $BUILD_TAG -m "$BUILD_TAG"
                    git push --set-upstream origin ci
                ''')
            }
        }
        /* stage('Commit') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'my-credentials-id', usernameVariable: 'GIT_USERNAME', passwordVariable: 'GIT_PASSWORD')]){
                    sh('''
                        git config --local credential.helper "!f() { echo username=\\$GIT_AUTH_USR; echo password=\\$GIT_AUTH_PSW; }; f"
                        git push origin HEAD:$TARGET_BRANCH
                    ''')
                    }
                  *//*sh '''
                    git add .
                    git commit -m "[$BUILD_TAG]"
                    git tag -a $BUILD_TAG -m "$BUILD_TAG"
                    git push origin HEAD:ci
                 '''*//*
                 *//* withCredentials([
                    usernamePassword(credentialsId: 'github', passwordVariable: 'GITHUB_TOKEN', usernameVariable: 'GITHUB_USER')
                ])
                sshagent(['github']) {

                }*//*
            }
        } */
    }

    /*post {
        success {
          slackSend (color: '#00FF00', message: "SUCCESSFUL: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})")
        }

        failure {
          slackSend (color: '#FF0000', message: "FAILED: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})")
        }
        cleanup {
            sh '''
                docker container prune -f
                docker image prune -f
             '''
        }
    }*/
}
