-- Migration: ensure default admin user has role = 'Admin'
UPDATE users
SET role = 'Admin'
WHERE email = 'admin@shopsweet.local' AND role <> 'Admin';
