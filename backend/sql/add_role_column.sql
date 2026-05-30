-- Migration: add role column if missing and set default values
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'Customer';

-- Set any NULL or empty roles to 'Customer'
UPDATE users SET role = 'Customer' WHERE role IS NULL OR trim(role) = '';

-- Ensure the default admin email has Admin role
UPDATE users SET role = 'Admin' WHERE email = 'admin@shopsweet.local' AND role <> 'Admin';

-- Optional: set default for future inserts (in case it wasn't set)
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'Customer';
