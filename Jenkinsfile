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

                                # IAM execution role
                                if ! tf_state_has aws_iam_role.task_execution; then
                                  ROLE_NAME=$(aws iam get-role --role-name mern-backend-exec-role --query 'Role.RoleName' --output text 2>/dev/null || true)
                                  if [ -n "$ROLE_NAME" ] && [ "$ROLE_NAME" != "None" ]; then
                                    terraform import aws_iam_role.task_execution "$ROLE_NAME" || true
                                  fi
                                fi

                                # Role policy attachment
                                if ! tf_state_has aws_iam_role_policy_attachment.task_execution; then
                                  ATTACHED=$(aws iam list-attached-role-policies --role-name mern-backend-exec-role --query 'AttachedPolicies[?PolicyArn==`arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy`]|length(@)' --output text 2>/dev/null || true)
                                  if [ "$ATTACHED" = "1" ]; then
                                    terraform import aws_iam_role_policy_attachment.task_execution "mern-backend-exec-role/arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy" || true
                                  fi
                                fi

                                # Log group
                                if ! tf_state_has aws_cloudwatch_log_group.this; then
                                  LOG_GROUP_NAME=$(aws logs describe-log-groups --log-group-name-prefix "/ecs/mern-backend" --query 'logGroups[?logGroupName==`/ecs/mern-backend`]|[0].logGroupName' --output text 2>/dev/null || true)
                                  if [ "$LOG_GROUP_NAME" = "/ecs/mern-backend" ]; then
                                    terraform import aws_cloudwatch_log_group.this "/ecs/mern-backend" || true
                                  fi
                                fi

                                # ECS Cluster
                                if ! tf_state_has aws_ecs_cluster.this; then
                                  CLUSTER_ARN=$(aws ecs describe-clusters --clusters mern-backend-cluster --query 'clusters[0].clusterArn' --output text 2>/dev/null || true)
                                  if [ -n "$CLUSTER_ARN" ] && [ "$CLUSTER_ARN" != "None" ] && [ "$CLUSTER_ARN" != "MISSING" ]; then
                                    terraform import aws_ecs_cluster.this "$CLUSTER_ARN" || true
                                  fi
                                fi

                                # ECS Service
                                if ! tf_state_has aws_ecs_service.this; then
                                  SVC_STATUS=$(aws ecs describe-services --cluster mern-backend-cluster --services mern-backend-svc --query 'services[0].status' --output text 2>/dev/null || true)
                                  if [ -n "$SVC_STATUS" ] && [ "$SVC_STATUS" != "None" ] && [ "$SVC_STATUS" != "MISSING" ]; then
                                    terraform import aws_ecs_service.this "mern-backend-cluster/mern-backend-svc" || true
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
    }

    post {
        always {
            // Clean up old images to save space
            sh 'docker image prune -f || true'
        }
    }
}
