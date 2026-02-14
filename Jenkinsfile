pipeline {
    agent any

    environment {
        // Your Docker Hub username
        DOCKERHUB_USER = 'chamodyaruvishan' 
        // Create a short tag from the commit hash (first 7 chars)
        TAG_SHORT = "${env.GIT_COMMIT?.take(7) ?: 'local'}"
    }

    stages {
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
            // Run deploy for main branch in both multibranch and single pipeline jobs
            when {
                anyOf {
                    branch 'main'
                    expression { env.GIT_BRANCH == 'origin/main' }
                    expression { env.GIT_BRANCH == 'refs/heads/main' }
                }
            }
            environment {
                AWS_DEFAULT_REGION = 'us-east-1' 
            }
            steps {
                dir('infra') {
                    // Use AWS Credentials stored in Jenkins (ID: AWS_CREDS)
                    withCredentials([usernamePassword(credentialsId: 'AWS_CREDS', usernameVariable: 'AWS_ACCESS_KEY_ID', passwordVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                        sh '''
                            set -e
                            # Trim accidental spaces/newlines from Jenkins credential fields
                            export AWS_ACCESS_KEY_ID=\$(echo "\$AWS_ACCESS_KEY_ID" | tr -d '[:space:]')
                            export AWS_SECRET_ACCESS_KEY=\$(echo "\$AWS_SECRET_ACCESS_KEY" | tr -d '[:space:]')
                            # Avoid stale session token poisoning static-key auth
                            unset AWS_SESSION_TOKEN || true

                            echo "BRANCH_NAME=\${BRANCH_NAME:-unset}"
                            echo "GIT_BRANCH=\${GIT_BRANCH:-unset}"
                            echo "AWS_DEFAULT_REGION=$AWS_DEFAULT_REGION"
                            echo "AWS_ACCESS_KEY_ID_PREFIX=\${AWS_ACCESS_KEY_ID%%????}****"

                            if command -v aws >/dev/null 2>&1; then
                              echo "Checking AWS caller identity..."
                              aws sts get-caller-identity --output json >/dev/null
                            else
                              echo "AWS CLI not found; skipping sts precheck and continuing with Terraform."
                            fi

                            echo "Initializing Terraform..."
                            terraform init -input=false

                            echo "Validating Terraform..."
                            terraform validate

                            # Import pre-existing resources into state to avoid duplicate-name failures
                            # when Jenkins workspace/state is reset.
                            tf_state_has() {
                              terraform state show "$1" >/dev/null 2>&1
                            }

                            if command -v aws >/dev/null 2>&1; then
                              echo "Reconciling Terraform state with existing AWS resources..."

                              VPC_ID=$(aws ec2 describe-vpcs --filters Name=isDefault,Values=true --query 'Vpcs[0].VpcId' --output text 2>/dev/null || true)
                              if [ -z "$VPC_ID" ] || [ "$VPC_ID" = "None" ]; then
                                echo "Default VPC not found; skipping import reconciliation."
                              else
                                # SG: ALB
                                if ! tf_state_has aws_security_group.alb; then
                                  ALB_SG_ID=$(aws ec2 describe-security-groups --filters Name=group-name,Values=mern-backend-alb-sg Name=vpc-id,Values="$VPC_ID" --query 'SecurityGroups[0].GroupId' --output text 2>/dev/null || true)
                                  if [ -n "$ALB_SG_ID" ] && [ "$ALB_SG_ID" != "None" ]; then
                                    terraform import aws_security_group.alb "$ALB_SG_ID" || true
                                  fi
                                fi

                                # SG: Service
                                if ! tf_state_has aws_security_group.svc; then
                                  SVC_SG_ID=$(aws ec2 describe-security-groups --filters Name=group-name,Values=mern-backend-svc-sg Name=vpc-id,Values="$VPC_ID" --query 'SecurityGroups[0].GroupId' --output text 2>/dev/null || true)
                                  if [ -n "$SVC_SG_ID" ] && [ "$SVC_SG_ID" != "None" ]; then
                                    terraform import aws_security_group.svc "$SVC_SG_ID" || true
                                  fi
                                fi

                                # Target Group
                                if ! tf_state_has aws_lb_target_group.this; then
                                  TG_ARN=$(aws elbv2 describe-target-groups --names mern-backend-tg --query 'TargetGroups[0].TargetGroupArn' --output text 2>/dev/null || true)
                                  if [ -n "$TG_ARN" ] && [ "$TG_ARN" != "None" ]; then
                                    terraform import aws_lb_target_group.this "$TG_ARN" || true
                                  fi
                                fi

                                # ALB
                                if ! tf_state_has aws_lb.this; then
                                  ALB_ARN=$(aws elbv2 describe-load-balancers --names mern-backend-alb --query 'LoadBalancers[0].LoadBalancerArn' --output text 2>/dev/null || true)
                                  if [ -n "$ALB_ARN" ] && [ "$ALB_ARN" != "None" ]; then
                                    terraform import aws_lb.this "$ALB_ARN" || true
                                  fi
                                fi

                                # Listener (HTTP:80)
                                if ! tf_state_has aws_lb_listener.http; then
                                  if [ -z "${ALB_ARN:-}" ] || [ "${ALB_ARN:-None}" = "None" ]; then
                                    ALB_ARN=$(aws elbv2 describe-load-balancers --names mern-backend-alb --query 'LoadBalancers[0].LoadBalancerArn' --output text 2>/dev/null || true)
                                  fi
                                  if [ -n "${ALB_ARN:-}" ] && [ "${ALB_ARN:-None}" != "None" ]; then
                                    LISTENER_ARN=$(aws elbv2 describe-listeners --load-balancer-arn "$ALB_ARN" --query 'Listeners[?Port==`80`]|[0].ListenerArn' --output text 2>/dev/null || true)
                                    if [ -n "$LISTENER_ARN" ] && [ "$LISTENER_ARN" != "None" ]; then
                                      terraform import aws_lb_listener.http "$LISTENER_ARN" || true
                                    fi
                                  fi
                                fi

                                # EC2 instance
                                if ! tf_state_has aws_instance.app; then
                                  INSTANCE_ID=$(aws ec2 describe-instances --filters Name=tag:Name,Values=mern-backend-ec2 Name=instance-state-name,Values=pending,running,stopping,stopped --query 'Reservations[0].Instances[0].InstanceId' --output text 2>/dev/null || true)
                                  if [ -n "$INSTANCE_ID" ] && [ "$INSTANCE_ID" != "None" ]; then
                                    terraform import aws_instance.app "$INSTANCE_ID" || true
                                  fi
                                fi

                                # Target group attachment (IP mode)
                                if ! tf_state_has aws_lb_target_group_attachment.app; then
                                  if [ -z "${TG_ARN:-}" ] || [ "${TG_ARN:-None}" = "None" ]; then
                                    TG_ARN=$(aws elbv2 describe-target-groups --names mern-backend-tg --query 'TargetGroups[0].TargetGroupArn' --output text 2>/dev/null || true)
                                  fi
                                  if [ -z "${INSTANCE_ID:-}" ] || [ "${INSTANCE_ID:-None}" = "None" ]; then
                                    INSTANCE_ID=$(aws ec2 describe-instances --filters Name=tag:Name,Values=mern-backend-ec2 Name=instance-state-name,Values=pending,running,stopping,stopped --query 'Reservations[0].Instances[0].InstanceId' --output text 2>/dev/null || true)
                                  fi
                                  if [ -n "${INSTANCE_ID:-}" ] && [ "${INSTANCE_ID:-None}" != "None" ]; then
                                    INSTANCE_IP=$(aws ec2 describe-instances --instance-ids "$INSTANCE_ID" --query 'Reservations[0].Instances[0].PrivateIpAddress' --output text 2>/dev/null || true)
                                    if [ -n "${TG_ARN:-}" ] && [ "${TG_ARN:-None}" != "None" ] && [ -n "${INSTANCE_IP:-}" ] && [ "${INSTANCE_IP:-None}" != "None" ]; then
                                      terraform import aws_lb_target_group_attachment.app "${TG_ARN}/${INSTANCE_IP}/8000" || true
                                    fi
                                  fi
                                fi
                              fi
                            fi

                            echo "Deploying to AWS..."
                            terraform apply -auto-approve \\
                              -var region=$AWS_DEFAULT_REGION \\
                              -var name=mern-backend \\
                              -var image_repo=$DOCKERHUB_USER/mern-backend \\
                              -var image_tag=$TAG_SHORT \\
                              -var app_port=8000
                        '''
                    }
                }
            }
        }

        stage('Verify EC2 SSH') {
            when {
                anyOf {
                    branch 'main'
                    expression { env.GIT_BRANCH == 'origin/main' }
                    expression { env.GIT_BRANCH == 'refs/heads/main' }
                }
            }
            steps {
                dir('infra') {
                    withCredentials([file(credentialsId: 'EC2_SSH_KEY_FILE', variable: 'EC2_KEY_FILE')]) {
                        sh '''
                            set -e
                            chmod 600 "$EC2_KEY_FILE"
                            EC2_IP=$(terraform output -raw ec2_public_ip)
                            if [ -z "$EC2_IP" ]; then
                              echo "No EC2 public IP from Terraform output."
                              exit 1
                            fi

                            echo "Checking SSH connectivity to $EC2_IP..."
                            for i in $(seq 1 18); do
                              SSH_OUTPUT=$(ssh -o BatchMode=yes -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=10 -i "$EC2_KEY_FILE" ec2-user@"$EC2_IP" 'echo SSH_OK' 2>&1 || true)
                              if echo "$SSH_OUTPUT" | grep -q "SSH_OK"; then
                                echo "SSH connected."
                                break
                              fi
                              echo "SSH attempt $i failed: $(echo "$SSH_OUTPUT" | tail -n 1)"
                              echo "SSH not ready yet (attempt $i/18). Waiting 10s..."
                              sleep 10
                              if [ "$i" -eq 18 ]; then
                                echo "SSH check failed after retries. Verify:"
                                echo "1) EC2 key pair name in terraform matches the private key in Jenkins credential EC2_SSH_KEY_FILE."
                                echo "2) Security group allows TCP/22 from Jenkins server public IP."
                                exit 1
                              fi
                            done

                            ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i "$EC2_KEY_FILE" ec2-user@"$EC2_IP" '
                              set -e
                              if command -v sudo >/dev/null 2>&1; then
                                sudo -n docker ps --format "{{.Names}} {{.Status}}" || sudo docker ps --format "{{.Names}} {{.Status}}"
                              else
                                docker ps --format "{{.Names}} {{.Status}}"
                              fi
                            '
                        '''
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
