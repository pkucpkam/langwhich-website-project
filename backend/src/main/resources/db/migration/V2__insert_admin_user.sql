-- ==========================================
-- 🎯 FLYWAY DML MIGRATION SCRIPT
-- Version: V2__insert_admin_user.sql
-- Description: Insert a default admin user into the database if they don't already exist.
-- Password: admin123 (BCrypt encrypted)
-- ==========================================

INSERT INTO users (username, email, password, role, is_active, created_at)
SELECT 'admin', 'admin@langwhich.com', '$2b$10$6A0KvXWUMcvQ0Su4VhiQRO/GUFM0o6ctx.KRlXHpsCJUVWjVUI/0q', 'ADMIN', true, CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE username = 'admin' OR email = 'admin@langwhich.com'
);
