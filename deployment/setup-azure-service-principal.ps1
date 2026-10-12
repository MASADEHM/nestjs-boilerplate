# Setup Azure Service Principal for Marsa API - GitHub Actions
# This script creates a service principal for the API repository deployment
# Run this in Azure Cloud Shell (https://shell.azure.com)
#
# Parameters:
#   -SubscriptionId: Your Azure subscription ID (required)
#   -ServicePrincipalName: Name for the service principal (optional, default: Marsa-api-github-actions-sp)
#   -Location: Azure region for resources (optional, default: UAE North)
#
# Examples:
#   .\setup-azure-service-principal.ps1 -SubscriptionId "12345678-1234-1234-1234-123456789012"
#   .\setup-azure-service-principal.ps1 -SubscriptionId "12345678-1234-1234-1234-123456789012" -Location "UAE Central"
#   .\setup-azure-service-principal.ps1 -SubscriptionId "12345678-1234-1234-1234-123456789012" -Location "Qatar Central"

param(
    [Parameter(Mandatory=$true)]
    [string]$SubscriptionId,
    
    [string]$ServicePrincipalName = "Marsa-api-github-actions-sp",
    
    [string]$Location = "UAE North"
)

Write-Host "🔐 Setting up Azure Service Principal for Marsa API GitHub Actions..." -ForegroundColor Green
Write-Host "ℹ️  This script should be run in Azure Cloud Shell (https://shell.azure.com)" -ForegroundColor Cyan
Write-Host "🇦🇪 Location: $Location (Optimized for Middle East)" -ForegroundColor Yellow

# Set subscription
Write-Host "📋 Setting subscription to: $SubscriptionId" -ForegroundColor Yellow
az account set --subscription $SubscriptionId

# Verify subscription
$currentSubscription = az account show --query "name" -o tsv
Write-Host "✅ Using subscription: $currentSubscription" -ForegroundColor Green

# Create Service Principal
Write-Host "📝 Creating Service Principal: $ServicePrincipalName..." -ForegroundColor Blue

$spOutput = az ad sp create-for-rbac --name $ServicePrincipalName --role "Contributor" --scopes "/subscriptions/$SubscriptionId" --json-auth | ConvertFrom-Json

if (-not $spOutput) {
    Write-Host "❌ Failed to create Service Principal" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Service Principal created successfully" -ForegroundColor Green

# Get additional information
$tenantId = az account show --query "tenantId" -o tsv
$subscriptionId = az account show --query "id" -o tsv

# Create Terraform state storage
Write-Host "🗄️  Creating Terraform state storage..." -ForegroundColor Blue

# Create resource group for Terraform state
az group create --name terraform-state-rg --location $Location

# Create storage account
$storageAccountName = "Marsatfstate$(Get-Random -Minimum 1000 -Maximum 9999)"
az storage account create `
  --resource-group terraform-state-rg `
  --name $storageAccountName `
  --sku Standard_LRS `
  --encryption-services blob

# Create container
az storage container create `
  --name tfstate `
  --account-name $storageAccountName

Write-Host "✅ Terraform state storage created" -ForegroundColor Green

Write-Host ""
Write-Host "🔑 GitHub Secrets Configuration for API Repository" -ForegroundColor Cyan
Write-Host "Add these secrets to your Marsa-api GitHub repository:" -ForegroundColor Yellow
Write-Host ""

Write-Host "AZURE_CLIENT_ID: $($spOutput.clientId)" -ForegroundColor White
Write-Host "AZURE_CLIENT_SECRET: $($spOutput.clientSecret)" -ForegroundColor White
Write-Host "AZURE_SUBSCRIPTION_ID: $subscriptionId" -ForegroundColor White
Write-Host "AZURE_TENANT_ID: $tenantId" -ForegroundColor White
Write-Host ""

Write-Host "TERRAFORM_STATE_RESOURCE_GROUP: terraform-state-rg" -ForegroundColor White
Write-Host "TERRAFORM_STATE_STORAGE_ACCOUNT: $storageAccountName" -ForegroundColor White
Write-Host "AZURE_LOCATION: $Location" -ForegroundColor White
Write-Host ""

Write-Host "🔐 API-Specific Secrets (Generate these securely):" -ForegroundColor Magenta
Write-Host "DB_ADMIN_USERNAME: Marsa_admin" -ForegroundColor White
Write-Host "DB_ADMIN_PASSWORD: [Generate strong password - use Azure Key Vault or password generator]" -ForegroundColor White
Write-Host "JWT_ADMIN_SECRET: [Generate cryptographically secure key - 256-bit recommended]" -ForegroundColor White
Write-Host "JWT_USER_SECRET: [Generate cryptographically secure key - 256-bit recommended]" -ForegroundColor White
Write-Host "BULL_BOARD_USERNAME: admin" -ForegroundColor White
Write-Host "BULL_BOARD_PASSWORD: [Generate secure password for job dashboard access]" -ForegroundColor White
Write-Host "FRONTEND_URL: [Your frontend application URL, e.g., https://app.Marsa.com]" -ForegroundColor White
Write-Host "ALLOWED_ORIGINS: [`"https://your-frontend-domain.com`"]" -ForegroundColor White
Write-Host ""

# Create a JSON file for easy reference
$secretsData = @{
    "Repository" = "Marsa-api"
    "AZURE_CLIENT_ID" = $spOutput.clientId
    "AZURE_CLIENT_SECRET" = $spOutput.clientSecret
    "AZURE_SUBSCRIPTION_ID" = $subscriptionId
    "AZURE_TENANT_ID" = $tenantId
    "TERRAFORM_STATE_RESOURCE_GROUP" = "terraform-state-rg"
    "TERRAFORM_STATE_STORAGE_ACCOUNT" = $storageAccountName
    "AZURE_LOCATION" = $Location
    "DB_ADMIN_USERNAME" = "Marsa_admin"
    "DB_ADMIN_PASSWORD" = "[GENERATE_SECURE_PASSWORD]"
    "JWT_ADMIN_SECRET" = "[GENERATE_SECURE_JWT_ADMIN_SECRET]"
    "JWT_USER_SECRET" = "[GENERATE_SECURE_JWT_USER_SECRET]"
    "BULL_BOARD_USERNAME" = "admin"
    "BULL_BOARD_PASSWORD" = "[GENERATE_SECURE_PASSWORD]"
    "FRONTEND_URL" = "[YOUR_FRONTEND_URL]"
    "ALLOWED_ORIGINS" = "[`"https://your-frontend-domain.com`"]"
    "Notes" = @{
        "DatabasePassword" = "Use Azure Portal to generate a secure password"
        "JWTSecrets" = "Generate 2 separate secrets: openssl rand -base64 32"
        "FrontendUrl" = "Your actual frontend application URL"
        "AllowedOrigins" = "Update with your actual frontend domain(s)"
    }
}

$secretsData | ConvertTo-Json -Depth 3 | Out-File -FilePath "Marsa-api-github-secrets.json" -Encoding UTF8

Write-Host "💾 Secrets saved to: Marsa-api-github-secrets.json" -ForegroundColor Green
Write-Host "📥 Download this file from Cloud Shell to your local machine" -ForegroundColor Yellow
Write-Host ""

Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Download the secrets JSON file from Cloud Shell" -ForegroundColor White
Write-Host "2. Add all secrets to your Marsa-api GitHub repository" -ForegroundColor White
Write-Host "3. Generate secure values for DB_ADMIN_PASSWORD and JWT_SECRET" -ForegroundColor White
Write-Host "4. Update ALLOWED_ORIGINS with your actual frontend domain" -ForegroundColor White
Write-Host "5. Create GitHub environments (dev, staging, prod) in repository settings" -ForegroundColor White
Write-Host "6. Run the setup script for Marsa-web repository" -ForegroundColor White
Write-Host "7. Push your code to trigger the deployment workflows" -ForegroundColor White
Write-Host ""

Write-Host "🚀 API repository setup completed successfully!" -ForegroundColor Green
Write-Host "🔗 Storage Account Name: $storageAccountName (save this for web app setup)" -ForegroundColor Cyan 