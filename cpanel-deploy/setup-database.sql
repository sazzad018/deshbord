-- Social Ads Expert CRM - MySQL Database Schema
-- Compatible with MySQL 5.7+
-- Import this file using phpMyAdmin or MySQL command line

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- ADMIN USERS TABLE
-- ============================================
DROP TABLE IF EXISTS `admin_users`;
CREATE TABLE `admin_users` (
  `id` VARCHAR(36) PRIMARY KEY,
  `username` TEXT NOT NULL,
  `password` TEXT NOT NULL,
  `full_name` TEXT NOT NULL,
  `email` TEXT,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `username_unique` (`username`(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user (username: admin, password: admin123)
INSERT INTO `admin_users` (`id`, `username`, `password`, `full_name`, `is_active`) VALUES
(UUID(), 'admin', '$2b$10$vegxq0xoqsof3LUGLsNJMON2cICrfgTj5Mik2UnqwZLPmlkDG9NCS', 'System Administrator', TRUE);

-- ============================================
-- CLIENTS TABLE
-- ============================================
DROP TABLE IF EXISTS `clients`;
CREATE TABLE `clients` (
  `id` VARCHAR(36) PRIMARY KEY,
  `name` TEXT NOT NULL,
  `phone` TEXT NOT NULL,
  `fb` TEXT,
  `profile_picture` TEXT,
  `status` TEXT NOT NULL DEFAULT 'Active',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `wallet_deposited` INT NOT NULL DEFAULT 0,
  `wallet_spent` INT NOT NULL DEFAULT 0,
  `scopes` JSON NOT NULL,
  `portal_key` TEXT NOT NULL,
  `admin_notes` TEXT,
  `category` TEXT NOT NULL DEFAULT 'general',
  `deleted` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SPEND LOGS TABLE
-- ============================================
DROP TABLE IF EXISTS `spend_logs`;
CREATE TABLE `spend_logs` (
  `id` VARCHAR(36) PRIMARY KEY,
  `client_id` VARCHAR(36) NOT NULL,
  `date` TEXT NOT NULL,
  `amount` INT NOT NULL,
  `note` TEXT,
  `balance_after` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SERVICE SCOPES TABLE
-- ============================================
DROP TABLE IF EXISTS `service_scopes`;
CREATE TABLE `service_scopes` (
  `id` VARCHAR(36) PRIMARY KEY,
  `client_id` VARCHAR(36) NOT NULL,
  `service_name` TEXT NOT NULL,
  `scope` TEXT NOT NULL,
  `status` TEXT NOT NULL DEFAULT 'Active',
  `start_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `end_date` TIMESTAMP NULL,
  `notes` TEXT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- MEETINGS TABLE
-- ============================================
DROP TABLE IF EXISTS `meetings`;
CREATE TABLE `meetings` (
  `id` VARCHAR(36) PRIMARY KEY,
  `client_id` VARCHAR(36) NOT NULL,
  `title` TEXT NOT NULL,
  `datetime` DATETIME NOT NULL,
  `location` TEXT NOT NULL,
  `reminders` JSON NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TODOS TABLE
-- ============================================
DROP TABLE IF EXISTS `todos`;
CREATE TABLE `todos` (
  `id` VARCHAR(36) PRIMARY KEY,
  `title` TEXT NOT NULL,
  `description` TEXT,
  `priority` TEXT NOT NULL DEFAULT 'Medium',
  `status` TEXT NOT NULL DEFAULT 'Pending',
  `due_date` DATETIME,
  `client_id` VARCHAR(36),
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- WHATSAPP TEMPLATES TABLE
-- ============================================
DROP TABLE IF EXISTS `whatsapp_templates`;
CREATE TABLE `whatsapp_templates` (
  `id` VARCHAR(36) PRIMARY KEY,
  `name` TEXT NOT NULL,
  `message` TEXT NOT NULL,
  `is_default` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- COMPANY SETTINGS TABLE
-- ============================================
DROP TABLE IF EXISTS `company_settings`;
CREATE TABLE `company_settings` (
  `id` VARCHAR(36) PRIMARY KEY,
  `company_name` TEXT NOT NULL DEFAULT 'Social Ads Expert',
  `company_email` TEXT,
  `company_phone` TEXT,
  `company_website` TEXT,
  `company_address` TEXT,
  `logo_url` TEXT,
  `brand_color` TEXT NOT NULL DEFAULT '#A576FF',
  `usd_exchange_rate` INT NOT NULL DEFAULT 14500,
  `base_currency` TEXT NOT NULL DEFAULT 'USD',
  `display_currency` TEXT NOT NULL DEFAULT 'BDT',
  `is_default` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- WEBSITE PROJECTS TABLE
-- ============================================
DROP TABLE IF EXISTS `website_projects`;
CREATE TABLE `website_projects` (
  `id` VARCHAR(36) PRIMARY KEY,
  `client_id` VARCHAR(36) NOT NULL,
  `project_name` VARCHAR(255) NOT NULL,
  `portal_key` VARCHAR(255) NOT NULL,
  `project_status` VARCHAR(50) NOT NULL DEFAULT 'In Progress',
  `website_url` VARCHAR(255),
  `website_username` TEXT,
  `website_password` TEXT,
  `cpanel_username` TEXT,
  `cpanel_password` TEXT,
  `nameserver1` TEXT,
  `nameserver2` TEXT,
  `service_provider` TEXT,
  `notes` TEXT,
  `completed_date` DATETIME,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `portal_key_unique` (`portal_key`),
  FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- CUSTOM BUTTONS TABLE
-- ============================================
DROP TABLE IF EXISTS `custom_buttons`;
CREATE TABLE `custom_buttons` (
  `id` VARCHAR(36) PRIMARY KEY,
  `title` TEXT NOT NULL,
  `description` TEXT,
  `url` TEXT NOT NULL,
  `icon` TEXT DEFAULT 'ExternalLink',
  `color` TEXT DEFAULT 'primary',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INVOICES TABLE
-- ============================================
DROP TABLE IF EXISTS `invoices`;
CREATE TABLE `invoices` (
  `id` VARCHAR(36) PRIMARY KEY,
  `invoice_no` TEXT NOT NULL,
  `client_id` VARCHAR(36) NOT NULL,
  `company_id` VARCHAR(36),
  `issue_date` TEXT NOT NULL,
  `start_date` TEXT,
  `end_date` TEXT,
  `currency` TEXT NOT NULL DEFAULT 'BDT',
  `sub_total` INT NOT NULL DEFAULT 0,
  `discount_pct` INT NOT NULL DEFAULT 0,
  `discount_amt` INT NOT NULL DEFAULT 0,
  `vat_pct` INT NOT NULL DEFAULT 0,
  `vat_amt` INT NOT NULL DEFAULT 0,
  `grand_total` INT NOT NULL DEFAULT 0,
  `notes` TEXT,
  `status` TEXT NOT NULL DEFAULT 'Draft',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `invoice_no_unique` (`invoice_no`(255)),
  FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`company_id`) REFERENCES `company_settings`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INVOICE ITEMS TABLE
-- ============================================
DROP TABLE IF EXISTS `invoice_items`;
CREATE TABLE `invoice_items` (
  `id` VARCHAR(36) PRIMARY KEY,
  `invoice_id` VARCHAR(36) NOT NULL,
  `description` TEXT NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `rate` INT NOT NULL DEFAULT 0,
  `amount` INT NOT NULL DEFAULT 0,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- UPLOADS TABLE
-- ============================================
DROP TABLE IF EXISTS `uploads`;
CREATE TABLE `uploads` (
  `id` VARCHAR(36) PRIMARY KEY,
  `file_name` TEXT NOT NULL,
  `mime_type` TEXT NOT NULL,
  `size` INT NOT NULL,
  `data` LONGTEXT NOT NULL,
  `uploaded_by` TEXT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INVOICE PDFS TABLE
-- ============================================
DROP TABLE IF EXISTS `invoice_pdfs`;
CREATE TABLE `invoice_pdfs` (
  `id` VARCHAR(36) PRIMARY KEY,
  `invoice_no` TEXT NOT NULL,
  `client_id` VARCHAR(36) NOT NULL,
  `file_name` TEXT NOT NULL,
  `mime_type` TEXT NOT NULL DEFAULT 'application/pdf',
  `size` INT NOT NULL,
  `data` LONGTEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- QUICK MESSAGES TABLE
-- ============================================
DROP TABLE IF EXISTS `quick_messages`;
CREATE TABLE `quick_messages` (
  `id` VARCHAR(36) PRIMARY KEY,
  `title` TEXT NOT NULL,
  `message` TEXT NOT NULL,
  `category` TEXT DEFAULT 'general',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PAYMENT REQUESTS TABLE
-- ============================================
DROP TABLE IF EXISTS `payment_requests`;
CREATE TABLE `payment_requests` (
  `id` VARCHAR(36) PRIMARY KEY,
  `client_id` VARCHAR(36) NOT NULL,
  `amount` INT NOT NULL,
  `payment_method` TEXT NOT NULL,
  `account_number` TEXT,
  `transaction_id` TEXT,
  `status` TEXT NOT NULL DEFAULT 'Pending',
  `note` TEXT,
  `admin_note` TEXT,
  `request_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `processed_date` DATETIME,
  `processed_by` TEXT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PROJECT TYPES TABLE
-- ============================================
DROP TABLE IF EXISTS `project_types`;
CREATE TABLE `project_types` (
  `id` VARCHAR(36) PRIMARY KEY,
  `name` TEXT NOT NULL,
  `display_name` TEXT NOT NULL,
  `description` TEXT,
  `is_default` BOOLEAN NOT NULL DEFAULT FALSE,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `name_unique` (`name`(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PROJECTS TABLE
-- ============================================
DROP TABLE IF EXISTS `projects`;
CREATE TABLE `projects` (
  `id` VARCHAR(36) PRIMARY KEY,
  `name` TEXT NOT NULL,
  `type` TEXT NOT NULL,
  `client_id` VARCHAR(36),
  `description` TEXT,
  `total_amount` INT NOT NULL DEFAULT 0,
  `advance_received` INT NOT NULL DEFAULT 0,
  `due_amount` INT NOT NULL DEFAULT 0,
  `status` TEXT NOT NULL DEFAULT 'pending',
  `progress` INT NOT NULL DEFAULT 0,
  `start_date` DATETIME,
  `end_date` DATETIME,
  `public_url` TEXT,
  `features` JSON NOT NULL,
  `completed_features` JSON NOT NULL,
  `admin_notes` TEXT,
  `second_payment_date` DATETIME,
  `third_payment_date` DATETIME,
  `payment_completed` BOOLEAN NOT NULL DEFAULT FALSE,
  `wp_username` TEXT,
  `wp_password` TEXT,
  `cpanel_username` TEXT,
  `cpanel_password` TEXT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- EMPLOYEES TABLE
-- ============================================
DROP TABLE IF EXISTS `employees`;
CREATE TABLE `employees` (
  `id` VARCHAR(36) PRIMARY KEY,
  `name` TEXT NOT NULL,
  `email` TEXT,
  `phone` TEXT,
  `role` TEXT NOT NULL DEFAULT 'developer',
  `total_income` INT NOT NULL DEFAULT 0,
  `total_advance` INT NOT NULL DEFAULT 0,
  `total_due` INT NOT NULL DEFAULT 0,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `portal_key` TEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PROJECT ASSIGNMENTS TABLE
-- ============================================
DROP TABLE IF EXISTS `project_assignments`;
CREATE TABLE `project_assignments` (
  `id` VARCHAR(36) PRIMARY KEY,
  `project_id` VARCHAR(36) NOT NULL,
  `employee_id` VARCHAR(36) NOT NULL,
  `assigned_features` JSON NOT NULL,
  `completed_features` JSON NOT NULL,
  `hourly_rate` INT NOT NULL DEFAULT 0,
  `total_earned` INT NOT NULL DEFAULT 0,
  `status` TEXT NOT NULL DEFAULT 'assigned',
  `assigned_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_date` DATETIME,
  FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PROJECT PAYMENTS TABLE
-- ============================================
DROP TABLE IF EXISTS `project_payments`;
CREATE TABLE `project_payments` (
  `id` VARCHAR(36) PRIMARY KEY,
  `project_id` VARCHAR(36) NOT NULL,
  `amount` INT NOT NULL,
  `payment_method` TEXT,
  `transaction_id` TEXT,
  `payment_date` DATETIME NOT NULL,
  `notes` TEXT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SALARY PAYMENTS TABLE
-- ============================================
DROP TABLE IF EXISTS `salary_payments`;
CREATE TABLE `salary_payments` (
  `id` VARCHAR(36) PRIMARY KEY,
  `employee_id` VARCHAR(36) NOT NULL,
  `project_id` VARCHAR(36),
  `amount` INT NOT NULL,
  `type` TEXT NOT NULL,
  `payment_method` TEXT,
  `transaction_id` TEXT,
  `payment_date` DATETIME NOT NULL,
  `notes` TEXT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- IMPORTANT NOTES
-- ============================================
-- 1. Default admin user password is "admin123"
-- 2. You MUST change the admin password after first login
-- 3. The password hash above is placeholder - use setup-database.js instead
-- 4. Or manually hash your password using bcrypt online tool
-- 5. All tables use utf8mb4 for Bengali language support
-- 6. JSON columns require MySQL 5.7+
-- 
-- ============================================
-- RECOMMENDED: Use setup-database.js instead
-- ============================================
-- This SQL file creates the structure but has a placeholder password.
-- For production use, run: node setup-database.js
-- Which will create tables AND insert admin with proper bcrypt hash.
