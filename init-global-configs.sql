CREATE TABLE IF NOT EXISTS global_configs (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    data_type VARCHAR(20) DEFAULT 'string',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default platform configurations
INSERT INTO global_configs (key, value, category, description, data_type) VALUES
-- Commission rates
('doctor_commission_rate', '15', 'commission', 'Doctor commission percentage', 'number'),
('platform_commission_rate', '5', 'commission', 'Platform commission percentage', 'number'),

-- Feature flags
('enable_chat_support', 'true', 'features', 'Enable chat support', 'boolean'),

-- Notification settings
('email_notifications', 'true', 'notifications', 'Enable email notifications', 'boolean'),
('sms_notifications', 'true', 'notifications', 'Enable SMS notifications', 'boolean'),
('push_notifications', 'true', 'notifications', 'Enable push notifications', 'boolean'),
('notification_retry_count', '3', 'notifications', 'Notification retry attempts', 'number'),



ON CONFLICT (key) DO NOTHING;