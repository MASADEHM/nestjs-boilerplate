# 🚀 Marsa API - Complete Deployment Guide

> **Step-by-step guide to deploy the Marsa API to Azure using GitHub Actions and Terraform**

## 📋 Overview

This guide will deploy a complete cloud infrastructure including:

- **Azure App Service** (Node.js hosting)
- **PostgreSQL Flexible Server** (Database)
- **Azure Cache for Redis** (Job queue backend)
- **Azure Key Vault** (Secure secrets)
- **Application Insights** (Monitoring)

**⏱️ Total Time:** ~30 minutes  
**💰 Cost:** ~$49/month (dev) | ~$241/month (prod)

## 🚨 **Critical Configuration Requirements**

Your application uses a **dual JWT authentication system**. You must provide:

### **Required Secrets (All Must Be Different):**

1. **`JWT_ADMIN_SECRET`** - For admin authentication
2. **`JWT_USER_SECRET`** - For user authentication

### **Frontend Integration:**

- **`FRONTEND_URL`** - Your frontend app URL (used in emails, redirects)
- **`ALLOWED_ORIGINS`** - CORS-allowed domains (becomes `CORS_ALLOWED_ORIGINS` in app)

### **Job Queue System:**

- **Redis configuration** - Automatically configured with managed Redis cache
- **Bull Board dashboard** - Job monitoring at `/api/admin/jobs/board`

---

## 🎯 Prerequisites

- [ ] **Azure Subscription** with Contributor permissions
- [ ] **GitHub Repository** for this API
- [ ] **Web Browser** (for Azure Cloud Shell)
- [ ] **5 minutes** for Azure setup

---

## 📂 Phase 1: Azure Infrastructure Setup (5 minutes)

### Step 1.1: Get Your Azure Subscription ID

1. **Open Azure Portal**: https://portal.azure.com
2. **Search for "Subscriptions"** in the top search bar
3. **Copy your Subscription ID** (format: `12345678-1234-1234-1234-123456789012`)

### Step 1.2: Run Azure Setup Script

1. **Open Azure Cloud Shell**: https://shell.azure.com
   - Wait for initialization (~30 seconds)
   - Select **PowerShell** (not Bash)

2. **Upload Setup Script**:
   - Click **Upload/Download** button (📁 icon)
   - Select **Upload**
   - Choose `deployment/setup-azure-service-principal.ps1` from your project
   - Click **Upload**

3. **Run the Script**:

   ```powershell
   # Basic usage (defaults to UAE North - Dubai)
   .\setup-azure-service-principal.ps1 -SubscriptionId "YOUR_SUBSCRIPTION_ID"

   # Alternative Middle East regions
   .\setup-azure-service-principal.ps1 -SubscriptionId "YOUR_SUBSCRIPTION_ID" -Location "UAE Central"
   .\setup-azure-service-principal.ps1 -SubscriptionId "YOUR_SUBSCRIPTION_ID" -Location "Qatar Central"
   ```

   **Middle East Azure Regions (Recommended):**
   - `UAE North` (default) - Dubai, UAE 🇦🇪 - **Best for Dubai/Northern Emirates**
   - `UAE Central` - Abu Dhabi, UAE 🇦🇪 - **Best for Abu Dhabi/Central UAE**
   - `Qatar Central` - Doha, Qatar 🇶🇦 - **Best for Qatar/Kuwait region**

   **Other Regional Options:**
   - `West Europe` - Netherlands 🇳🇱 - **Best for Europe/Africa**
   - `Southeast Asia` - Singapore 🇸🇬 - **Best for Asia Pacific**
   - `East US` - Virginia, USA 🇺🇸 - **Best for Americas**

   💡 **For Dubai users: UAE North offers the lowest latency and best performance**

### 🇦🇪 **Why UAE North (Dubai) is Perfect for Your Location:**

- ⚡ **Ultra-low latency**: ~1-5ms from Dubai
- 🏢 **Data residency**: Keeps data within UAE borders
- 🔒 **Compliance**: Meets UAE/GCC regulatory requirements
- 🌐 **Regional connectivity**: Optimized for Middle East, Africa, and South Asia
- 💰 **Competitive pricing**: Similar to other Azure regions
- 🚀 **Latest services**: Full Azure service availability

### 🌍 **Regional Performance Comparison from Dubai:**

- **UAE North (Dubai)**: ~1-5ms latency ⭐⭐⭐⭐⭐
- **UAE Central (Abu Dhabi)**: ~10-15ms latency ⭐⭐⭐⭐
- **Qatar Central (Doha)**: ~25-35ms latency ⭐⭐⭐
- **West Europe (Netherlands)**: ~120-150ms latency ⭐⭐
- **Southeast Asia (Singapore)**: ~80-100ms latency ⭐⭐

4. **Download Generated Secrets**:
   - Script creates `Marsa-api-github-secrets.json`
   - Click **Download** button (📁 icon)
   - Select the JSON file and download it

### ✅ What This Creates:

- ✅ Service Principal for GitHub Actions
- ✅ Terraform state storage (Azure Storage Account)
- ✅ All Azure authentication secrets
- ✅ JSON file with all required GitHub secrets

---

## 🔐 Phase 2: GitHub Repository Setup (10 minutes)

### Step 2.1: Add GitHub Secrets

1. **Go to Repository Settings**:
   - Your GitHub repository → **Settings** → **Secrets and variables** → **Actions**

2. **Add Secrets from JSON File**: Open your downloaded JSON file and add these secrets:

   **Azure Authentication:**
   - `AZURE_CLIENT_ID`
   - `AZURE_CLIENT_SECRET`
   - `AZURE_SUBSCRIPTION_ID`
   - `AZURE_TENANT_ID`
   - `TERRAFORM_STATE_RESOURCE_GROUP`
   - `TERRAFORM_STATE_STORAGE_ACCOUNT`
   - `AZURE_LOCATION`

   **Database Configuration:**
   - `DB_ADMIN_USERNAME` → `Marsa_admin`
   - `DB_ADMIN_PASSWORD` → Generate strong password (e.g., `Marsa2024!@#`)

   **Application Secrets:**
   - `JWT_ADMIN_SECRET` → Generate: `openssl rand -base64 32` (admin authentication)
   - `JWT_USER_SECRET` → Generate: `openssl rand -base64 32` (user authentication)
   - `BULL_BOARD_USERNAME` → `admin`
   - `BULL_BOARD_PASSWORD` → Generate strong password
   - `FRONTEND_URL` → `https://your-frontend-domain.com`
   - `ALLOWED_ORIGINS` → `["https://your-frontend-domain.com"]`

   **Additional Deployment Secrets** (auto-generated by infrastructure):
   - `DATABASE_URL` → Set automatically after infrastructure deployment
   - `AZURE_WEBAPP_NAME` → Set automatically after infrastructure deployment
   - `AZURE_WEBAPP_PUBLISH_PROFILE` → Set automatically after infrastructure deployment

### Step 2.2: Generate Secure Passwords

**For JWT Secrets** (on your computer - generate 2 separate secrets):

```bash
# Option 1: Using OpenSSL (run 2 times for 2 different secrets)
openssl rand -base64 32  # Use for JWT_ADMIN_SECRET
openssl rand -base64 32  # Use for JWT_USER_SECRET

# Option 2: Using Node.js (run 2 times)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Online generator
# Visit: https://generate-secret.vercel.app/32 (generate 2 different ones)
```

**For Other Passwords:**

- **DB_ADMIN_PASSWORD**: Use a password manager or generator
- **BULL_BOARD_PASSWORD**: Use a password manager or generator
- **Requirements**: 12+ characters, uppercase, lowercase, numbers, symbols
- **Example**: `MySecurePass123!@#`

### Step 2.3: Create GitHub Environments

1. **Go to Environments**:
   - Repository → **Settings** → **Environments**

2. **Create Three Environments**:
   - Click **New environment**
   - Name: `dev` → Create
   - Name: `staging` → Create
   - Name: `prod` → Create

3. **Configure Production Protection**:
   - Click on `prod` environment
   - Check **Required reviewers** → Add yourself
   - **Deployment branches** → **Selected branches** → Add `main`

---

## 📦 Phase 3: Deploy Infrastructure (5 minutes)

### Step 3.1: Manual Infrastructure Deployment

1. **Go to GitHub Actions**:
   - Repository → **Actions** tab
   - Click **"Deploy API Infrastructure"** workflow

2. **Run Workflow Manually**:
   - Click **"Run workflow"** button
   - **Environment**: Select `dev` (for development)
   - **Action**: Select `apply` (to create infrastructure)
   - Click **"Run workflow"**

3. **Monitor Deployment**:
   - Watch the workflow progress (~10-15 minutes)
   - Check for any errors in the logs
   - Verify successful completion

### Step 3.2: Verify Infrastructure

After deployment completes:

1. **Check Azure Portal**:
   - Resource group `Marsa-api-dev-rg` should exist
   - 7 resources should be created (App Service, Database, Redis, etc.)

2. **Note the App Service URL**:
   - From GitHub Actions logs or Azure Portal
   - Format: `https://Marsa-api-dev-app.azurewebsites.net`

---

## 🎉 Phase 4: Verify Deployment (5 minutes)

### Step 4.1: Check Deployment URLs

After successful deployment, check GitHub Actions output for:

- **API URL**: `https://Marsa-api-prod-app.azurewebsites.net`
- **Job Dashboard**: `https://Marsa-api-prod-app.azurewebsites.net/api/admin/jobs/board`

### Step 4.2: Test Endpoints

**1. Health Check:**

```bash
curl https://Marsa-api-prod-app.azurewebsites.net/api
```

**Expected:** API documentation page

**2. Swagger Documentation:**

```
https://Marsa-api-prod-app.azurewebsites.net/api
```

**Expected:** Interactive API documentation

**3. Job Dashboard:**

```
https://Marsa-api-prod-app.azurewebsites.net/api/admin/jobs/board
```

**Expected:** Bull Board login (use BULL_BOARD_USERNAME/PASSWORD)

### Step 4.3: Verify Azure Resources

1. **Azure Portal**: https://portal.azure.com
2. **Find Resource Group**: `Marsa-api-prod-rg`
3. **Check Resources**: All 6 resources should be running
4. **App Service Logs**: Monitor for any errors

---

## 🔧 Phase 5: Development Environment (Optional)

### Step 5.1: Deploy Development Environment

```bash
git checkout -b develop
git push origin develop
```

This creates a separate development environment:

- **Cost**: ~$49/month
- **URL**: `Marsa-api-dev-app.azurewebsites.net`
- **Database**: Includes sample data seeding

---

## 🚨 Troubleshooting

### ❌ Azure Setup Script Fails

**Problem**: Service Principal creation fails

```bash
# Check permissions
az ad signed-in-user show
```

**Solution**: Ensure you have Application.ReadWrite.OwnedBy permission

### ❌ Terraform Apply Fails

**Problem**: Resource already exists **Solution**: Terraform is idempotent - re-run the workflow

**Problem**: Insufficient permissions **Solution**: Check service principal has Contributor role on
subscription

### ❌ Application Deployment Fails

**Problem**: Database connection fails **Solution**:

1. Check `DATABASE_URL` in GitHub secrets
2. Verify PostgreSQL firewall rules in Azure Portal

**Problem**: Redis connection fails **Solution**:

1. Check Redis is created in Azure Portal
2. Verify Redis password in Key Vault

### ❌ Job Dashboard Not Working

**Problem**: 401 Unauthorized **Solution**: Check `BULL_BOARD_USERNAME` and `BULL_BOARD_PASSWORD`
secrets

**Problem**: Redis connection error **Solution**: Verify Redis cache is running in Azure Portal

---

## 📊 Cost Management

### Monthly Costs by Environment:

**Development Environment:**

- App Service B1: $13
- PostgreSQL B1ms: $12
- Redis Basic C0: $16
- Key Vault: $3
- Application Insights: $5
- **Total: ~$49/month**

**Production Environment:**

- App Service P1v3: $73
- PostgreSQL GP_Standard_D2s_v3: $77
- Redis Standard C1: $73
- Key Vault: $3
- Application Insights: $15
- **Total: ~$241/month**

### Cost Optimization:

- **Delete dev environment** when not needed
- **Scale down** production resources during low usage
- **Monitor** Application Insights for usage patterns

---

## 🔄 Ongoing Deployments

### Automatic Deployments:

**Code Changes:**

```bash
git push origin main     # → Production deployment
git push origin develop  # → Development deployment
```

**Infrastructure Changes:**

```bash
# Edit files in deployment/terraform/
git add deployment/terraform/
git commit -m "Update infrastructure"
git push origin main     # → Infrastructure + Application deployment
```

### Manual Deployments:

1. **GitHub Actions** → **Deploy API Infrastructure** → **Run workflow**
2. **GitHub Actions** → **Deploy API Application** → **Run workflow**

---

## ✅ Deployment Checklist

### Phase 1: Azure Setup

- [ ] Azure subscription access verified
- [ ] Cloud Shell opened and script uploaded
- [ ] Setup script executed successfully
- [ ] Secrets JSON file downloaded

### Phase 2: GitHub Configuration

- [ ] All Azure secrets added to GitHub
- [ ] DB_ADMIN_PASSWORD generated and added
- [ ] JWT_ADMIN_SECRET generated and added (admin auth)
- [ ] JWT_USER_SECRET generated and added (user auth)
- [ ] BULL_BOARD credentials added
- [ ] FRONTEND_URL configured
- [ ] ALLOWED_ORIGINS configured
- [ ] GitHub environments created (dev, staging, prod)
- [ ] Production environment protection rules set

### Phase 3: Infrastructure Deployment

- [ ] Code committed and pushed to main branch
- [ ] Infrastructure workflow completed successfully
- [ ] Application workflow completed successfully
- [ ] No errors in GitHub Actions logs

### Phase 4: Verification

- [ ] API URL accessible
- [ ] Swagger documentation loads
- [ ] Job dashboard accessible with credentials
- [ ] All Azure resources created and running
- [ ] Application Insights receiving data

### Phase 5: Optional Development

- [ ] Develop branch created and pushed
- [ ] Development environment deployed
- [ ] Database seeded with test data

---

## 🎯 Next Steps

### After Successful Deployment:

1. **Custom Domain**: Configure your own domain name
2. **SSL Certificate**: Add custom SSL certificate
3. **Monitoring**: Set up Application Insights alerts
4. **Backup**: Configure database backup schedules
5. **Scaling**: Configure auto-scaling rules
6. **Security**: Review security recommendations

### Development Workflow:

1. **Feature Development**: Work on `develop` branch
2. **Testing**: Deploy to development environment
3. **Pull Request**: Create PR to `main` branch
4. **Review**: Code review and approval
5. **Production**: Merge to `main` triggers production deployment

---

## 🆘 Getting Help

- **GitHub Issues**: Create issue in this repository
- **Azure Support**: Azure Portal → Help + Support
- **Documentation**:
  - [Azure App Service Docs](https://docs.microsoft.com/en-us/azure/app-service/)
  - [GitHub Actions Docs](https://docs.github.com/en/actions)
  - [Terraform Azure Docs](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)

---

**🎉 Congratulations! Your Marsa API is now deployed to Azure with full CI/CD pipeline!** 🚀
