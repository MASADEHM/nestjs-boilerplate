# Configure the Azure Provider
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~>3.0"
    }
  }
  
  backend "azurerm" {
    # Backend configuration will be provided during init
    # terraform init -backend-config="backend.hcl"
  }
}

# Configure the Microsoft Azure Provider
provider "azurerm" {
  features {}
}

# Create a resource group
resource "azurerm_resource_group" "api" {
  name     = "${var.project_name}-api-${var.environment}-rg"
  location = var.location
  
  tags = var.tags
}

# Create a Log Analytics Workspace
resource "azurerm_log_analytics_workspace" "api" {
  name                = "${var.project_name}-api-${var.environment}-law"
  location            = azurerm_resource_group.api.location
  resource_group_name = azurerm_resource_group.api.name
  sku                 = "PerGB2018"
  retention_in_days   = var.environment == "dev" ? 30 : 90
  
  tags = var.tags
}

# Create Application Insights
resource "azurerm_application_insights" "api" {
  name                = "${var.project_name}-api-${var.environment}-ai"
  location            = azurerm_resource_group.api.location
  resource_group_name = azurerm_resource_group.api.name
  workspace_id        = azurerm_log_analytics_workspace.api.id
  application_type    = "web"
  
  tags = var.tags
}

# Create Key Vault for secrets
resource "azurerm_key_vault" "api" {
  name                = "${var.project_name}-api-${var.environment}-kv"
  location            = azurerm_resource_group.api.location
  resource_group_name = azurerm_resource_group.api.name
  tenant_id           = data.azuread_client_config.current.tenant_id
  
  sku_name = "standard"
  
  purge_protection_enabled = var.environment == "prod" ? true : false
  
  tags = var.tags
}

# Create PostgreSQL Server
resource "azurerm_postgresql_flexible_server" "api" {
  name                   = "${var.project_name}-api-${var.environment}-psql"
  resource_group_name    = azurerm_resource_group.api.name
  location               = azurerm_resource_group.api.location
  version                = "13"
  administrator_login    = var.db_admin_username
  administrator_password = var.db_admin_password
  
  storage_mb   = var.environment == "dev" ? 32768 : 65536
  storage_tier = var.environment == "dev" ? "P4" : "P6"
  
  sku_name = var.environment == "dev" ? "B_Standard_B1ms" : "GP_Standard_D2s_v3"
  zone     = "1"
  
  backup_retention_days = var.environment == "dev" ? 7 : 35
  
  tags = var.tags
}

# Create PostgreSQL Database
resource "azurerm_postgresql_flexible_server_database" "api" {
  name      = "${var.project_name}_api_${var.environment}"
  server_id = azurerm_postgresql_flexible_server.api.id
  collation = "en_US.utf8"
  charset   = "utf8"
}

# Create PostgreSQL Firewall Rule to allow Azure services
resource "azurerm_postgresql_flexible_server_firewall_rule" "azure_services" {
  name             = "AllowAzureServices"
  server_id        = azurerm_postgresql_flexible_server.api.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

# Create App Service Plan
resource "azurerm_service_plan" "api" {
  name                = "${var.project_name}-api-${var.environment}-asp"
  resource_group_name = azurerm_resource_group.api.name
  location            = azurerm_resource_group.api.location
  os_type             = "Linux"
  sku_name            = var.environment == "dev" ? "B1" : "P1v3"
  
  tags = var.tags
}

# Create App Service
resource "azurerm_linux_web_app" "api" {
  name                = "${var.project_name}-api-${var.environment}-app"
  resource_group_name = azurerm_resource_group.api.name
  location            = azurerm_resource_group.api.location
  service_plan_id     = azurerm_service_plan.api.id
  
  site_config {
    always_on = var.environment == "dev" ? false : true
    
    application_stack {
      node_version = "22-lts"
    }
    
    cors {
      allowed_origins = var.environment == "dev" ? ["http://localhost:4200"] : var.allowed_origins
    }
  }
  
  app_settings = {
    "NODE_ENV"                          = var.environment == "dev" ? "development" : "production"
    "DATABASE_URL"                      = "@Microsoft.KeyVault(VaultName=${azurerm_key_vault.api.name};SecretName=database-connection-string)"
    "JWT_ADMIN_SECRET"                  = "@Microsoft.KeyVault(VaultName=${azurerm_key_vault.api.name};SecretName=jwt-admin-secret)"
    "JWT_USER_SECRET"                   = "@Microsoft.KeyVault(VaultName=${azurerm_key_vault.api.name};SecretName=jwt-user-secret)"
    "REDIS_HOST"                        = azurerm_redis_cache.api.hostname
    "REDIS_PORT"                        = azurerm_redis_cache.api.ssl_port
    "REDIS_PASSWORD"                    = "@Microsoft.KeyVault(VaultName=${azurerm_key_vault.api.name};SecretName=redis-password)"
    "REDIS_DB"                          = "0"
    "BULL_BOARD_USERNAME"               = "@Microsoft.KeyVault(VaultName=${azurerm_key_vault.api.name};SecretName=bull-board-username)"
    "BULL_BOARD_PASSWORD"               = "@Microsoft.KeyVault(VaultName=${azurerm_key_vault.api.name};SecretName=bull-board-password)"
    "CORS_ALLOWED_ORIGINS"              = "@Microsoft.KeyVault(VaultName=${azurerm_key_vault.api.name};SecretName=cors-allowed-origins)"
    "FRONTEND_URL"                      = "@Microsoft.KeyVault(VaultName=${azurerm_key_vault.api.name};SecretName=frontend-url)"
    "APPINSIGHTS_INSTRUMENTATIONKEY"    = azurerm_application_insights.api.instrumentation_key
    "APPLICATIONINSIGHTS_CONNECTION_STRING" = azurerm_application_insights.api.connection_string
    "SCM_DO_BUILD_DURING_DEPLOYMENT"   = "true"
    "WEBSITE_NODE_DEFAULT_VERSION"      = "22-lts"
  }
  
  identity {
    type = "SystemAssigned"
  }
  
  tags = var.tags
}

# Create Azure Cache for Redis
resource "azurerm_redis_cache" "api" {
  name                = "${var.project_name}-api-${var.environment}-redis"
  location            = azurerm_resource_group.api.location
  resource_group_name = azurerm_resource_group.api.name
  
  capacity = var.environment == "dev" ? 0 : 1
  family   = var.environment == "dev" ? "C" : "C"
  sku_name = var.environment == "dev" ? "Basic" : "Standard"
  
  enable_non_ssl_port = false
  minimum_tls_version = "1.2"
  
  redis_configuration {
    enable_authentication = true
  }
  
  tags = var.tags
}

# Data source to get current client config
data "azuread_client_config" "current" {}

# Create Key Vault Access Policy for current user
resource "azurerm_key_vault_access_policy" "current_user" {
  key_vault_id = azurerm_key_vault.api.id
  tenant_id    = data.azuread_client_config.current.tenant_id
  object_id    = data.azuread_client_config.current.object_id

  secret_permissions = [
    "Get",
    "List",
    "Set",
    "Delete",
    "Recover",
    "Backup",
    "Restore"
  ]
}

# Create Key Vault Access Policy for App Service
resource "azurerm_key_vault_access_policy" "app_service" {
  key_vault_id = azurerm_key_vault.api.id
  tenant_id    = azurerm_linux_web_app.api.identity[0].tenant_id
  object_id    = azurerm_linux_web_app.api.identity[0].principal_id

  secret_permissions = [
    "Get",
    "List"
  ]
}

# Store database connection string in Key Vault
resource "azurerm_key_vault_secret" "db_connection_string" {
  name         = "database-connection-string"
  value        = "postgresql://${var.db_admin_username}:${var.db_admin_password}@${azurerm_postgresql_flexible_server.api.fqdn}:5432/${azurerm_postgresql_flexible_server_database.api.name}?sslmode=require"
  key_vault_id = azurerm_key_vault.api.id
  
  depends_on = [azurerm_key_vault_access_policy.current_user]
}

# Store JWT Admin secret in Key Vault
resource "azurerm_key_vault_secret" "jwt_admin_secret" {
  name         = "jwt-admin-secret"
  value        = var.jwt_admin_secret
  key_vault_id = azurerm_key_vault.api.id
  
  depends_on = [azurerm_key_vault_access_policy.current_user]
}

# Store JWT User secret in Key Vault
resource "azurerm_key_vault_secret" "jwt_user_secret" {
  name         = "jwt-user-secret"
  value        = var.jwt_user_secret
  key_vault_id = azurerm_key_vault.api.id
  
  depends_on = [azurerm_key_vault_access_policy.current_user]
}

# Store CORS allowed origins in Key Vault
resource "azurerm_key_vault_secret" "cors_allowed_origins" {
  name         = "cors-allowed-origins"
  value        = join(",", var.allowed_origins)
  key_vault_id = azurerm_key_vault.api.id
  
  depends_on = [azurerm_key_vault_access_policy.current_user]
}

# Store Frontend URL in Key Vault
resource "azurerm_key_vault_secret" "frontend_url" {
  name         = "frontend-url"
  value        = var.frontend_url
  key_vault_id = azurerm_key_vault.api.id
  
  depends_on = [azurerm_key_vault_access_policy.current_user]
}

# Store Redis password in Key Vault
resource "azurerm_key_vault_secret" "redis_password" {
  name         = "redis-password"
  value        = azurerm_redis_cache.api.primary_access_key
  key_vault_id = azurerm_key_vault.api.id
  
  depends_on = [azurerm_key_vault_access_policy.current_user]
}

# Store Bull Board credentials in Key Vault
resource "azurerm_key_vault_secret" "bull_board_username" {
  name         = "bull-board-username"
  value        = var.bull_board_username
  key_vault_id = azurerm_key_vault.api.id
  
  depends_on = [azurerm_key_vault_access_policy.current_user]
}

resource "azurerm_key_vault_secret" "bull_board_password" {
  name         = "bull-board-password"
  value        = var.bull_board_password
  key_vault_id = azurerm_key_vault.api.id
  
  depends_on = [azurerm_key_vault_access_policy.current_user]
} 