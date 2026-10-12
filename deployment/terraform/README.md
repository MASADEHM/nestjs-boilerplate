# Marsa API - Terraform Infrastructure

This directory contains Terraform configurations to deploy the Marsa API infrastructure to Azure.

## 🏗️ Technical Overview

**Infrastructure as Code** using Terraform to provision and manage Azure resources for the Marsa API.

### Terraform Configuration Files

| File | Purpose |
|------|---------|
| **`main.tf`** | Core Azure resource definitions |
| **`variables.tf`** | Input variable declarations |
| **`outputs.tf`** | Output values for integration |
| **`terraform.tfvars.example`** | Example configuration values |
| **`backend.hcl.example`** | Remote state backend configuration |

### Resource Naming Convention

All resources follow the pattern: `{project_name}-api-{environment}-{resource_type}`

**Examples:**
- Resource Group: `Marsa-api-dev-rg`
- App Service: `Marsa-api-dev-app`
- Database: `Marsa-api-dev-psql`
- Key Vault: `Marsa-api-dev-kv`

### Environment Variables

The Terraform configuration automatically sets these environment variables in the App Service:

**Core Application:**
- `NODE_ENV`: Set based on environment
- `DATABASE_URL`: Retrieved from Key Vault

**Authentication (Dual JWT System):**
- `JWT_ADMIN_SECRET`: Retrieved from Key Vault (admin authentication)
- `JWT_USER_SECRET`: Retrieved from Key Vault (user authentication)

**Job Queue (Redis):**
- `REDIS_HOST`: Redis cache hostname
- `REDIS_PORT`: Redis cache SSL port
- `REDIS_PASSWORD`: Retrieved from Key Vault
- `REDIS_DB`: Set to 0 (default database)

**Bull Board Dashboard:**
- `BULL_BOARD_USERNAME`: Retrieved from Key Vault
- `BULL_BOARD_PASSWORD`: Retrieved from Key Vault

**Frontend Integration:**
- `CORS_ALLOWED_ORIGINS`: Retrieved from Key Vault (comma-separated origins)
- `FRONTEND_URL`: Retrieved from Key Vault (for email links, etc.)

**Monitoring:**
- `APPINSIGHTS_INSTRUMENTATIONKEY`: Application Insights key

## 🔧 Local Development with Terraform

### Prerequisites

1. **Terraform** v1.0+ installed
2. **Azure CLI** installed and authenticated
3. **GitHub Actions** for automated deployment (recommended)

### Manual Terraform Operations (Optional)

```bash
# Initialize Terraform with remote backend
terraform init -backend-config="backend.hcl"

# Plan infrastructure changes
terraform plan -var-file="terraform.tfvars"

# Apply infrastructure changes
terraform apply -var-file="terraform.tfvars"

# View outputs
terraform output

# Destroy infrastructure (careful!)
terraform destroy -var-file="terraform.tfvars"
```

**⚠️ Note:** Manual Terraform operations are not recommended. Use GitHub Actions for deployment.

## 🔑 Required Variables

The following variables must be set in `terraform.tfvars`:

```hcl
# Basic Configuration
project_name = "Marsa"
environment  = "dev"  # or "prod"
location     = "UAE North"

# Database Configuration
db_admin_username = "Marsa_admin"
db_admin_password = "secure_password_here"

# JWT Configuration (Separate secrets for admin and user systems)
jwt_admin_secret  = "your-admin-jwt-secret-here"
jwt_user_secret   = "your-user-jwt-secret-here"

# Bull Board Dashboard
bull_board_username = "admin"
bull_board_password = "secure_password_here"

# Frontend Integration
frontend_url    = "https://your-frontend-domain.com"
allowed_origins = ["https://your-frontend-domain.com"]

# Resource Tags
tags = {
  Project     = "Marsa"
  Environment = "Development"
  ManagedBy   = "Terraform"
}
```

## 🔍 Terraform State Management

**Remote State Storage:**
- **Storage Account**: `terraform-state-{random}` (created by setup script)
- **Container**: `tfstate`
- **Key**: `terraform.tfstate`

**State Locking:** Enabled via Azure Storage Account blob lease

## 🛠️ Infrastructure Outputs

After deployment, Terraform provides these outputs:

```bash
# Application URLs
terraform output app_service_url        # API endpoint
terraform output key_vault_name         # Secrets storage
terraform output database_fqdn          # Database connection
terraform output redis_hostname         # Cache endpoint

# Resource Names (for Azure CLI operations)
terraform output resource_group_name    # Main resource group
terraform output app_service_name       # App Service name
```

## 🔐 Security Configuration

### Managed Identity
- **System-assigned identity** for App Service
- **Key Vault access** via managed identity (no stored credentials)

### Network Security
- **HTTPS only** for all web traffic
- **SSL required** for database connections
- **Redis SSL** enforced with TLS 1.2+
- **CORS** configured for allowed origins

### Secret Management
All sensitive data stored in **Azure Key Vault**:
- Database connection strings
- JWT secrets (admin and user)
- Redis passwords
- Bull Board credentials
- Frontend configuration

## 📈 Environment Scaling

### Development → Production

Update `terraform.tfvars`:
```hcl
environment = "prod"
```

**Automatic Changes:**
- App Service: B1 → P1v3 (premium)
- PostgreSQL: B_Standard_B1ms → GP_Standard_D2s_v3
- Redis: Basic C0 → Standard C1
- Backup retention: 7 days → 35 days
- Key Vault: Purge protection enabled

### Custom Scaling

Override specific resource sizes:
```hcl
# In terraform.tfvars
custom_app_service_sku = "S1"  # Standard tier
custom_db_sku = "GP_Standard_D4s_v3"  # Larger database
```

## 🧪 Testing Infrastructure

```bash
# Validate Terraform syntax
terraform validate

# Format Terraform files
terraform fmt

# Plan without applying
terraform plan -var-file="terraform.tfvars"

# Show current state
terraform show
```

## 🆘 Troubleshooting

### Common Terraform Issues

1. **State Lock Error**
   ```bash
   # Force unlock (use carefully)
   terraform force-unlock LOCK_ID
   ```

2. **Resource Already Exists**
   ```bash
   # Import existing resource
   terraform import azurerm_resource_group.api /subscriptions/xxx/resourceGroups/name
   ```

3. **Permission Denied**
   - Verify service principal permissions
   - Check Azure CLI authentication: `az account show`

4. **Key Vault Access Denied**
   ```bash
   # Add your user to Key Vault
   az keyvault set-policy --name vault-name --upn user@domain.com --secret-permissions get list set
   ```

## 📚 Azure Resources Created

| Resource Type | Development | Production | Purpose |
|---------------|-------------|------------|---------|
| **App Service Plan** | B1 | P1v3 | Hosting platform |
| **Linux Web App** | ✓ | ✓ | API application |
| **PostgreSQL Server** | B_Standard_B1ms | GP_Standard_D2s_v3 | Database |
| **Redis Cache** | Basic C0 | Standard C1 | Job queue |
| **Key Vault** | Standard | Standard | Secret storage |
| **Application Insights** | ✓ | ✓ | Monitoring |
| **Log Analytics** | 30 days | 90 days | Centralized logging |

---

**🔗 For deployment guidance, see [../README.md](../README.md) and [../DEPLOYMENT_STEPS.md](../DEPLOYMENT_STEPS.md)** 