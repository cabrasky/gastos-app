// ============================================================================
// Jenkinsfile — gastos-app CI/CD pipeline
// ============================================================================
// Triggers:
//   backend/**  → test BE, build BE image
//   frontend/** → build FE image
//   k8s/** docker-compose* Jenkinsfile → deploy only
//   main        → production deploy
//   PR branch   → preview deploy
// ============================================================================

pipeline {
    agent any

    parameters {
        booleanParam(name: 'FORCE_PREVIEW_DEPLOY', defaultValue: false,
            description: 'Deploy as preview (skips main-only guard).')
        string(name: 'DEPLOY_ID', defaultValue: '',
            description: 'Preview namespace slug. Auto-derived from branch if blank.')
        booleanParam(name: 'FORCE_REBUILD', defaultValue: false,
            description: 'Force full rebuild even when no code changes.')
        booleanParam(name: 'FORCE_PROD_DEPLOY', defaultValue: false,
            description: 'Redeploy existing images to production (main only).')
    }

    environment {
        REGISTRY        = "192.168.1.11:5000"
        BACKEND_IMAGE   = "${REGISTRY}/gastos-backend"
        FRONTEND_IMAGE  = "${REGISTRY}/gastos-frontend"
        KUBECONFIG      = "/var/lib/jenkins/.kube/config"
        PROD_NAMESPACE  = "gastos"
        APP_DOMAIN      = "gastos.cabrasky.net"
    }

    stages {

        // ════════════════════════════════════════════════════════════════════
        // 1. Detect changes
        // ════════════════════════════════════════════════════════════════════
        stage('Detect Changes') {
            steps {
                script {
                    def changed = sh(script: "git diff --name-only ${env.CHANGE_TARGET ? "origin/${env.CHANGE_TARGET}..." : "HEAD~1"} HEAD", returnStdout: true).trim()
                    env.BE_CHANGED = changed.contains('backend/') ? 'true' : 'false'
                    env.FE_CHANGED = changed.contains('src/') || changed.contains('dist/') ? 'true' : 'false'
                    env.INFRA_CHANGED = changed.contains('k8s/') || changed.contains('docker-compose') || changed.contains('Jenkinsfile') ? 'true' : 'false'
                    env.IS_MAIN = (env.BRANCH_NAME == 'main') ? 'true' : 'false'
                    env.IS_PR = (env.CHANGE_ID) ? 'true' : 'false'
                    env.IS_PREVIEW = (env.IS_PR == 'true' || env.FORCE_PREVIEW_DEPLOY == 'true') ? 'true' : 'false'

                    if (params.FORCE_REBUILD) {
                        env.BE_CHANGED = 'true'; env.FE_CHANGED = 'true'
                    }
                    if (params.FORCE_PROD_DEPLOY && env.IS_MAIN == 'true') {
                        env.BE_CHANGED = 'true'; env.FE_CHANGED = 'true'
                    }

                    echo "Branch: ${env.BRANCH_NAME} | Main: ${env.IS_MAIN} | PR: ${env.IS_PR}"
                    echo "BE changed: ${env.BE_CHANGED} | FE changed: ${env.FE_CHANGED} | Infra changed: ${env.INFRA_CHANGED}"
                }
            }
        }

        // ════════════════════════════════════════════════════════════════════
        // 2. Build backend image
        // ════════════════════════════════════════════════════════════════════
        stage('Build Backend') {
            when { expression { env.BE_CHANGED == 'true' } }
            steps {
                script {
                    docker.build("${BACKEND_IMAGE}:${env.BUILD_TAG}", "./backend")
                    docker.tag("${BACKEND_IMAGE}:${env.BUILD_TAG}", "${BACKEND_IMAGE}:latest")
                    sh "docker push ${BACKEND_IMAGE}:${env.BUILD_TAG}"
                    sh "docker push ${BACKEND_IMAGE}:latest"
                }
            }
        }

        // ════════════════════════════════════════════════════════════════════
        // 3. Build frontend image
        // ════════════════════════════════════════════════════════════════════
        stage('Build Frontend') {
            when { expression { env.FE_CHANGED == 'true' } }
            steps {
                script {
                    docker.build("${FRONTEND_IMAGE}:${env.BUILD_TAG}", "-f docker-compose.frontend.Dockerfile .")
                    docker.tag("${FRONTEND_IMAGE}:${env.BUILD_TAG}", "${FRONTEND_IMAGE}:latest")
                    sh "docker push ${FRONTEND_IMAGE}:${env.BUILD_TAG}"
                    sh "docker push ${FRONTEND_IMAGE}:latest"
                }
            }
        }

        // ════════════════════════════════════════════════════════════════════
        // 4. Deploy
        // ════════════════════════════════════════════════════════════════════
        stage('Deploy') {
            when {
                expression {
                    (env.BE_CHANGED == 'true' || env.FE_CHANGED == 'true' || env.INFRA_CHANGED == 'true' ||
                     params.FORCE_PROD_DEPLOY || params.FORCE_PREVIEW_DEPLOY) &&
                    !(env.BRANCH_NAME ==~ /.*(README|docs).*/)
                }
            }
            steps {
                script {
                    if (env.IS_PREVIEW == 'true') {
                        // Preview deploy
                        def slug = params.DEPLOY_ID ?: env.BRANCH_NAME.replaceAll(/[^a-zA-Z0-9-]/, '-').take(40)
                        env.PREVIEW_NS = "gastos-preview-${slug}"
                        sh """
                            kubectl create namespace ${env.PREVIEW_NS} --dry-run=client -o yaml | kubectl apply -f -
                            kubectl kustomize k8s/overlays/preview | \
                                sed 's/gastos-preview/${env.PREVIEW_NS}/g' | \
                                kubectl apply -n ${env.PREVIEW_NS} -f -
                            kubectl rollout status deployment/backend -n ${env.PREVIEW_NS} --timeout=5m
                            kubectl rollout status deployment/frontend -n ${env.PREVIEW_NS} --timeout=5m
                        """
                        echo "Preview: https://${slug}.${APP_DOMAIN}"
                    } else if (env.IS_MAIN == 'true') {
                        // Production deploy
                        sh """
                            kubectl apply -k k8s/overlays/production
                            kubectl rollout status deployment/backend -n ${PROD_NAMESPACE} --timeout=5m
                            kubectl rollout status deployment/frontend -n ${PROD_NAMESPACE} --timeout=5m
                        """
                        echo "Production: https://${APP_DOMAIN}"
                    }
                }
            }
        }
    }

    post {
        failure {
            echo "Pipeline failed for ${env.BRANCH_NAME}"
        }
        always {
            cleanWs()
        }
    }
}
