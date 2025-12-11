#!/bin/bash

# AWS Deployment Script for AutoCheck Backend
# Usage: ./deploy.sh [environment] [region]

set -e

# Configuration
ENVIRONMENT=${1:-production}
AWS_REGION=${2:-us-east-1}
APP_NAME="autocheck"
ECR_REPOSITORY_NAME="${APP_NAME}-backend-${ENVIRONMENT}"

echo "🚀 Starting deployment for ${APP_NAME} in ${ENVIRONMENT} environment"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if Docker is installed and running
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install it first."
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "📋 AWS Account ID: ${AWS_ACCOUNT_ID}"

# ECR login
echo "🔐 Logging into Amazon ECR..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

# Check if ECR repository exists, create if not
echo "📦 Checking ECR repository..."
if ! aws ecr describe-repositories --repository-names ${ECR_REPOSITORY_NAME} --region ${AWS_REGION} &> /dev/null; then
    echo "🏗️ Creating ECR repository: ${ECR_REPOSITORY_NAME}"
    aws ecr create-repository --repository-name ${ECR_REPOSITORY_NAME} --region ${AWS_REGION}
fi

# Build Docker image
echo "🔨 Building Docker image..."
docker build --target production -t ${APP_NAME}:latest .

# Tag image for ECR
ECR_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY_NAME}"
docker tag ${APP_NAME}:latest ${ECR_URI}:latest
docker tag ${APP_NAME}:latest ${ECR_URI}:$(git rev-parse --short HEAD)

# Push image to ECR
echo "📤 Pushing image to ECR..."
docker push ${ECR_URI}:latest
docker push ${ECR_URI}:$(git rev-parse --short HEAD)

# Deploy CloudFormation stack (if it doesn't exist)
STACK_NAME="${APP_NAME}-infrastructure-${ENVIRONMENT}"
echo "☁️ Checking CloudFormation stack: ${STACK_NAME}"

if ! aws cloudformation describe-stacks --stack-name ${STACK_NAME} --region ${AWS_REGION} &> /dev/null; then
    echo "🏗️ Creating CloudFormation stack..."
    # You'll need to provide VPC and Subnet IDs for your environment
    read -p "Enter VPC ID: " VPC_ID
    read -p "Enter Subnet IDs (comma-separated): " SUBNET_IDS
    
    aws cloudformation create-stack \
        --stack-name ${STACK_NAME} \
        --template-body file://aws/cloudformation.yml \
        --parameters ParameterKey=Environment,ParameterValue=${ENVIRONMENT} \
                    ParameterKey=VpcId,ParameterValue=${VPC_ID} \
                    ParameterKey=SubnetIds,ParameterValue="${SUBNET_IDS}" \
        --capabilities CAPABILITY_IAM \
        --region ${AWS_REGION}
    
    echo "⏳ Waiting for stack creation to complete..."
    aws cloudformation wait stack-create-complete --stack-name ${STACK_NAME} --region ${AWS_REGION}
else
    echo "✅ CloudFormation stack already exists"
fi

# Get stack outputs
CLUSTER_NAME=$(aws cloudformation describe-stacks --stack-name ${STACK_NAME} --region ${AWS_REGION} --query 'Stacks[0].Outputs[?OutputKey==`ClusterName`].OutputValue' --output text)
ALB_DNS=$(aws cloudformation describe-stacks --stack-name ${STACK_NAME} --region ${AWS_REGION} --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerDNS`].OutputValue' --output text)
DB_ENDPOINT=$(aws cloudformation describe-stacks --stack-name ${STACK_NAME} --region ${AWS_REGION} --query 'Stacks[0].Outputs[?OutputKey==`DatabaseEndpoint`].OutputValue' --output text)

echo "📊 Stack Outputs:"
echo "   Cluster: ${CLUSTER_NAME}"
echo "   Load Balancer: ${ALB_DNS}"
echo "   Database: ${DB_ENDPOINT}"

# Create or update ECS service
SERVICE_NAME="${APP_NAME}-service-${ENVIRONMENT}"
TASK_DEFINITION_NAME="${APP_NAME}-task-${ENVIRONMENT}"

echo "🚢 Deploying to ECS..."

# Create task definition (you might want to use a separate file for this)
cat > task-definition.json << EOF
{
    "family": "${TASK_DEFINITION_NAME}",
    "networkMode": "awsvpc",
    "requiresCompatibilities": ["FARGATE"],
    "cpu": "1024",
    "memory": "2048",
    "executionRoleArn": "arn:aws:iam::${AWS_ACCOUNT_ID}:role/ecsTaskExecutionRole",
    "containerDefinitions": [
        {
            "name": "${APP_NAME}",
            "image": "${ECR_URI}:latest",
            "essential": true,
            "portMappings": [
                {
                    "containerPort": 3000,
                    "protocol": "tcp"
                }
            ],
            "environment": [
                {
                    "name": "NODE_ENV",
                    "value": "${ENVIRONMENT}"
                },
                {
                    "name": "PORT",
                    "value": "3000"
                },
                {
                    "name": "DB_HOST",
                    "value": "${DB_ENDPOINT}"
                }
            ],
            "logConfiguration": {
                "logDriver": "awslogs",
                "options": {
                    "awslogs-group": "/ecs/${APP_NAME}",
                    "awslogs-region": "${AWS_REGION}",
                    "awslogs-stream-prefix": "ecs"
                }
            },
            "healthCheck": {
                "command": [
                    "CMD-SHELL",
                    "curl -f http://localhost:3000/api/v1/health || exit 1"
                ],
                "interval": 30,
                "timeout": 5,
                "retries": 3,
                "startPeriod": 60
            }
        }
    ]
}
EOF

# Register task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json --region ${AWS_REGION}

# Clean up
rm task-definition.json

echo "🎉 Deployment completed successfully!"
echo "🌐 Your application will be available at: http://${ALB_DNS}"
echo "📝 Next steps:"
echo "   1. Configure your DNS to point to the load balancer"
echo "   2. Set up SSL certificate in AWS Certificate Manager"
echo "   3. Update the load balancer to use HTTPS"
echo "   4. Configure monitoring and logging"