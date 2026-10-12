output "resource_group_name" {
  description = "Name of the resource group"
  value       = azurerm_resource_group.api.name
}

output "app_service_url" {
  description = "URL of the API App Service"
  value       = "https://${azurerm_linux_web_app.api.default_hostname}"
}

output "app_service_name" {
  description = "Name of the API App Service"
  value       = azurerm_linux_web_app.api.name
}

output "database_fqdn" {
  description = "FQDN of the PostgreSQL server"
  value       = azurerm_postgresql_flexible_server.api.fqdn
  sensitive   = true
}

output "database_name" {
  description = "Name of the PostgreSQL database"
  value       = azurerm_postgresql_flexible_server_database.api.name
}

output "key_vault_name" {
  description = "Name of the Key Vault"
  value       = azurerm_key_vault.api.name
}

output "application_insights_instrumentation_key" {
  description = "Application Insights instrumentation key"
  value       = azurerm_application_insights.api.instrumentation_key
  sensitive   = true
}

output "application_insights_connection_string" {
  description = "Application Insights connection string"
  value       = azurerm_application_insights.api.connection_string
  sensitive   = true
}

output "redis_hostname" {
  description = "Redis cache hostname"
  value       = azurerm_redis_cache.api.hostname
}

output "redis_port" {
  description = "Redis cache SSL port"
  value       = azurerm_redis_cache.api.ssl_port
}

output "redis_name" {
  description = "Name of the Redis cache"
  value       = azurerm_redis_cache.api.name
} 