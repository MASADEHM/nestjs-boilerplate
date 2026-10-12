# 🖥️ Manual Azure Portal Setup Guide

Complete step-by-step guide to manually create Azure resources for the Marsa API using the Azure
Portal GUI (no Terraform required).

## 📋 Overview

This guide creates the same infrastructure as the automated Terraform deployment, but manually
through the Azure Portal interface.

**⏱️ Estimated Time:** 45-60 minutes  
**💰 Cost:** Same as automated deployment (~$49 dev / ~$241 prod)  
**🌍 Recommended Region:** UAE North (Dubai)

---

## 🎯 Prerequisites

- ✅ **Azure Subscription** with Contributor permissions
- ✅ **Web Browser** to access Azure Portal
- ✅ **GitHub Repository** for the API (for later GitHub Actions setup)

---

## 📂 Phase 1: Create Resource Group (5 minutes)

### Step 1: Create Main Resource Group

1. **Open Azure Portal**: https://portal.azure.com
2. **Search for "Resource groups"** in the top search bar
3. **Click "Create"**
4. **Fill in details**:
   ```
   Subscription: [Your subscription]
   Resource group: Marsa-api-dev-rg
   Region: UAE North (recommended for Dubai)
   ```
5. **Click "Review + create"** → **Create**

---

## 🗄️ Phase 2: Create PostgreSQL Database (10 minutes)

### Step 2: Create PostgreSQL Flexible Server

1. **Search for "Azure Database for PostgreSQL"**
2. **Click "Create"** → **Flexible server**
3. **Basic Configuration**:

   ```
   Resource group: Marsa-api-dev-rg
   Server name: Marsa-api-dev-psql
   Region: UAE North
   PostgreSQL version: 13
   Workload type: Development
   ```

4. **Administrator Account**:

   ```
   Admin username: Marsa_admin
   Password: [Generate strong password - save this!]
   Confirm password: [Same password]
   ```

5. **Compute + Storage**:
   - **Development**: Burstable, B1ms (1 vCore, 2 GB RAM)
   - **Production**: General Purpose, D2s_v3 (2 vCores, 8 GB RAM)
   - **Storage**: 32 GB (dev) / 64 GB (prod)

6. **Networking**:
   - **Connectivity method**: Public access (selected IP addresses)
   - **Allow public access from any Azure service**: ✅ Checked
   - **Add current client IP**: ✅ Checked

7. **Click "Review + create"** → **Create**

### Step 3: Create Database

1. **Go to your PostgreSQL server** → **Databases**
2. **Click "Add"**
3. **Database name**: `Marsa_api_dev`
4. **Click "Save"**

---

## ⚡ Phase 3: Create Redis Cache (8 minutes)

### Step 4: Create Azure Cache for Redis

1. **Search for "Azure Cache for Redis"**
2. **Click "Create"**
3. **Basic Configuration**:

   ```
   Resource group: Marsa-api-dev-rg
   DNS name: Marsa-api-dev-redis
   Location: UAE North
   Cache type:
     - Development: Basic C0 (250 MB)
     - Production: Standard C1 (1 GB)
   ```

4. **Advanced Settings**:
   - **Non-SSL port**: Disabled
   - **Minimum TLS version**: 1.2
   - **Redis version**: 6

5. **Click "Review + create"** → **Create**

---

## 🔐 Phase 4: Create Key Vault (8 minutes)

### Step 5: Create Key Vault

1. **Search for "Key vaults"**
2. **Click "Create"**
3. **Basic Configuration**:

   ```
   Resource group: Marsa-api-dev-rg
   Key vault name: Marsa-api-dev-kv
   Region: UAE North
   Pricing tier: Standard
   ```

4. **Access Configuration**:
   - **Permission model**: Vault access policy
   - **Azure Virtual Machines**: Enabled
   - **Azure App Service**: Enabled

5. **Click "Review + create"** → **Create**

### Step 6: Add Key Vault Secrets

After Key Vault is created:

1. **Go to Key Vault** → **Secrets**
2. **Add these secrets** (click "Generate/Import" for each):

   **Database Connection**:

   ```
   Name: database-connection-string
   Value: postgresql://Marsa_admin:[YOUR_DB_PASSWORD]@Marsa-api-dev-psql.postgres.database.azure.com:5432/Marsa_api_dev?sslmode=require
   ```

   **JWT Secrets** (generate using `openssl rand -base64 32`):

   ```
   Name: jwt-admin-secret
   Value: [Generated admin JWT secret]

   Name: jwt-user-secret
   Value: [Generated user JWT secret]
   ```

   **Bull Board Dashboard**:

   ```
   Name: bull-board-username
   Value: admin

   Name: bull-board-password
   Value: [Your secure password]
   ```

   **Frontend Configuration**:

   ```
   Name: frontend-url
   Value: https://your-frontend-domain.com

   Name: cors-allowed-origins
   Value: https://your-frontend-domain.com
   ```

   **Redis Password**:

   ```
   Name: redis-password
   Value: [Get from Redis → Access keys → Primary access key]
   ```

---

## 📊 Phase 5: Create Application Insights (5 minutes)

### Step 7: Create Application Insights

1. **Search for "Application Insights"**
2. **Click "Create"**
3. **Configuration**:

   ```
   Resource group: Marsa-api-dev-rg
   Name: Marsa-api-dev-ai
   Region: UAE North
   Resource Mode: Workspace-based
   ```

4. **Log Analytics Workspace**:
   - **Create new**: `Marsa-api-dev-law`
   - **Region**: UAE North

5. **Click "Review + create"** → **Create**

---

## 🌐 Phase 6: Create App Service (15 minutes)

### Step 8: Create App Service Plan

1. **Search for "App Service plans"**
2. **Click "Create"**
3. **Configuration**:

   ```
   Resource group: Marsa-api-dev-rg
   Name: Marsa-api-dev-asp
   Operating System: Linux
   Region: UAE North
   Pricing Tier:
     - Development: Basic B1
     - Production: Premium P1v3
   ```

4. **Click "Review + create"** → **Create**

### Step 9: Create App Service

1. **Search for "App Services"**
2. **Click "Create"** → **Web App**
3. **Basic Configuration**:

   ```
   Resource group: Marsa-api-dev-rg
   Name: Marsa-api-dev-app
   Publish: Code
   Runtime stack: Node 22 LTS
   Operating System: Linux
   Region: UAE North
   App Service Plan: Marsa-api-dev-asp
   ```

4. **Click "Review + create"** → **Create**

### Step 10: Configure App Service Settings

After App Service is created:

1. **Go to App Service** → **Configuration** → **Application settings**
2. **Add these environment variables**:

   ```
   NODE_ENV = development (or production)
   DATABASE_URL = @Microsoft.KeyVault(VaultName=Marsa-api-dev-kv;SecretName=database-connection-string)
   JWT_ADMIN_SECRET = @Microsoft.KeyVault(VaultName=Marsa-api-dev-kv;SecretName=jwt-admin-secret)
   JWT_USER_SECRET = @Microsoft.KeyVault(VaultName=Marsa-api-dev-kv;SecretName=jwt-user-secret)
   REDIS_HOST = Marsa-api-dev-redis.redis.cache.windows.net
   REDIS_PORT = 6380
   REDIS_PASSWORD = @Microsoft.KeyVault(VaultName=Marsa-api-dev-kv;SecretName=redis-password)
   REDIS_DB = 0
   BULL_BOARD_USERNAME = @Microsoft.KeyVault(VaultName=Marsa-api-dev-kv;SecretName=bull-board-username)
   BULL_BOARD_PASSWORD = @Microsoft.KeyVault(VaultName=Marsa-api-dev-kv;SecretName=bull-board-password)
   CORS_ALLOWED_ORIGINS = @Microsoft.KeyVault(VaultName=Marsa-api-dev-kv;SecretName=cors-allowed-origins)
   FRONTEND_URL = @Microsoft.KeyVault(VaultName=Marsa-api-dev-kv;SecretName=frontend-url)
   APPINSIGHTS_INSTRUMENTATIONKEY = [Get from Application Insights → Properties]
   APPLICATIONINSIGHTS_CONNECTION_STRING = [Get from Application Insights → Properties]
   SCM_DO_BUILD_DURING_DEPLOYMENT = true
   WEBSITE_NODE_DEFAULT_VERSION = 22-lts
   ```

3. **Click "Save"**

### Step 11: Enable Managed Identity

1. **Go to App Service** → **Identity**
2. **System assigned** → **Status: On** → **Save**
3. **Copy the Object ID** (needed for Key Vault access)

### Step 12: Grant Key Vault Access

1. **Go to Key Vault** → **Access policies**
2. **Click "Add Access Policy"**
3. **Configuration**:
   ```
   Secret permissions: Get, List
   Select principal: [Search for your App Service name]
   ```
4. **Click "Add"** → **Save**

---

## 🔧 Phase 7: GitHub Actions Setup (10 minutes)

### Step 13: Create Service Principal for GitHub

1. **Open Azure Cloud Shell**: https://shell.azure.com
2. **Run these commands**:

   ```bash
   # Create service principal
   az ad sp create-for-rbac --name "Marsa-github-actions" \
     --role contributor \
     --scopes /subscriptions/[YOUR_SUBSCRIPTION_ID]/resourceGroups/Marsa-api-dev-rg \
     --sdk-auth

   # Copy the JSON output - you'll need this for GitHub secrets
   ```

### Step 14: Add GitHub Secrets

1. **Go to GitHub Repository** → **Settings** → **Secrets and variables** → **Actions**
2. **Add these secrets**:

   ```
   AZURE_CREDENTIALS = [JSON output from service principal creation]
   AZURE_WEBAPP_NAME = Marsa-api-dev-app
   AZURE_RESOURCE_GROUP = Marsa-api-dev-rg
   ```

---

## ✅ Phase 8: Verification & Testing (5 minutes)

### Step 15: Test Your Setup

1. **Deploy your application** using GitHub Actions
2. **Check App Service URL**: `https://Marsa-api-dev-app.azurewebsites.net`
3. **Test API endpoints**: `https://Marsa-api-dev-app.azurewebsites.net/api`
4. **Access Job Dashboard**: `https://Marsa-api-dev-app.azurewebsites.net/api/admin/jobs/board`

### Step 16: Monitor Resources

1. **Application Insights**: Monitor performance and errors
2. **App Service Logs**: Check application logs for issues
3. **Database Metrics**: Monitor database performance
4. **Redis Metrics**: Check cache performance

### 🔄 Application Deployment

**After manual infrastructure setup, application deployment works automatically:**

- ✅ **Push to `main`/`develop`** triggers automatic application deployment
- ✅ **GitHub Actions** handles building, testing, and deployment
- ✅ **Same workflow** as automated infrastructure setup
- ✅ **No additional configuration** needed

**The application deployment workflow (`deploy-application.yml`) works identically whether you
created infrastructure manually or via Terraform.**

---

## 💰 Cost Summary

Your manually created resources will cost:

### Development Environment (~$49/month)

- App Service Plan B1: ~$13/month
- PostgreSQL Flexible Server B1ms: ~$12/month
- Azure Cache for Redis Basic C0: ~$16/month
- Key Vault Standard: ~$3/month
- Application Insights: ~$5/month

### Production Environment (~$241/month)

- App Service Plan P1v3: ~$73/month
- PostgreSQL Flexible Server D2s_v3: ~$77/month
- Azure Cache for Redis Standard C1: ~$73/month
- Key Vault Standard: ~$3/month
- Application Insights: ~$15/month

---

## 🔧 Common Issues & Solutions

### Database Connection Issues

- **Check firewall rules**: PostgreSQL → Networking → Add your IP
- **Verify connection string**: Ensure correct username, password, and database name

### Key Vault Access Denied

- **Check App Service identity**: Ensure system-assigned identity is enabled
- **Verify access policies**: App Service should have Get, List permissions

### Redis Connection Failed

- **Check access keys**: Redis → Access keys → Primary key
- **Verify SSL settings**: Ensure non-SSL port is disabled

### App Service Won't Start

- **Check Application Insights**: Look for startup errors
- **Review environment variables**: Ensure all required variables are set

---

## 🧹 Cleanup (When Needed)

To remove all resources:

1. **Go to Resource Groups**
2. **Select `Marsa-api-dev-rg`**
3. **Click "Delete resource group"**
4. **Type the resource group name to confirm**
5. **Click "Delete"**

**⚠️ Warning**: This permanently deletes all data including the database.

---

## 🆘 Getting Help

- **Azure Documentation**: [docs.microsoft.com](https://docs.microsoft.com/azure)
- **Azure Support**: Create support ticket in Azure Portal
- **GitHub Issues**: Create issues in your repository

---

**🎉 Congratulations! Your Marsa API infrastructure is ready for deployment!**
