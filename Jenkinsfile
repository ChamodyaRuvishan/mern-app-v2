pipeline {
  agent any

  environment {
    DOCKERHUB_USER = 'chamodyaruvishan' // your Docker Hub username
    TAG_SHORT = "${env.GIT_COMMIT?.take(7) ?: 'local'}"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build and Push') {
      steps {
        script {
          def services = []

          // Check for Dockerfiles in your folders
          if (fileExists('backend/Dockerfile')) {
            services << [name: 'backend', dockerfile: 'backend/Dockerfile', context: 'backend']
          }
          if (fileExists('GUI/Fashion/Dockerfile')) {
            services << [name: 'frontend', dockerfile: 'GUI/Fashion/Dockerfile', context: 'GUI/Fashion']
          }

          // Stop if no Dockerfiles found
          if (services.isEmpty()) {
            error "No Dockerfiles found. Expected backend/Dockerfile or GUI/Fashion/Dockerfile."
          }

          // Login to Docker Hub using credentials saved in Jenkins
          withCredentials([usernamePassword(credentialsId: 'DOCKERHUB_CRED', usernameVariable: 'DH_USER', passwordVariable: 'DH_PASS')]) {
            sh 'echo "$DH_PASS" | docker login -u "$DH_USER" --password-stdin'

            // Build and push each image
            for (svc in services) {
              def image = "${env.DOCKERHUB_USER}/mern-${svc.name}"
              sh """
                docker build -f ${svc.dockerfile} -t ${image}:${TAG_SHORT} -t ${image}:latest ${svc.context}
                docker push ${image}:${TAG_SHORT}
                docker push ${image}:latest
              """
            }

            sh 'docker logout || true'
          }
        }
      }
    }
  }

  post {
    always {
      sh 'docker image prune -f || true'
    }
  }
}
