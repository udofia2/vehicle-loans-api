# AWS Deployment Guide for AutoCheck Backend

## 🏗️ Architecture Overview

The AutoCheck backend is designed to run on AWS using the following services:

### **Recommended AWS Services:**

1. **AWS ECS (Fargate)** - Container orchestration
2. **AWS RDS (PostgreSQL)** - Managed database
3. **AWS ElastiCache (Redis)** - Caching layer
4. **AWS Application Load Balancer** - Load balancing
5. **AWS ECR** - Container registry
6. **AWS CloudWatch** - Monitoring and logging
7. **AWS Secrets Manager** - Secure configuration
8. **AWS Route 53** - DNS management
9. **AWS Certificate Manager** - SSL certificates

### **Alternative Options:**

- **AWS Lambda + API Gateway** (for serverless)
- **AWS EKS** (for Kubernetes)
- **AWS Elastic Beanstalk** (for simplified deployment)

## 🚀 Deployment Options

### Option 1: ECS Fargate (Recommended)

**Best for**: Production applications requiring scalability and managed infrastructure

**Pros:**

- Serverless containers (no EC2 management)
- Auto-scaling capabilities
- Integrated with AWS services
- Cost-effective for varying workloads

**Estimated Costs (us-east-1):**

- ECS Fargate: ~$30-50/month (2 vCPU, 4GB RAM)
- RDS (db.t3.micro): ~$15/month
- ALB: ~$16/month
- ElastiCache: ~$15/month
- **Total: ~$76-96/month**

### Option 2: AWS Lambda + API Gateway

**Best for**: Low-traffic applications or microservices

**Pros:**

- Pay-per-request pricing
- Zero server management
- Automatic scaling
- Built-in high availability

**Cons:**

- Cold start latency
- 15-minute execution limit
- Complex for NestJS applications

### Option 3: AWS Elastic Beanstalk

**Best for**: Quick deployment with minimal configuration

**Pros:**

- Easy deployment
- Automatic scaling
- Health monitoring
- Multiple platform support

**Cons:**

- Less control over infrastructure
- Can be more expensive
- Limited customization

### Option 4: AWS EKS (Kubernetes)

**Best for**: Complex microservices architecture

**Pros:**

- Full Kubernetes features
- Portable across cloud providers
- Advanced networking and security

**Cons:**

- Higher complexity
- More expensive ($72/month for control plane alone)
- Requires Kubernetes expertise

## 🛠️ Pre-Deployment Setup

### 1. AWS CLI Configuration

```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS CLI
aws configure
# AWS Access Key ID: [Your Access Key]
# AWS Secret Access Key: [Your Secret Key]
# Default region: us-east-1
# Default output format: json
```

### 2. Docker Setup

```bash
# Install Docker (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

### 3. Required IAM Permissions

Create an IAM user with the following policies:

- `AmazonECS_FullAccess`
- `AmazonEC2ContainerRegistryFullAccess`
- `AmazonRDSFullAccess`
- `ElastiCacheFullAccess`
- `CloudFormationFullAccess`
- `IAMFullAccess` (for creating roles)

## 📦 Local Development with Docker

### Build and run locally:

```bash
# Development environment
docker-compose up --build

# Production-like environment
docker-compose -f docker-compose.prod.yml up --build
```

### Access the application:

- API: http://localhost:3000/api/v1
- Swagger Docs: http://localhost:3000/api/docs
- Health Check: http://localhost:3000/api/v1/health

## ☁️ AWS Deployment Steps

### 1. Deploy Infrastructure

```bash
# Make script executable
chmod +x deploy.sh

# Deploy to AWS
./deploy.sh production us-east-1
```

### 2. Manual Infrastructure Setup (Alternative)

```bash
# Create VPC and networking (if needed)
aws cloudformation create-stack \
    --stack-name autocheck-vpc \
    --template-body file://aws/vpc.yml \
    --region us-east-1

# Deploy main infrastructure
aws cloudformation create-stack \
    --stack-name autocheck-infrastructure \
    --template-body file://aws/cloudformation.yml \
    --parameters ParameterKey=Environment,ParameterValue=production \
    --capabilities CAPABILITY_IAM \
    --region us-east-1
```

### 3. Environment Variables Setup

```bash
# Store secrets in AWS Secrets Manager
aws secretsmanager create-secret \
    --name autocheck/production \
    --description "AutoCheck production secrets" \
    --secret-string '{
        "VIN_API_KEY": "your_vin_api_key",
        "VALUATION_API_KEY": "your_valuation_api_key",
        "JWT_SECRET": "your_jwt_secret",
        "DB_PASSWORD": "your_db_password"
    }' \
    --region us-east-1
```

## 🔧 Post-Deployment Configuration

### 1. Database Setup

```bash
# Connect to RDS instance and run migrations
# (You may need to set up a bastion host or VPN)
npm run migration:run
```

### 2. SSL Certificate

```bash
# Request SSL certificate
aws acm request-certificate \
    --domain-name api.yourdomain.com \
    --subject-alternative-names "*.yourdomain.com" \
    --validation-method DNS \
    --region us-east-1
```

### 3. Domain Configuration

```bash
# Create Route 53 hosted zone
aws route53 create-hosted-zone \
    --name yourdomain.com \
    --caller-reference $(date +%s)
```

## 📊 Monitoring and Logging

### CloudWatch Dashboards

```bash
# Create custom dashboard for monitoring
aws cloudwatch put-dashboard \
    --dashboard-name "AutoCheck-Production" \
    --dashboard-body file://aws/dashboard.json
```

### Log Aggregation

- Application logs: CloudWatch Logs
- Database logs: RDS Enhanced Monitoring
- Load balancer logs: S3 bucket

### Alerts

- High error rates
- Database connection issues
- High response times
- Resource utilization

## 🔄 CI/CD Pipeline (Optional)

### GitHub Actions Example

```yaml
name: Deploy to AWS ECS
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      - name: Deploy
        run: ./deploy.sh production
```

## 💰 Cost Optimization

### Development Environment

- Use smaller instance sizes
- Use Spot instances where possible
- Schedule auto-shutdown during off-hours
- Use single AZ deployment

### Production Environment

- Reserved Instances for predictable workloads
- Auto Scaling for variable workloads
- Regular cost monitoring
- Optimize container resource allocation

## 🔒 Security Best Practices

1. **Network Security**
   - Use VPC with private subnets
   - Security groups with minimal permissions
   - WAF for additional protection

2. **Data Security**
   - Encrypt data at rest (RDS, EBS)
   - Encrypt data in transit (TLS/SSL)
   - Regular backups and testing

3. **Access Control**
   - IAM roles with least privilege
   - Secrets Manager for sensitive data
   - Multi-factor authentication

4. **Monitoring**
   - CloudTrail for audit logs
   - GuardDuty for threat detection
   - Regular security assessments

## 🚨 Troubleshooting

### Common Issues

1. **Container won't start**
   - Check CloudWatch logs
   - Verify environment variables
   - Test locally with Docker

2. **Database connection fails**
   - Verify security groups
   - Check RDS endpoint
   - Test connectivity from ECS

3. **Load balancer health checks fail**
   - Verify health endpoint
   - Check container startup time
   - Review security group rules

### Useful Commands

```bash
# View ECS service logs
aws logs tail /ecs/autocheck --follow

# Check ECS service status
aws ecs describe-services --cluster autocheck --services autocheck-service

# List running tasks
aws ecs list-tasks --cluster autocheck
```
