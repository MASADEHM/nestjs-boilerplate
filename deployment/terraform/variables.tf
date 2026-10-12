variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "Marsa"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "dev"
  
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "UAE North"
}

variable "db_admin_username" {
  description = "PostgreSQL administrator username"
  type        = string
  default     = "Marsa_admin"
}

variable "db_admin_password" {
  description = "PostgreSQL administrator password"
  type        = string
  sensitive   = true
}

variable "jwt_admin_secret" {
  description = "JWT secret key for admin authentication"
  type        = string
  sensitive   = true
}

variable "jwt_user_secret" {
  description = "JWT secret key for user authentication"
  type        = string
  sensitive   = true
}

variable "allowed_origins" {
  description = "Allowed CORS origins for production"
  type        = list(string)
  default     = []
}

variable "bull_board_username" {
  description = "Username for Bull Board dashboard authentication"
  type        = string
  default     = "admin"
}

variable "bull_board_password" {
  description = "Password for Bull Board dashboard authentication"
  type        = string
  sensitive   = true
  default     = "12345"
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default = {
    Project     = "Marsa"
    Environment = "Development"
    ManagedBy   = "Terraform"
  }
}

variable "frontend_url" {
  description = "Frontend application URL"
  type        = string
  default     = "https://localhost:4200"
} 