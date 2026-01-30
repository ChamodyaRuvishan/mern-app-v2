pipeline {
    agent any

    environment {
        // Your Docker Hub username
        DOCKERHUB_USER = 'chamodyaruvishan' 
        // Create a short tag from the commit hash (first 7 chars)
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

                    if (services.isEmpty()) {
                        error "No Dockerfiles found. Expected backend/Dockerfile or GUI/Fashion/Dockerfile."
                    }

                    // Login to Docker Hub using credentials saved in Jenkins
                    withCredentials([usernamePassword(credentialsId: 'DOCKERHUB_CRED', usernameVariable: 'DH_USER', passwordVariable: 'DH_PASS')]) {
                        sh 'echo "$DH_PASS" | docker login -u "$DH_USER" --password-stdin'

                        for (svc in services) {
                            def image = "${env.DOCKERHUB_USER}/mern-${svc.name}"
                            sh """
                                docker build -f ${svc.dockerfile} -t ${image}:${TAG_SHORT} -t ${image}:latest ${svc.context}
                                docker push ${image}:${TAG_SHORT}
                                docker push ${image}:latest
                            """
                        }
                    }
                    sh 'docker logout || true'
                }
            }
        }

        // --- DEPLOY STAGE (Terraform) ---
        stage('Deploy (Terraform)') {
            // Only run this stage on the main branch
            when { branch 'main' }
            environment {
                AWS_DEFAULT_REGION = 'us-east-1' 
            }
            steps {
                dir('infra') {
                    // Use AWS Credentials stored in Jenkins (ID: AWS_CREDS)
                    withCredentials([usernamePassword(credentialsId: 'AWS_CREDS', usernameVariable: 'AWS_ACCESS_KEY_ID', passwordVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                        sh """
                            echo "Initializing Terraform..."
                            terraform init -input=false
                            
                            echo "Deploying to AWS..."
                            terraform apply -auto-approve \\
                              -var region=${AWS_DEFAULT_REGION} \\
                              -var name=mern-backend \\
                              -var image_repo=${DOCKERHUB_USER}/mern-backend \\
                              -var image_tag=${TAG_SHORT} \\
                              -var app_port=8000
                        """
                    }
                }
            }
        }
    }

    post {
        always {
            // Clean up old images to save space
            sh 'docker image prune -f || true'
        }
    }
}