#!/usr/bin/env groovy

// Variables that must be defined
// Usually unique among other projects pipelines
appName = 'first microservice'
serviceName = 'first-microservice'
buildStatus = ''
//Dev Registry
dockerRegistry = '020457103146.dkr.ecr.us-east-1.amazonaws.com'
dockerRegistryCredentials = 'ecr:us-east-1:3541fbea-4f71-478b-b1ba-53810db59388'
def kubeConfig = '~/.kube/selina-dev'

//Prod Registry
dockerProdRegistry = '020457103146.dkr.ecr.us-west-2.amazonaws.com'
dockerProdRegistryCredentials = 'ecr:us-west-2:3541fbea-4f71-478b-b1ba-53810db59388'

dockerNamespace = 'selina-dev'
imageName = dockerNamespace + '/' + serviceName
fullImageName = ''
def dockerProdImageName
def gitBranch = ''
def imageTag = ''

slackChannel = '#jenkins-build-status'
def notifySlack = true

def notifyEmail = false
def emailRecipientList = 'vadims@selina.com'
def ciImageName = ''
def ciImage
def configMap
stepsFailed = []
def kubernetesDir = 'selina-kubernetes-eks'
def kubernetesEnv = ''
kubernetesGitBranch = 'master'
//Unit Test Configuration
testsConfigFileName = 'config.test.json'
def databaseName = ''
databasePassword = 'admin'

pipeline {
  agent { label 'docker' }
  options {
    disableConcurrentBuilds()
    timestamps()
    ansiColor('xterm')
  }

  // Pipeline stages
  stages {
        stage('Build CI image') {
          environment {
            LC_ALL = "C.UTF-8"
            LANG = "C.UTF-8"
            DOCKER_BUILDKIT = "1"
          }
          steps {
            script {
              gitBranch = env.GIT_BRANCH.toString().trim().replaceFirst("origin/","")
              if (gitBranch == "master") {  
                kubernetesEnv = 'prod'  
              } else {  
                kubernetesEnv = gitBranch 
              }
              imageTag = gitBranch.replaceAll('/','-') +'-' + env.GIT_COMMIT[0..6].toString().trim()
              databaseName = serviceName + '-' + env.GIT_COMMIT[0..6].toString().trim()
              if (gitBranch.split('-')[0]=='PR') {
                buildBranchURL = "https://github.com/selina-dev/${serviceName}/pull/" + gitBranch.split('-')[-1]
              } else {
                buildBranchURL = "https://github.com/selina-dev/${serviceName}/tree/" + gitBranch
                configFileProvider([configFile(fileId: "${serviceName}-${kubernetesEnv}.yaml", targetLocation: "${serviceName}.yaml")]) {
                  configMap = readYaml file: "${serviceName}.yaml"
                }
              }
              currentBuild.displayName = imageTag
              if (notifySlack) { sendSlackNotification(appName, serviceName, gitBranch, 'Started') }
              ciImageName = dockerNamespace + '/' + serviceName + ':' + gitBranch.replaceAll('/','-') + '-ci'
              ciImage = docker.build(ciImageName, "--secret id=npmrc,src=$HOME/.npmrc -f Dockerfile ./")
            }
          }
        } // End of stage build image
        stage('Unit Tests') {
          environment {
            LC_ALL = "C.UTF-8"
            LANG = "C.UTF-8"
            PGPASSWORD = "${databasePassword}"
            TYPEORM_DATABASE = "${databaseName}"
            POD_NAME = "${databaseName}"
          }
          steps {
            script {
              try {
                sh """psql -h localhost -U postgres -c \"CREATE DATABASE \\\"${databaseName}\\\" ENCODING = 'unicode' TEMPLATE = template0;\""""
                docker.image(ciImageName).inside("--network host --volume $HOME/.npmrc:/.npmrc") {
                  configFileProvider([configFile(fileId: testsConfigFileName, targetLocation: testsConfigFileName)]) {
                    sh """
                    env | sort
                    yarn install
                    yarn test:cov
                    """
                  }
                }
              } catch (e)
              {
                stepsFailed.add('Unit Tests')
                echo """
                        ##################################################
                        #        Unit Tests has failed to succeed        #
                        ##################################################
                """
              }
              if (stepsFailed.size()) {
                error('Steps that failed to succeed: ' + stepsFailed)
              }
            }
          }
        } // End of stage tests
    // Push Image to Registry Stage
    stage('Push Image to Registry') {
      when {
        expression { env.GIT_BRANCH =~ /(?i)(dev|qa|master)/ }
      }
      steps {
        script {
            try {
              if (gitBranch == 'master') {
                fullImageName = dockerProdRegistry + "/" + imageName +  ':'+ imageTag
                docker.withRegistry('https://' + dockerProdRegistry, dockerProdRegistryCredentials) {
                  ciImage.push(imageTag)
                }
              } else {
                fullImageName = dockerRegistry + "/" + imageName + ':'+ imageTag
                docker.withRegistry('https://' + dockerRegistry, dockerRegistryCredentials) {
                  ciImage.push(imageTag)
                }
              }
            } catch (e) {
              stepsFailed.add('Push Image to Registry')
              echo """
                      ##################################################
                      #  Push Image to registry has failed to succeed  #
                      ##################################################
              """
            }
            if (stepsFailed.size()) {
              error('Steps that failed to succeed: ' + stepsFailed)
            }

        }
      }
    } // End of Push Image to Registry Stage
//Migrate Postgres Database
    stage('DB Migrate') {
      when {
        expression { env.GIT_BRANCH =~ /(?i)(dev|qa)/ }
      }
      environment {
        LC_ALL = "C.UTF-8"
        LANG = "C.UTF-8"
        TYPEORM_CONNECTION = "${configMap.data.TYPEORM_CONNECTION}"
        TYPEORM_HOST = "${configMap.data.TYPEORM_HOST}"
        TYPEORM_PORT = "${configMap.data.TYPEORM_PORT}"
        TYPEORM_USERNAME = "${configMap.data.TYPEORM_USERNAME}"
        TYPEORM_PASSWORD = "${configMap.data.TYPEORM_PASSWORD}"
        TYPEORM_DATABASE = "${configMap.data.TYPEORM_DATABASE}"
        TYPEORM_LOGGING = "${configMap.data.TYPEORM_LOGGING}"
        TYPEORM_ENTITIES = "${configMap.data.TYPEORM_ENTITIES}"
        TYPEORM_MIGRATIONS = "${configMap.data.TYPEORM_MIGRATIONS}"
      }
      steps {
        script {
          docker.image(ciImageName).inside("--volume $HOME/.npmrc:/.npmrc") {
            sh """
            env | sort
            yarn install
            yarn migration:run
            """
          }
        }
      }
    } // End of stage DB migrate

    stage('Deploy DEV') {
      when {
        expression { env.GIT_BRANCH =~ /(?i)(dev|qa)/ }
      }
      steps {
        script {
          dir(kubernetesDir) {
            git branch: kubernetesGitBranch, url: 'git@github.com:selina-dev/selina-kubernetes-eks.git', credentialsId: 'selina-ci-git'
          }
          dir(kubernetesDir) {
            sh """
            yq write -i ${kubernetesEnv}/${serviceName}.yaml spec.template.spec.containers[0].image ${fullImageName}
            KUBECONFIG=${kubeConfig} /usr/local/bin/kubectl apply -f  ${kubernetesEnv}/${serviceName}.yaml -n ${kubernetesEnv}
            """
            updateDeployments(kubernetesGitBranch, kubernetesEnv, kubernetesEnv)
          }
        }
      }
    } // End of Deploy Dev Stage
    stage('Deploy Production') {
      when {
        expression { env.GIT_BRANCH =~ /master/ }
      }
      steps {
        script {
          def jobName = serviceName.split('-')[0].toUpperCase() + "/production-deploy"
          build job: jobName, parameters: [string(name: 'SERVICE', value: serviceName), string(name: 'DOCKER_IMAGE', value: fullImageName ), booleanParam(name: 'MIGRATE', value: true)], quietPeriod: 30, wait: false;
        }
      }
    } // End of deploy to production stage
  } // All Stages end
  // Post-build section
  post {
    success {
      script {
        echo "Build completed with NO Errors"
        if (notifySlack) { sendSlackNotification(appName, serviceName, gitBranch, 'Completed') }
        if (notifyEmail) { sendEmailNotification(appName, env.BUILD_NUMBER.toString().trim(), gitBranch, emailRecipientList, 'Completed') }
      }
    }
    failure {
      script {
        echo "Build completed with Errors"
        if (notifySlack) { sendSlackNotification(appName, serviceName, gitBranch, 'Failed') }
        if (notifyEmail) { sendEmailNotification(appName, env.BUILD_NUMBER.toString().trim(), gitBranch, emailRecipientList, 'Failed') }
      }
    }
    aborted {
      script {
        echo "Build aborted"
        if (notifySlack) { sendSlackNotification(appName, serviceName, gitBranch, 'Aborted') }
        if (notifyEmail) { sendEmailNotification(appName, env.BUILD_NUMBER.toString().trim(), gitBranch, emailRecipientList, 'Aborted') }
      }
    }
    cleanup {
      script {
          step([$class: 'CloverPublisher',
              cloverReportDir: 'coverage',
              cloverReportFileName: 'clover.xml',
              healthyTarget: [methodCoverage: 70, conditionalCoverage: 80, statementCoverage: 80],
              unhealthyTarget: [methodCoverage: 50, conditionalCoverage: 50, statementCoverage: 50],
              failingTarget: [methodCoverage: 0, conditionalCoverage: 0, statementCoverage: 0]     
          ])
          println ("Trying to perform git clean to erase untracked files in the workspace")

          sh """
          PGPASSWORD="${databasePassword}" psql -h localhost -U postgres -c \"DROP DATABASE \\\"${databaseName}\\\";\"
          git clean -xdff
          """
          println ("Cleanup was successfull")
      }
    }
  } // Post-build section end
} // Pipeline end

// Slack notifications

// Slack notifications
void sendSlackNotification(String appName, String serviceName, String gitBranch, String buildStatus) {
  def summary = ''
  summary = "${appName}: <${env.BUILD_URL}|Build #${env.BUILD_NUMBER}> of *${serviceName}* has *${buildStatus}*\nBranch: <${buildBranchURL}|${gitBranch}>"
  if (buildStatus == 'Started') {
    icon = ':construction:'
    colorCode = '#FFFF00'
  } else if (buildStatus == 'Completed' && fullImageName != '') {
    icon = ':heavy_check_mark:'
    colorCode = '#22FF00'
    summary = "${summary}\n`Docker Image: ${fullImageName}`"
  } else if (buildStatus == 'Completed') {
    icon = ':heavy_check_mark:'
    colorCode = '#22FF00'
  } else if (buildStatus == 'Failed') {
    icon = ':x:'
    colorCode = '#FF0000'
    if (stepsFailed.size()) {
      summary = "${summary}\n`Failed: ${stepsFailed}`"
    }
  } else if (buildStatus == 'Aborted') {
    icon = ':x:'
    colorCode = '#FF7777'
  }
  withCredentials([string(credentialsId: 'slack-token', variable: 'SLACK_TOKEN')]) {
    slackSend(
      color: colorCode,
      message: "${icon} ${summary}",
      channel: slackChannel,
      failOnError: false,
      teamDomain: 'selina-family',
      token: SLACK_TOKEN
    )
  }
}

void sendEmailNotification(String appName, String thisBuildVersionVersion, String buildBranch, String emailRecipientList, String buildStatus) {
  def Subject = "Build of ${appName} branch ${buildBranch} #${thisBuildVersionVersion} is ${buildStatus}"
  def message = "<p>Hello Humans,<br>Here is results of the build:<br></p>"
  message = message + "<h2><a href=\"${env.BUILD_URL}\">Build LOG</a></h2>"
  message = message + "<br> -- <br><p>Sincerely,<br>DevOps Team | <b>The merciless general Jenkins</b></p>"
  emailext body: message, mimeType: 'text/html', subject: Subject, to: emailRecipientList
}


void updateDeployments(String branchName, String dirName, String envName) {
  sh """
  git config --global user.email \"ci-selina@selina.com\"
  git config --global user.name \"Selina CI\"
  """
  def statusCode = sh script:"git diff --exit-code", returnStatus:true
  if (statusCode == 1) {
    sshagent(['selina-ci-git']) {
    sh """
    git pull origin ${branchName}
    git add ${dirName}
    git commit -m \"Update Deployment ${envName}\"
    """
      try { retry(5) { sh "git push origin ${branchName}" }
      } catch (e) { retry(5) { sleep 10; sh "git push origin ${branchName}" } }
    }
  }
}
