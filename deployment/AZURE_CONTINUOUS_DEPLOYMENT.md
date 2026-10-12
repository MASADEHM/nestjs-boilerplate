# Azure App Service Continuous Deployment Setup (Azure Portal GUI)

This guide explains how to configure Azure App Service to automatically deploy when new container
images are pushed to your registry using the **Azure Portal**.

## Overview

With this approach:

- **GitHub Actions**: Only builds and pushes Docker images
- **Azure App Service**: Automatically deploys new images
- **Azure Portal**: Configure all resources, environment variables and continuous deployment

## Benefits

✅ **GUI-based setup**: No CLI commands needed ✅ **Visual management**: Easy to see and modify
configurations  
✅ **Simpler workflow**: GitHub only handles CI (build/push) ✅ **Native Azure features**: Use
Azure's built-in deployment capabilities ✅ **Faster deployments**: No GitHub Actions overhead

## Setup Steps

### 1. Create Azure Resources (Azure Portal)

#### Create Resource Group

1. Go to **Azure Portal** → **Resource groups**
2. Click **+ Create**
3. Fill in:
   - **Resource group name**: `berth-lease-dev`
   - **Region**: `UAE North`
4. Click **Review + create** → **Create**

#### Create App Service Plan

1. Go to **Azure Portal** → **App Service plans**
2. Click **+ Create**
3. Fill in:
   - **Resource group**: Select `berth-lease-dev`
   - **Name**: `ASP-Marsa-api-dev`
   - **Operating System**: `Linux`
   - **Region**: `UAE North`
   - **Pricing plan**: `Basic B1` (or as needed)
4. Click **Review + create** → **Create**

#### Create App Service

1. Go to **Azure Portal** → **App Services**
2. Click **+ Create**
3. Fill in:
   - **Resource group**: Select `berth-lease-dev`
   - **Name**: `Marsa-api-dev`
   - **Publish**: `Container`
   - **Operating System**: `Linux`
   - **Region**: `UAE North`
   - **App Service Plan**: Select `ASP-Marsa-api-dev`
4. Click **Next: Container**
5. Configure container:
   - **Image Source**: `Azure Container Registry`
   - **Registry**: Select your container registry
   - **Image**: `Marsa-api-dev`
   - **Tag**: `latest` (will be updated by continuous deployment)
6. Click **Review + create** → **Create**

### 2. Configure Continuous Deployment (Azure Portal)

1. Go to your **App Service** → **Deployment Center**
2. In **Settings** tab:
   - **Source**: `Container Registry`
   - **Registry**: Select your **Azure Container Registry**
   - **Repository**: `Marsa-api-dev` (or your environment-specific image name)
   - **Tag**: `latest`
3. **Enable Continuous Deployment**: Toggle **ON**
4. Click **Save**

> This creates a webhook that triggers deployment when new images are pushed to your registry.

### 3. Configure Environment Variables (Azure Portal)

1. Go to your **App Service** → **Settings** → **Environment variables**
2. Click **+ Add** for each variable or use **Advanced edit** to import JSON:

#### Example Variables

- **Name**: `NODE_ENV` **Value**: `development`
- **Name**: `DATABASE_URL` **Value**: `postgresql://user:password@host:5432/database`

> **💡 Tip**: Use the JSON file in `deployment/azure-app-service-environment-variables.json` for all
> required variables. You can import them using **Advanced edit**.

3. Click **Apply** after adding all settings

### 4. Configure Health Check (Azure Portal)

1. Go to your **App Service** → **Health check**
2. **Health check**: Select **Enable**
3. **Path**: `/health`
4. Click **Save**

## Environment-Specific Setup

### Development Environment

- **Resource Group**: `berth-lease-dev`
- **App Service Plan**: `ASP-Marsa-api-dev`
- **App Service**: `Marsa-api-dev`
- **Container Image**: `Marsa-api-dev:latest`
- **NODE_ENV**: `development`

### Staging Environment

- **Resource Group**: `berth-lease-staging`
- **App Service Plan**: `ASP-Marsa-api-staging`
- **App Service**: `Marsa-api-staging`
- **Container Image**: `Marsa-api-staging:latest`
- **NODE_ENV**: `staging`

### Production Environment

- **Resource Group**: `berth-lease-prod`
- **App Service Plan**: `ASP-Marsa-api-prod`
- **App Service**: `Marsa-api-prod`
- **Container Image**: `Marsa-api-prod:latest`
- **NODE_ENV**: `production`

## Deployment Flow

```mermaid
graph LR
    A[Push Code] --> B[GitHub Actions]
    B --> C[Build Docker Image]
    C --> D[Push to Registry]
    D --> E[Registry Webhook]
    E --> F[Azure App Service]
    F --> G[Pull New Image]
    G --> H[Deploy Container]
    H --> I[Application Running]

    style A fill:#e1f5fe
    style B fill:#e8f5e8
    style C fill:#e8f5e8
    style D fill:#e8f5e8
    style E fill:#fff3e0
    style F fill:#e3f2fd
    style G fill:#e3f2fd
    style H fill:#e3f2fd
    style I fill:#e8f5e8
```

## Monitoring and Management (Azure Portal)

### View Deployment History

1. Go to **App Service** → **Deployment Center** → **Logs**
2. See all deployments triggered by container registry webhooks

### View Application Logs

1. Go to **App Service** → **Log stream**
2. See real-time application logs

### Scale Application

1. Go to **App Service** → **Scale up (App Service plan)**
2. Choose appropriate pricing tier
3. Or go to **Scale out (App Service plan)** for horizontal scaling

### Monitor Performance

1. Go to **App Service** → **Application Insights**
2. Enable Application Insights for detailed monitoring

## Troubleshooting (Azure Portal)

### Check Container Logs

1. Go to **App Service** → **Log stream**
2. Select **Container logs** to see Docker container output

### Verify Container Registry Connection

1. Go to **App Service** → **Deployment Center** → **Settings**
2. Check registry connection status

### Manual Deployment Trigger

1. Go to **App Service** → **Deployment Center** → **Settings**
2. Click **Sync** to manually trigger deployment

### Rollback Deployment

1. Go to **App Service** → **Deployment Center** → **Settings**
2. Change **Tag** to previous version
3. Click **Save** to deploy previous image

## Security Best Practices

1. **Enable HTTPS only**: App Service → **TLS/SSL settings** → **HTTPS Only**: ON
2. **Configure authentication**: App Service → **Authentication** (if needed)
3. **Set up managed identity**: App Service → **Identity** → **System assigned**: ON
4. **Use Key Vault**: Store sensitive settings in Azure Key Vault and reference them
5. **Configure IP restrictions**: App Service → **Networking** → **Access Restrictions**

## Cost Optimization

1. **Choose appropriate pricing tier**: Start with Basic B1, scale up as needed
2. **Use staging slots**: For zero-downtime deployments (Standard tier and above)
3. **Enable auto-scaling**: Scale out based on CPU/memory usage
4. **Monitor costs**: Use Azure Cost Management to track spending

This approach gives you complete control through the Azure Portal GUI without needing any CLI
commands! 🚀
