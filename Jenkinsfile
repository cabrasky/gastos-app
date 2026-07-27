// ── gastos-app CI/CD Pipeline ─────────────────────
// Builds Docker images, pushes to registry, deploys to k3s

pipeline {
    agent any

    environment {
        REGISTRY = "192.168.1.11:5000"
        BACKEND_IMAGE = "${REGISTRY}/gastos-backend"
        FRONTEND_IMAGE = "${REGISTRY}/gastos-frontend"
        KUBECONFIG = "/var/lib/jenkins/.kube/config"
        PROD_NAMESPACE = "gastos"
        APP_DOMAIN = "gastos.cabrasky.net"
    }

    parameters {
        booleanParam(
            name: 'FORCE_DEPLOY',
            defaultValue: false,
            description: 'Force deploy even if same tag already exists'
        )
        booleanParam(
            name: 'FORCE_PRODUCTION',
            defaultValue: false,
            description: 'Force deploy as production (ignore branch)'
        )
        string(
            name: 'DEPLOY_ID',
            defaultValue: '',
            description: 'Preview namespace slug. Auto-derived from branch if blank.'
        )
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Read Version') {
            steps {
                script {
                    def pkg = sh(script: "jq -r .version package.json", returnStdout: true).trim()
                    env.APP_VERSION = pkg
                    env.GIT_SHORT = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                }
            }
        }

        stage('Detect Branch Type') {
            steps {
                script {
                    env.BRANCH_NAME = env.BRANCH_NAME ?: sh(script: 'git rev-parse --abbrev-ref HEAD', returnStdout: true).trim()
                    env.IS_MAIN = (env.BRANCH_NAME == 'main').toString()
                    echo "Branch: ${env.BRANCH_NAME} (is_main: ${env.IS_MAIN})"

                    if (params.FORCE_PRODUCTION) {
                        env.IS_MAIN = 'true'
                        echo "→ FORCE_PRODUCTION=true — deploying as production"
                    }

                    if (env.IS_MAIN == 'true') {
                        env.DEPLOY_NAMESPACE = PROD_NAMESPACE
                        env.IMAGE_TAG = "${env.APP_VERSION}-${env.GIT_SHORT}"
                    } else {
                        def rawBranch = env.BRANCH_NAME
                        env.BRANCH_SAFE = sh(
                            script: "python3 -c \"import re; b='${rawBranch}'; b=re.sub(r'[^a-zA-Z0-9]','-',b); b=re.sub(r'-+','-',b); b=b.strip('-').lower(); print(b)\"",
                            returnStdout: true
                        ).trim()
                        def slug = params.DEPLOY_ID ?: env.BRANCH_SAFE
                        env.DEPLOY_NAMESPACE = "gastos-preview-${slug}"
                        env.IMAGE_TAG = slug
                        echo "→ Branch deployment: ${env.BRANCH_NAME}"
                        echo "  Namespace: ${env.DEPLOY_NAMESPACE}"
                        echo "  Image tag: ${env.IMAGE_TAG}"
                    }
                }
            }
        }

        stage('Check Image Exists') {
            when {
                expression { return env.IS_MAIN == 'true' && !params.FORCE_DEPLOY }
            }
            steps {
                script {
                    def skips = []
                    for (img in ['gastos-backend', 'gastos-frontend']) {
                        def manifestUrl = "${REGISTRY}/v2/${img}/manifests/${env.IMAGE_TAG}"
                        def exists = sh(
                            script: "curl -s -o /dev/null -w '%{http_code}' http://${manifestUrl}",
                            returnStdout: true
                        ).trim() == "200"
                        if (exists) {
                            echo "Image ${img}:${env.IMAGE_TAG} already exists — skipping build"
                            skips << img
                        }
                    }
                    if (skips.size() == 2) {
                        env.SKIP_BUILD = 'true'
                    }
                }
            }
        }

        stage('Build Backend') {
            when {
                expression { env.SKIP_BUILD != 'true' }
            }
            steps {
                script {
                    sh "DOCKER_BUILDKIT=0 docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} -f backend/Dockerfile backend/"
                    sh "docker push ${BACKEND_IMAGE}:${IMAGE_TAG}"
                    if (env.IS_MAIN == 'true') {
                        sh "docker tag ${BACKEND_IMAGE}:${IMAGE_TAG} ${BACKEND_IMAGE}:latest"
                        sh "docker push ${BACKEND_IMAGE}:latest"
                    }
                }
            }
        }

        stage('Build Frontend') {
            when {
                expression { env.SKIP_BUILD != 'true' }
            }
            steps {
                script {
                    sh "DOCKER_BUILDKIT=0 docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} -f Dockerfile.frontend ."
                    sh "docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}"
                    if (env.IS_MAIN == 'true') {
                        sh "docker tag ${FRONTEND_IMAGE}:${IMAGE_TAG} ${FRONTEND_IMAGE}:latest"
                        sh "docker push ${FRONTEND_IMAGE}:latest"
                    }
                }
            }
        }

        stage('Deploy to k3s') {
            steps {
                script {
                    if (env.IS_MAIN == 'true') {
                        // ── PRODUCTION DEPLOYMENT ──
                        sh """
                            kubectl apply -k k8s/overlays/production
                        """
                        sh """
                            kubectl rollout restart deployment/backend -n ${PROD_NAMESPACE}
                            kubectl rollout restart deployment/frontend -n ${PROD_NAMESPACE}
                        """
                        echo "Production: https://${APP_DOMAIN}"
                    } else {
                        // ── PREVIEW / BRANCH DEPLOYMENT ──
                        def deployNs = env.DEPLOY_NAMESPACE
                        sh """
                            kubectl create namespace ${deployNs} --dry-run=client -o yaml | kubectl apply -f -
                            kubectl kustomize k8s/overlays/preview | \
                                sed 's/gastos-preview/${deployNs}/g' | \
                                kubectl apply -n ${deployNs} -f -
                        """
                        echo "Preview: https://${deployNs}.${APP_DOMAIN}"
                    }
                }
            }
        }

        stage('Verify Rollout') {
            steps {
                script {
                    def timeoutSeconds = 180
                    def ns = env.DEPLOY_NAMESPACE
                    for (deploy in ['backend', 'frontend']) {
                        try {
                            sh "kubectl rollout status deployment/${deploy} -n ${ns} --timeout=${timeoutSeconds}s"
                            echo "${deploy} rollout complete (${ns})"
                        } catch (err) {
                            error "${deploy} rollout failed in ${ns}!"
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            sh 'docker image prune -f || true'
        }
        failure {
            echo '❌ Pipeline failed — check logs'
        }
        success {
            script {
                echo "✅ gastos-app deployed successfully (${env.DEPLOY_NAMESPACE})"
                if (env.IS_MAIN == 'true') {
                    echo "   URL: https://${APP_DOMAIN}"
                } else {
                    echo "   URL: https://${env.DEPLOY_NAMESPACE}.${APP_DOMAIN}"
                }
            }
        }
    }
}
