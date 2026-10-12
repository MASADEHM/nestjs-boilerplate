-- CreateTable
CREATE TABLE "files" (
    "id" SERIAL NOT NULL,
    "file_path" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "is_temp" BOOLEAN NOT NULL DEFAULT false,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "mobile_number" VARCHAR(20),
    "role" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "mobile_verified" BOOLEAN NOT NULL DEFAULT false,
    "passport_number" VARCHAR(50),
    "passport_issue_date" DATE,
    "passport_expiry_date" DATE,
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "created_by" VARCHAR(255) NOT NULL,
    "updated_by" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "mobile_skipped" BOOLEAN NOT NULL DEFAULT false,
    "client_id" VARCHAR(20) NOT NULL,
    "emirates_id" TEXT,
    "is_uae_residnant" BOOLEAN NOT NULL,
    "passport_copy_url" TEXT,
    "gender" TEXT,
    "country" TEXT,
    "emirates_id_copy_urls" TEXT,
    "unified_file_no" TEXT,
    "account_activated" BOOLEAN NOT NULL DEFAULT false,
    "account_activation_token" VARCHAR(255),
    "account_activation_token_expiry" TIMESTAMP(3),
    "password" VARCHAR(255),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "language" VARCHAR(5) NOT NULL DEFAULT 'en',
    "preferred_contact_method" VARCHAR(20) NOT NULL DEFAULT 'email',
    "show_tips" BOOLEAN NOT NULL DEFAULT true,
    "show_welcome_message" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "id" SERIAL NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "user_id" INTEGER NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "description_arabic" VARCHAR(255) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "title" TEXT NOT NULL,
    "title_arabic" TEXT NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_shareholders" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "share_percentage" DECIMAL(5,2) NOT NULL,
    "share_value" DECIMAL(15,2) NOT NULL,
    "number_of_shares" INTEGER NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending_approval',
    "added_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "removed_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "shareholder_company_id" INTEGER,
    "shareholder_type" VARCHAR(20) NOT NULL DEFAULT 'Person',

    CONSTRAINT "company_shareholders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_managers" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "designation" VARCHAR(100),
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending_approval',
    "appointment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "termination_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_managers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_board_members" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role_code" VARCHAR(50) NOT NULL,
    "designation" VARCHAR(100),
    "is_chairman" BOOLEAN NOT NULL DEFAULT false,
    "committees" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending_approval',
    "appointment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "termination_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_board_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_category" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "name_arabic" VARCHAR(255) NOT NULL,

    CONSTRAINT "activity_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_sub_category" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "name_arabic" VARCHAR(255) NOT NULL,
    "category_id" INTEGER NOT NULL,

    CONSTRAINT "activity_sub_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" SERIAL NOT NULL,
    "activity_code" VARCHAR(50) NOT NULL,
    "activity_category_id" INTEGER NOT NULL,
    "sub_category_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "name_arabic" VARCHAR(255) NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "description_arabic" VARCHAR(500) NOT NULL,
    "isc4_code" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" VARCHAR(255) NOT NULL,
    "updated_by" VARCHAR(255),
    "investing_activity" BOOLEAN NOT NULL DEFAULT false,
    "requires_tradeName_certificate" BOOLEAN NOT NULL,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_attachments" (
    "id" SERIAL NOT NULL,
    "activity_id" INTEGER NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "project_location" VARCHAR(100),
    "mandatory" BOOLEAN NOT NULL DEFAULT false,
    "process_code" VARCHAR(50),
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "issuing_authority" VARCHAR(100),
    "order_sequence" INTEGER NOT NULL DEFAULT 1,
    "allowed_extensions" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" VARCHAR(255) NOT NULL,
    "updated_by" VARCHAR(255),
    "description_ar" TEXT,
    "issuing_authority_ar" VARCHAR(100),
    "name_ar" VARCHAR(255),

    CONSTRAINT "activity_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_locations" (
    "id" SERIAL NOT NULL,
    "project_code" VARCHAR(50) NOT NULL,
    "project_description" VARCHAR(500) NOT NULL,
    "project_description_ar" VARCHAR(500) NOT NULL,
    "max_company_number" INTEGER NOT NULL,

    CONSTRAINT "project_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "countries" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(3) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "name_arabic" VARCHAR(255) NOT NULL,
    "iso_code" VARCHAR(2) NOT NULL,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lease" (
    "id" SERIAL NOT NULL,
    "lease_number" VARCHAR(100) NOT NULL,
    "lessor_name" VARCHAR(255),
    "lessee_name" VARCHAR(255),
    "property_address" TEXT,
    "start_date" DATE,
    "end_date" DATE,
    "monthly_rent" DECIMAL(10,2),
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lease_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trade_names" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "activity_category_id" INTEGER NOT NULL,
    "trade_name" VARCHAR(255) NOT NULL,
    "trade_name_arabic" VARCHAR(255) NOT NULL,
    "tradeNameStatus" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "trade_name_number" INTEGER,
    "characteristics" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" VARCHAR(255) NOT NULL,
    "updated_by" VARCHAR(255),
    "activity_group_id" INTEGER NOT NULL,
    "applicant_mobile" VARCHAR(50) NOT NULL,
    "applicant_name" VARCHAR(255) NOT NULL,
    "branch_number" VARCHAR(100),
    "legal_type" VARCHAR(20) NOT NULL,
    "request_id" INTEGER NOT NULL,
    "characteristics1" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "characteristics2" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "characteristics3" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "selected_option" INTEGER DEFAULT 1,
    "trade_name_alt1" VARCHAR(255),
    "trade_name_alt1_arabic" VARCHAR(255),
    "trade_name_alt2" VARCHAR(255),
    "trade_name_alt2_arabic" VARCHAR(255),

    CONSTRAINT "trade_names_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "initial_approvals" (
    "id" SERIAL NOT NULL,
    "request_id" INTEGER NOT NULL,
    "company_id" INTEGER,
    "user_id" INTEGER NOT NULL,
    "legal_type" VARCHAR(50) NOT NULL,
    "license_type" VARCHAR(50) NOT NULL,
    "project" VARCHAR(255) NOT NULL,
    "activity_group_id" INTEGER NOT NULL,
    "activity_ids" JSONB NOT NULL,
    "mother_company_id" INTEGER,
    "mother_company_details" JSONB,
    "shareholders" JSONB NOT NULL DEFAULT '[]',
    "managers" JSONB NOT NULL DEFAULT '[]',
    "boardMembers" JSONB NOT NULL DEFAULT '[]',
    "facility_details" JSONB,
    "documents" JSONB NOT NULL DEFAULT '[]',
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "step_code" VARCHAR(50) NOT NULL,
    "submission_channel" VARCHAR(50) NOT NULL,
    "created_by" VARCHAR(255) NOT NULL,
    "updated_by" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "approved_at" TIMESTAMP(3),
    "requires_trade_name_certificate" BOOLEAN NOT NULL DEFAULT false,
    "ns_approved_at" TIMESTAMP(3),
    "ns_last_checked_at" TIMESTAMP(3),
    "ns_payload" JSONB,
    "ns_reference_number" VARCHAR(100),
    "ns_rejected_at" TIMESTAMP(3),
    "ns_remarks" TEXT,
    "ns_response" JSONB,
    "ns_retry_count" INTEGER NOT NULL DEFAULT 0,
    "ns_status" VARCHAR(50),
    "ns_submitted_at" TIMESTAMP(3),
    "ns_failure_reason" TEXT,
    "ns_last_attempt_at" TIMESTAMP(3),
    "ns_submission_status" VARCHAR(50) DEFAULT 'not_attempted',
    "ns_submission_successful" BOOLEAN,
    "ns_queue_job_id" VARCHAR(100),
    "ns_queue_job_status" VARCHAR(50),
    "ns_queue_processed_at" TIMESTAMP(3),
    "ns_queued_at" TIMESTAMP(3),

    CONSTRAINT "initial_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facilities" (
    "id" SERIAL NOT NULL,
    "facility_type" TEXT NOT NULL,
    "facility_type_ar" TEXT NOT NULL,
    "number_of_beds" INTEGER NOT NULL DEFAULT 0,
    "number_of_stars" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "facilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generated_documents" (
    "id" SERIAL NOT NULL,
    "trade_name_id" INTEGER,
    "request_id" INTEGER,
    "initial_approval_id" INTEGER,
    "document_type" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "description_arabic" VARCHAR(500) NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_path" VARCHAR(1000) NOT NULL,
    "file_size" INTEGER,
    "mime_type" VARCHAR(100),
    "generated_by" VARCHAR(100) NOT NULL DEFAULT 'system',
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "version" INTEGER NOT NULL DEFAULT 1,
    "metadata" JSONB,

    CONSTRAINT "generated_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request_documents" (
    "id" SERIAL NOT NULL,
    "request_id" INTEGER NOT NULL,
    "document_type" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500),
    "file_name" VARCHAR(255) NOT NULL,
    "file_path" VARCHAR(1000) NOT NULL,
    "file_size" INTEGER,
    "mime_type" VARCHAR(100),
    "uploaded_by" INTEGER NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',

    CONSTRAINT "request_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" SERIAL NOT NULL,
    "issue_date" TIMESTAMP(3) NOT NULL,
    "expiry_date" TIMESTAMP(3) NOT NULL,
    "reg_type" VARCHAR(100),
    "area" VARCHAR(255),
    "company_name" VARCHAR(500) NOT NULL,
    "company_name_ar" VARCHAR(500) NOT NULL,
    "address" TEXT,
    "address_arabic" TEXT,
    "email" VARCHAR(255),
    "tel" VARCHAR(50),
    "mobile" VARCHAR(50),
    "lease_id" INTEGER,
    "project_name" VARCHAR(500),
    "project_name_ar" VARCHAR(500),
    "status" VARCHAR(50) NOT NULL DEFAULT 'active',
    "created_by" VARCHAR(255) NOT NULL,
    "updated_by" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "license_number" SERIAL NOT NULL,
    "facility_id" INTEGER,
    "approved_at" TIMESTAMP(3),
    "approved_by" VARCHAR(255),
    "branch_type" VARCHAR(50),
    "is_branch" BOOLEAN NOT NULL DEFAULT false,
    "issuing_authority" VARCHAR(100) NOT NULL DEFAULT 'PCFC',
    "legal_type" VARCHAR(50),
    "license_type" VARCHAR(50),
    "mother_company_id" INTEGER,
    "project" VARCHAR(100),
    "request_id" INTEGER,
    "stage" VARCHAR(200) DEFAULT 'initial_approval',
    "stage_description" TEXT,
    "trade_name_id" INTEGER,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_applications" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "business_type" VARCHAR(20),
    "business_category_id" INTEGER,
    "trade_name" VARCHAR(255),
    "has_reserved_name" BOOLEAN NOT NULL DEFAULT false,
    "reserved_name_document_url" VARCHAR(500),
    "suggested_names" JSONB,
    "name_validation_results" JSONB,
    "number_of_shareholders" INTEGER NOT NULL DEFAULT 0,
    "business_location" VARCHAR(255),
    "current_step" INTEGER NOT NULL DEFAULT 1,
    "progress_percentage" INTEGER NOT NULL DEFAULT 0,
    "step_data" JSONB,
    "costs" JSONB,
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "created_by" VARCHAR(255) NOT NULL,
    "updated_by" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "submitted_at" TIMESTAMP(3),
    "activities" JSONB,
    "documents" JSONB,
    "managers" JSONB,
    "shareholders" JSONB,
    "mother_company_details" JSONB,
    "request_id" INTEGER NOT NULL,

    CONSTRAINT "company_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request_audit_trails" (
    "id" SERIAL NOT NULL,
    "request_id" INTEGER NOT NULL,
    "request_no" VARCHAR(20) NOT NULL,
    "step" VARCHAR(100) NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "comment" TEXT NOT NULL DEFAULT '',
    "action_by_name" VARCHAR(255) NOT NULL,
    "action_by_type" VARCHAR(20) NOT NULL,
    "metadata" JSONB,
    "is_client_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "request_audit_trails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_users" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role" VARCHAR(20) NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" SERIAL NOT NULL,
    "request_id" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "payment_method" VARCHAR(50) NOT NULL,
    "payment_date" DATE NOT NULL,
    "payment_ref_no" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" VARCHAR(255) NOT NULL,
    "updated_by" VARCHAR(255),
    "payment_link" VARCHAR(500) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requests" (
    "id" SERIAL NOT NULL,
    "request_no" VARCHAR(20) NOT NULL,
    "user_id" INTEGER NOT NULL,
    "request_type" VARCHAR(100) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'in progress',
    "priority" VARCHAR(20) NOT NULL DEFAULT 'normal',
    "title" VARCHAR(255),
    "description" TEXT,
    "payment_status" VARCHAR(20) NOT NULL DEFAULT 'NA',
    "rejected_reason" TEXT,
    "internal_notes" TEXT,
    "client_visible_notes" TEXT,
    "created_by" VARCHAR(255) NOT NULL,
    "updated_by" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "submitted_at" TIMESTAMP(3),
    "reviewed_at" TIMESTAMP(3),
    "approved_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "company_id" INTEGER,
    "stage" VARCHAR(200) NOT NULL DEFAULT 'initial_approval',
    "stage_description" TEXT,
    "process_code" VARCHAR(50) NOT NULL,
    "employee_approved_by" INTEGER,
    "employee_assigned_to" INTEGER,
    "submission_channel" VARCHAR(50),
    "sub_status" VARCHAR(50),

    CONSTRAINT "requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" SERIAL NOT NULL,
    "employee_id" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" VARCHAR(50) NOT NULL,
    "department" VARCHAR(100),
    "phone_number" VARCHAR(20),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_by" VARCHAR(255),
    "updated_by" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request_comments" (
    "id" SERIAL NOT NULL,
    "request_id" INTEGER NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "commentType" VARCHAR(50) NOT NULL,
    "comment" TEXT NOT NULL,
    "is_internal" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "request_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_configs" (
    "id" SERIAL NOT NULL,
    "email" BOOLEAN NOT NULL DEFAULT false,
    "sms" BOOLEAN NOT NULL DEFAULT false,
    "email_title" VARCHAR(255),
    "email_title_ar" VARCHAR(255),
    "email_body" TEXT,
    "email_body_ar" TEXT,
    "sms_text" VARCHAR(500),
    "sms_text_ar" VARCHAR(500),
    "available_variables" JSONB,
    "created_by" VARCHAR(255) NOT NULL,
    "updated_by" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "process_code_id" INTEGER NOT NULL,
    "step_code_id" INTEGER NOT NULL,

    CONSTRAINT "notification_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "process_codes" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name_en" VARCHAR(100) NOT NULL,
    "name_ar" VARCHAR(100) NOT NULL,
    "description_en" TEXT,
    "description_ar" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" VARCHAR(255) NOT NULL,
    "updated_by" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "process_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "step_codes" (
    "id" SERIAL NOT NULL,
    "process_code_id" INTEGER NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "description_en" VARCHAR(255) NOT NULL,
    "description_ar" VARCHAR(255) NOT NULL,
    "order_sequence" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" VARCHAR(255) NOT NULL,
    "updated_by" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "step_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tips" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "description_arabic" TEXT,
    "process_code" VARCHAR(10),
    "status" VARCHAR(50),
    "classification" VARCHAR(20) NOT NULL DEFAULT 'GENERAL',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" INTEGER,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tips_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "files_file_path_key" ON "files"("file_path");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_client_id_key" ON "users"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_emirates_id_key" ON "users"("emirates_id");

-- CreateIndex
CREATE INDEX "users_client_id_idx" ON "users"("client_id");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_mobile_number_idx" ON "users"("mobile_number");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_is_active_idx" ON "users"("is_active");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_passport_number_idx" ON "users"("passport_number");

-- CreateIndex
CREATE INDEX "users_emirates_id_idx" ON "users"("emirates_id");

-- CreateIndex
CREATE INDEX "users_email_verified_idx" ON "users"("email_verified");

-- CreateIndex
CREATE INDEX "users_mobile_verified_idx" ON "users"("mobile_verified");

-- CreateIndex
CREATE INDEX "users_account_activated_idx" ON "users"("account_activated");

-- CreateIndex
CREATE INDEX "users_account_activation_token_idx" ON "users"("account_activation_token");

-- CreateIndex
CREATE INDEX "users_created_by_idx" ON "users"("created_by");

-- CreateIndex
CREATE INDEX "users_updated_by_idx" ON "users"("updated_by");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "users"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_user_id_key" ON "user_preferences"("user_id");

-- CreateIndex
CREATE INDEX "user_preferences_user_id_idx" ON "user_preferences"("user_id");

-- CreateIndex
CREATE INDEX "user_preferences_language_idx" ON "user_preferences"("language");

-- CreateIndex
CREATE INDEX "verification_tokens_token_idx" ON "verification_tokens"("token");

-- CreateIndex
CREATE INDEX "verification_tokens_type_idx" ON "verification_tokens"("type");

-- CreateIndex
CREATE INDEX "verification_tokens_user_id_idx" ON "verification_tokens"("user_id");

-- CreateIndex
CREATE INDEX "verification_tokens_expires_at_idx" ON "verification_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "verification_tokens_used_idx" ON "verification_tokens"("used");

-- CreateIndex
CREATE UNIQUE INDEX "roles_code_key" ON "roles"("code");

-- CreateIndex
CREATE INDEX "roles_code_idx" ON "roles"("code");

-- CreateIndex
CREATE INDEX "roles_status_idx" ON "roles"("status");

-- CreateIndex
CREATE INDEX "company_shareholders_company_id_idx" ON "company_shareholders"("company_id");

-- CreateIndex
CREATE INDEX "company_shareholders_user_id_idx" ON "company_shareholders"("user_id");

-- CreateIndex
CREATE INDEX "company_shareholders_shareholder_company_id_idx" ON "company_shareholders"("shareholder_company_id");

-- CreateIndex
CREATE INDEX "company_shareholders_shareholder_type_idx" ON "company_shareholders"("shareholder_type");

-- CreateIndex
CREATE INDEX "company_shareholders_status_idx" ON "company_shareholders"("status");

-- CreateIndex
CREATE INDEX "company_shareholders_added_date_idx" ON "company_shareholders"("added_date");

-- CreateIndex
CREATE INDEX "company_managers_company_id_idx" ON "company_managers"("company_id");

-- CreateIndex
CREATE INDEX "company_managers_user_id_idx" ON "company_managers"("user_id");

-- CreateIndex
CREATE INDEX "company_managers_status_idx" ON "company_managers"("status");

-- CreateIndex
CREATE INDEX "company_managers_is_primary_idx" ON "company_managers"("is_primary");

-- CreateIndex
CREATE UNIQUE INDEX "company_managers_user_id_company_id_status_key" ON "company_managers"("user_id", "company_id", "status");

-- CreateIndex
CREATE INDEX "company_board_members_company_id_idx" ON "company_board_members"("company_id");

-- CreateIndex
CREATE INDEX "company_board_members_user_id_idx" ON "company_board_members"("user_id");

-- CreateIndex
CREATE INDEX "company_board_members_role_code_idx" ON "company_board_members"("role_code");

-- CreateIndex
CREATE INDEX "company_board_members_status_idx" ON "company_board_members"("status");

-- CreateIndex
CREATE INDEX "company_board_members_is_chairman_idx" ON "company_board_members"("is_chairman");

-- CreateIndex
CREATE UNIQUE INDEX "company_board_members_user_id_company_id_status_key" ON "company_board_members"("user_id", "company_id", "status");

-- CreateIndex
CREATE INDEX "activity_category_name_idx" ON "activity_category"("name");

-- CreateIndex
CREATE INDEX "activity_sub_category_name_idx" ON "activity_sub_category"("name");

-- CreateIndex
CREATE INDEX "activity_sub_category_category_id_idx" ON "activity_sub_category"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "activities_activity_code_key" ON "activities"("activity_code");

-- CreateIndex
CREATE INDEX "activities_name_idx" ON "activities"("name");

-- CreateIndex
CREATE INDEX "activities_activity_code_idx" ON "activities"("activity_code");

-- CreateIndex
CREATE INDEX "activities_activity_category_id_idx" ON "activities"("activity_category_id");

-- CreateIndex
CREATE INDEX "activities_sub_category_id_idx" ON "activities"("sub_category_id");

-- CreateIndex
CREATE INDEX "activities_created_by_idx" ON "activities"("created_by");

-- CreateIndex
CREATE INDEX "activities_updated_by_idx" ON "activities"("updated_by");

-- CreateIndex
CREATE INDEX "activities_created_at_idx" ON "activities"("created_at");

-- CreateIndex
CREATE INDEX "activity_attachments_activity_id_idx" ON "activity_attachments"("activity_id");

-- CreateIndex
CREATE INDEX "activity_attachments_type_idx" ON "activity_attachments"("type");

-- CreateIndex
CREATE INDEX "activity_attachments_mandatory_idx" ON "activity_attachments"("mandatory");

-- CreateIndex
CREATE INDEX "activity_attachments_status_idx" ON "activity_attachments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "project_locations_project_code_key" ON "project_locations"("project_code");

-- CreateIndex
CREATE INDEX "project_locations_project_code_idx" ON "project_locations"("project_code");

-- CreateIndex
CREATE UNIQUE INDEX "countries_code_key" ON "countries"("code");

-- CreateIndex
CREATE UNIQUE INDEX "countries_iso_code_key" ON "countries"("iso_code");

-- CreateIndex
CREATE INDEX "countries_code_idx" ON "countries"("code");

-- CreateIndex
CREATE INDEX "countries_iso_code_idx" ON "countries"("iso_code");

-- CreateIndex
CREATE UNIQUE INDEX "lease_lease_number_key" ON "lease"("lease_number");

-- CreateIndex
CREATE INDEX "lease_lease_number_idx" ON "lease"("lease_number");

-- CreateIndex
CREATE INDEX "lease_status_idx" ON "lease"("status");

-- CreateIndex
CREATE UNIQUE INDEX "trade_names_request_id_key" ON "trade_names"("request_id");

-- CreateIndex
CREATE INDEX "trade_names_request_id_idx" ON "trade_names"("request_id");

-- CreateIndex
CREATE INDEX "trade_names_user_id_idx" ON "trade_names"("user_id");

-- CreateIndex
CREATE INDEX "trade_names_tradeNameStatus_idx" ON "trade_names"("tradeNameStatus");

-- CreateIndex
CREATE UNIQUE INDEX "initial_approvals_request_id_key" ON "initial_approvals"("request_id");

-- CreateIndex
CREATE UNIQUE INDEX "initial_approvals_company_id_key" ON "initial_approvals"("company_id");

-- CreateIndex
CREATE INDEX "initial_approvals_request_id_idx" ON "initial_approvals"("request_id");

-- CreateIndex
CREATE INDEX "initial_approvals_company_id_idx" ON "initial_approvals"("company_id");

-- CreateIndex
CREATE INDEX "initial_approvals_user_id_idx" ON "initial_approvals"("user_id");

-- CreateIndex
CREATE INDEX "initial_approvals_status_idx" ON "initial_approvals"("status");

-- CreateIndex
CREATE INDEX "initial_approvals_legal_type_idx" ON "initial_approvals"("legal_type");

-- CreateIndex
CREATE INDEX "initial_approvals_created_at_idx" ON "initial_approvals"("created_at");

-- CreateIndex
CREATE INDEX "initial_approvals_mother_company_id_idx" ON "initial_approvals"("mother_company_id");

-- CreateIndex
CREATE INDEX "initial_approvals_ns_reference_number_idx" ON "initial_approvals"("ns_reference_number");

-- CreateIndex
CREATE INDEX "initial_approvals_ns_status_idx" ON "initial_approvals"("ns_status");

-- CreateIndex
CREATE INDEX "initial_approvals_ns_submitted_at_idx" ON "initial_approvals"("ns_submitted_at");

-- CreateIndex
CREATE INDEX "initial_approvals_ns_last_checked_at_idx" ON "initial_approvals"("ns_last_checked_at");

-- CreateIndex
CREATE INDEX "initial_approvals_ns_submission_status_idx" ON "initial_approvals"("ns_submission_status");

-- CreateIndex
CREATE INDEX "initial_approvals_ns_submission_successful_idx" ON "initial_approvals"("ns_submission_successful");

-- CreateIndex
CREATE INDEX "initial_approvals_ns_retry_count_idx" ON "initial_approvals"("ns_retry_count");

-- CreateIndex
CREATE INDEX "initial_approvals_ns_last_attempt_at_idx" ON "initial_approvals"("ns_last_attempt_at");

-- CreateIndex
CREATE INDEX "initial_approvals_ns_queue_job_id_idx" ON "initial_approvals"("ns_queue_job_id");

-- CreateIndex
CREATE INDEX "initial_approvals_ns_queued_at_idx" ON "initial_approvals"("ns_queued_at");

-- CreateIndex
CREATE INDEX "initial_approvals_ns_queue_job_status_idx" ON "initial_approvals"("ns_queue_job_status");

-- CreateIndex
CREATE INDEX "facilities_facility_type_idx" ON "facilities"("facility_type");

-- CreateIndex
CREATE INDEX "generated_documents_trade_name_id_idx" ON "generated_documents"("trade_name_id");

-- CreateIndex
CREATE INDEX "generated_documents_request_id_idx" ON "generated_documents"("request_id");

-- CreateIndex
CREATE INDEX "generated_documents_initial_approval_id_idx" ON "generated_documents"("initial_approval_id");

-- CreateIndex
CREATE INDEX "generated_documents_document_type_idx" ON "generated_documents"("document_type");

-- CreateIndex
CREATE INDEX "generated_documents_status_idx" ON "generated_documents"("status");

-- CreateIndex
CREATE INDEX "generated_documents_generated_by_idx" ON "generated_documents"("generated_by");

-- CreateIndex
CREATE INDEX "request_documents_request_id_idx" ON "request_documents"("request_id");

-- CreateIndex
CREATE INDEX "request_documents_document_type_idx" ON "request_documents"("document_type");

-- CreateIndex
CREATE INDEX "request_documents_status_idx" ON "request_documents"("status");

-- CreateIndex
CREATE UNIQUE INDEX "companies_license_number_key" ON "companies"("license_number");

-- CreateIndex
CREATE UNIQUE INDEX "companies_request_id_key" ON "companies"("request_id");

-- CreateIndex
CREATE INDEX "companies_license_number_idx" ON "companies"("license_number");

-- CreateIndex
CREATE INDEX "companies_company_name_idx" ON "companies"("company_name");

-- CreateIndex
CREATE INDEX "companies_status_idx" ON "companies"("status");

-- CreateIndex
CREATE INDEX "companies_stage_idx" ON "companies"("stage");

-- CreateIndex
CREATE INDEX "companies_issuing_authority_idx" ON "companies"("issuing_authority");

-- CreateIndex
CREATE INDEX "companies_legal_type_idx" ON "companies"("legal_type");

-- CreateIndex
CREATE INDEX "companies_license_type_idx" ON "companies"("license_type");

-- CreateIndex
CREATE INDEX "companies_mother_company_id_idx" ON "companies"("mother_company_id");

-- CreateIndex
CREATE INDEX "companies_request_id_idx" ON "companies"("request_id");

-- CreateIndex
CREATE INDEX "companies_lease_id_idx" ON "companies"("lease_id");

-- CreateIndex
CREATE INDEX "companies_created_by_idx" ON "companies"("created_by");

-- CreateIndex
CREATE INDEX "companies_updated_by_idx" ON "companies"("updated_by");

-- CreateIndex
CREATE INDEX "companies_approved_by_idx" ON "companies"("approved_by");

-- CreateIndex
CREATE INDEX "companies_issue_date_idx" ON "companies"("issue_date");

-- CreateIndex
CREATE INDEX "companies_expiry_date_idx" ON "companies"("expiry_date");

-- CreateIndex
CREATE UNIQUE INDEX "company_applications_request_id_key" ON "company_applications"("request_id");

-- CreateIndex
CREATE INDEX "company_applications_request_id_idx" ON "company_applications"("request_id");

-- CreateIndex
CREATE INDEX "company_applications_user_id_idx" ON "company_applications"("user_id");

-- CreateIndex
CREATE INDEX "company_applications_status_idx" ON "company_applications"("status");

-- CreateIndex
CREATE INDEX "company_applications_business_category_id_idx" ON "company_applications"("business_category_id");

-- CreateIndex
CREATE INDEX "request_audit_trails_request_id_idx" ON "request_audit_trails"("request_id");

-- CreateIndex
CREATE INDEX "request_audit_trails_request_no_idx" ON "request_audit_trails"("request_no");

-- CreateIndex
CREATE INDEX "request_audit_trails_step_idx" ON "request_audit_trails"("step");

-- CreateIndex
CREATE INDEX "request_audit_trails_action_idx" ON "request_audit_trails"("action");

-- CreateIndex
CREATE INDEX "request_audit_trails_action_by_type_idx" ON "request_audit_trails"("action_by_type");

-- CreateIndex
CREATE INDEX "request_audit_trails_created_at_idx" ON "request_audit_trails"("created_at");

-- CreateIndex
CREATE INDEX "request_audit_trails_is_client_visible_idx" ON "request_audit_trails"("is_client_visible");

-- CreateIndex
CREATE INDEX "company_users_company_id_idx" ON "company_users"("company_id");

-- CreateIndex
CREATE INDEX "company_users_user_id_idx" ON "company_users"("user_id");

-- CreateIndex
CREATE INDEX "company_users_role_idx" ON "company_users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "company_users_company_id_user_id_key" ON "company_users"("company_id", "user_id");

-- CreateIndex
CREATE INDEX "payments_request_id_idx" ON "payments"("request_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_payment_date_idx" ON "payments"("payment_date");

-- CreateIndex
CREATE UNIQUE INDEX "requests_request_no_key" ON "requests"("request_no");

-- CreateIndex
CREATE INDEX "requests_request_no_idx" ON "requests"("request_no");

-- CreateIndex
CREATE INDEX "requests_user_id_idx" ON "requests"("user_id");

-- CreateIndex
CREATE INDEX "requests_company_id_idx" ON "requests"("company_id");

-- CreateIndex
CREATE INDEX "requests_status_idx" ON "requests"("status");

-- CreateIndex
CREATE INDEX "requests_sub_status_idx" ON "requests"("sub_status");

-- CreateIndex
CREATE INDEX "requests_priority_idx" ON "requests"("priority");

-- CreateIndex
CREATE INDEX "requests_request_type_idx" ON "requests"("request_type");

-- CreateIndex
CREATE INDEX "requests_payment_status_idx" ON "requests"("payment_status");

-- CreateIndex
CREATE INDEX "requests_created_by_idx" ON "requests"("created_by");

-- CreateIndex
CREATE INDEX "requests_updated_by_idx" ON "requests"("updated_by");

-- CreateIndex
CREATE INDEX "requests_created_at_idx" ON "requests"("created_at");

-- CreateIndex
CREATE INDEX "requests_submitted_at_idx" ON "requests"("submitted_at");

-- CreateIndex
CREATE INDEX "requests_employee_assigned_to_idx" ON "requests"("employee_assigned_to");

-- CreateIndex
CREATE INDEX "requests_employee_approved_by_idx" ON "requests"("employee_approved_by");

-- CreateIndex
CREATE UNIQUE INDEX "employees_employee_id_key" ON "employees"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "employees_email_key" ON "employees"("email");

-- CreateIndex
CREATE INDEX "employees_employee_id_idx" ON "employees"("employee_id");

-- CreateIndex
CREATE INDEX "employees_email_idx" ON "employees"("email");

-- CreateIndex
CREATE INDEX "employees_role_idx" ON "employees"("role");

-- CreateIndex
CREATE INDEX "employees_department_idx" ON "employees"("department");

-- CreateIndex
CREATE INDEX "employees_is_active_idx" ON "employees"("is_active");

-- CreateIndex
CREATE INDEX "request_comments_request_id_idx" ON "request_comments"("request_id");

-- CreateIndex
CREATE INDEX "request_comments_employee_id_idx" ON "request_comments"("employee_id");

-- CreateIndex
CREATE INDEX "request_comments_commentType_idx" ON "request_comments"("commentType");

-- CreateIndex
CREATE INDEX "notification_configs_process_code_id_idx" ON "notification_configs"("process_code_id");

-- CreateIndex
CREATE INDEX "notification_configs_step_code_id_idx" ON "notification_configs"("step_code_id");

-- CreateIndex
CREATE INDEX "notification_configs_email_idx" ON "notification_configs"("email");

-- CreateIndex
CREATE INDEX "notification_configs_sms_idx" ON "notification_configs"("sms");

-- CreateIndex
CREATE INDEX "notification_configs_created_by_idx" ON "notification_configs"("created_by");

-- CreateIndex
CREATE INDEX "notification_configs_updated_by_idx" ON "notification_configs"("updated_by");

-- CreateIndex
CREATE INDEX "notification_configs_created_at_idx" ON "notification_configs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "notification_configs_process_code_id_step_code_id_key" ON "notification_configs"("process_code_id", "step_code_id");

-- CreateIndex
CREATE UNIQUE INDEX "process_codes_code_key" ON "process_codes"("code");

-- CreateIndex
CREATE INDEX "process_codes_code_idx" ON "process_codes"("code");

-- CreateIndex
CREATE INDEX "process_codes_is_active_idx" ON "process_codes"("is_active");

-- CreateIndex
CREATE INDEX "process_codes_created_by_idx" ON "process_codes"("created_by");

-- CreateIndex
CREATE INDEX "process_codes_updated_by_idx" ON "process_codes"("updated_by");

-- CreateIndex
CREATE INDEX "process_codes_created_at_idx" ON "process_codes"("created_at");

-- CreateIndex
CREATE INDEX "step_codes_process_code_id_idx" ON "step_codes"("process_code_id");

-- CreateIndex
CREATE INDEX "step_codes_code_idx" ON "step_codes"("code");

-- CreateIndex
CREATE INDEX "step_codes_is_active_idx" ON "step_codes"("is_active");

-- CreateIndex
CREATE INDEX "step_codes_order_sequence_idx" ON "step_codes"("order_sequence");

-- CreateIndex
CREATE INDEX "step_codes_created_by_idx" ON "step_codes"("created_by");

-- CreateIndex
CREATE INDEX "step_codes_updated_by_idx" ON "step_codes"("updated_by");

-- CreateIndex
CREATE INDEX "step_codes_created_at_idx" ON "step_codes"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "step_codes_process_code_id_code_key" ON "step_codes"("process_code_id", "code");

-- CreateIndex
CREATE INDEX "tips_process_code_idx" ON "tips"("process_code");

-- CreateIndex
CREATE INDEX "tips_is_active_idx" ON "tips"("is_active");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_country_fkey" FOREIGN KEY ("country") REFERENCES "countries"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_fkey" FOREIGN KEY ("role") REFERENCES "roles"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_tokens" ADD CONSTRAINT "verification_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_shareholders" ADD CONSTRAINT "company_shareholders_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_shareholders" ADD CONSTRAINT "company_shareholders_shareholder_company_id_fkey" FOREIGN KEY ("shareholder_company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_shareholders" ADD CONSTRAINT "company_shareholders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_managers" ADD CONSTRAINT "company_managers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_managers" ADD CONSTRAINT "company_managers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_board_members" ADD CONSTRAINT "company_board_members_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_board_members" ADD CONSTRAINT "company_board_members_role_code_fkey" FOREIGN KEY ("role_code") REFERENCES "roles"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_board_members" ADD CONSTRAINT "company_board_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_sub_category" ADD CONSTRAINT "activity_sub_category_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "activity_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_activity_category_id_fkey" FOREIGN KEY ("activity_category_id") REFERENCES "activity_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_sub_category_id_fkey" FOREIGN KEY ("sub_category_id") REFERENCES "activity_sub_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_attachments" ADD CONSTRAINT "activity_attachments_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_names" ADD CONSTRAINT "trade_names_activity_category_id_fkey" FOREIGN KEY ("activity_category_id") REFERENCES "activity_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_names" ADD CONSTRAINT "trade_names_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_names" ADD CONSTRAINT "trade_names_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "initial_approvals" ADD CONSTRAINT "initial_approvals_activity_group_id_fkey" FOREIGN KEY ("activity_group_id") REFERENCES "activity_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "initial_approvals" ADD CONSTRAINT "initial_approvals_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "initial_approvals" ADD CONSTRAINT "initial_approvals_mother_company_id_fkey" FOREIGN KEY ("mother_company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "initial_approvals" ADD CONSTRAINT "initial_approvals_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "initial_approvals" ADD CONSTRAINT "initial_approvals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_documents" ADD CONSTRAINT "generated_documents_trade_name_id_fkey" FOREIGN KEY ("trade_name_id") REFERENCES "trade_names"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_documents" ADD CONSTRAINT "generated_documents_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_documents" ADD CONSTRAINT "generated_documents_initial_approval_id_fkey" FOREIGN KEY ("initial_approval_id") REFERENCES "initial_approvals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_documents" ADD CONSTRAINT "request_documents_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_documents" ADD CONSTRAINT "request_documents_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_lease_id_fkey" FOREIGN KEY ("lease_id") REFERENCES "lease"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_mother_company_id_fkey" FOREIGN KEY ("mother_company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_trade_name_id_fkey" FOREIGN KEY ("trade_name_id") REFERENCES "trade_names"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_applications" ADD CONSTRAINT "company_applications_business_category_id_fkey" FOREIGN KEY ("business_category_id") REFERENCES "activity_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_applications" ADD CONSTRAINT "company_applications_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_applications" ADD CONSTRAINT "company_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_audit_trails" ADD CONSTRAINT "request_audit_trails_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_users" ADD CONSTRAINT "company_users_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_users" ADD CONSTRAINT "company_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_employee_approved_by_fkey" FOREIGN KEY ("employee_approved_by") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_employee_assigned_to_fkey" FOREIGN KEY ("employee_assigned_to") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_comments" ADD CONSTRAINT "request_comments_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_comments" ADD CONSTRAINT "request_comments_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_configs" ADD CONSTRAINT "notification_configs_process_code_id_fkey" FOREIGN KEY ("process_code_id") REFERENCES "process_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_configs" ADD CONSTRAINT "notification_configs_step_code_id_fkey" FOREIGN KEY ("step_code_id") REFERENCES "step_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "step_codes" ADD CONSTRAINT "step_codes_process_code_id_fkey" FOREIGN KEY ("process_code_id") REFERENCES "process_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tips" ADD CONSTRAINT "tips_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tips" ADD CONSTRAINT "tips_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;
