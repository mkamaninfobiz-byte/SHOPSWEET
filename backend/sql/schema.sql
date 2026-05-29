-- ShopSweet Enterprise SaaS schema

CREATE DATABASE IF NOT EXISTS shopsweet DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE shopsweet;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS dashboards;
DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS analytics;
DROP TABLE IF EXISTS tokens_blacklist;
DROP TABLE IF EXISTS tokens;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS password_resets;
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS permissions_map;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS modules;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS subcategories;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS product_variants;
DROP TABLE IF EXISTS product_tags;
DROP TABLE IF EXISTS product_attributes;
DROP TABLE IF EXISTS suppliers;
DROP TABLE IF EXISTS purchases;
DROP TABLE IF EXISTS stock_logs;
DROP TABLE IF EXISTS purchase_orders;
DROP TABLE IF EXISTS purchase_order_items;
DROP TABLE IF EXISTS coupons;
DROP TABLE IF EXISTS coupon_usage;
DROP TABLE IF EXISTS carts;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS order_notifications;
DROP TABLE IF EXISTS order_comments;
DROP TABLE IF EXISTS order_status_logs;
DROP TABLE IF EXISTS refunds;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS addresses;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS product_reviews_summary;
DROP TABLE IF EXISTS ratings;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS inventory_audits;
DROP TABLE IF EXISTS promotional_modules;
DROP TABLE IF EXISTS service_messages;
DROP TABLE IF EXISTS access_tokens;
DROP TABLE IF EXISTS notification_templates;
DROP TABLE IF EXISTS product_collections;
DROP TABLE IF EXISTS collection_items;
DROP TABLE IF EXISTS webhooks;
DROP TABLE IF EXISTS webhook_deliveries;
DROP TABLE IF EXISTS phone_verifications;
DROP TABLE IF EXISTS staff_activity_metrics;
DROP TABLE IF EXISTS product_views;
DROP TABLE IF EXISTS sales_targets;
DROP TABLE IF EXISTS kpi_metrics;
DROP TABLE IF EXISTS storefront_settings;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS media_files;
DROP TABLE IF EXISTS posters;
DROP TABLE IF EXISTS settings;
DROP TABLE IF EXISTS logs;
DROP TABLE IF EXISTS modules;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL,
  description VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE modules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  description VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE permissions_map (
  id INT PRIMARY KEY AUTO_INCREMENT,
  module_id INT,
  permission_id INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (module_id) REFERENCES modules(id),
  FOREIGN KEY (permission_id) REFERENCES permissions(id)
) ENGINE=InnoDB;

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(30),
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'Customer',
  address TEXT,
  status VARCHAR(50) DEFAULT 'active',
  last_login DATETIME,
  deleted_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE user_roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  role_id INT NOT NULL,
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB;

CREATE TABLE role_permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id),
  FOREIGN KEY (permission_id) REFERENCES permissions(id)
) ENGINE=InnoDB;

CREATE TABLE sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  token VARCHAR(500) NOT NULL,
  ip_address VARCHAR(45),
  user_agent VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  token VARCHAR(500) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE tokens_blacklist (
  id INT PRIMARY KEY AUTO_INCREMENT,
  token VARCHAR(500) NOT NULL,
  invalidated_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE password_resets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  description TEXT,
  parent_id INT DEFAULT NULL,
  deleted_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id)
) ENGINE=InnoDB;

CREATE TABLE subcategories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  category_id INT NOT NULL,
  name VARCHAR(120) NOT NULL,
  description TEXT,
  deleted_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB;

CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  category_id INT,
  sku VARCHAR(100) UNIQUE,
  stock_quantity INT DEFAULT 0,
  reorder_level INT DEFAULT 0,
  featured TINYINT(1) DEFAULT 0,
  trending TINYINT(1) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active',
  deleted_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB;

CREATE TABLE product_variants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  sku VARCHAR(100),
  name VARCHAR(120),
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  stock_quantity INT DEFAULT 0,
  metadata JSON,
  deleted_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB;

CREATE TABLE product_tags (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  tag VARCHAR(100) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB;

CREATE TABLE product_attributes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  attribute_name VARCHAR(100) NOT NULL,
  attribute_value VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB;

CREATE TABLE suppliers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150),
  phone VARCHAR(50),
  address TEXT,
  status VARCHAR(50) DEFAULT 'active',
  deleted_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE purchases (
  id INT PRIMARY KEY AUTO_INCREMENT,
  supplier_id INT NOT NULL,
  total_amount DECIMAL(12,2) DEFAULT 0,
  invoice_number VARCHAR(150),
  status VARCHAR(50) DEFAULT 'draft',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
) ENGINE=InnoDB;

CREATE TABLE stock_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  change_type VARCHAR(50) NOT NULL,
  quantity_changed INT NOT NULL,
  note VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB;

CREATE TABLE purchase_orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  supplier_id INT NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  expected_date DATE,
  deleted_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
) ENGINE=InnoDB;

CREATE TABLE purchase_order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  purchase_order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT DEFAULT 0,
  cost DECIMAL(12,2) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB;

CREATE TABLE coupons (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(100) UNIQUE NOT NULL,
  discount_rate DECIMAL(5,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  usage_limit INT DEFAULT 0,
  active TINYINT(1) DEFAULT 1,
  expires_at DATETIME,
  deleted_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE carts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  coupon_id INT,
  status VARCHAR(50) DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (coupon_id) REFERENCES coupons(id)
) ENGINE=InnoDB;

CREATE TABLE cart_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cart_id INT NOT NULL,
  product_id INT NOT NULL,
  variant_id INT,
  quantity INT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cart_id) REFERENCES carts(id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (variant_id) REFERENCES product_variants(id)
) ENGINE=InnoDB;

CREATE TABLE addresses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  label VARCHAR(120),
  street VARCHAR(255),
  city VARCHAR(120),
  state VARCHAR(120),
  postal_code VARCHAR(50),
  country VARCHAR(120),
  is_default TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_number VARCHAR(150) UNIQUE NOT NULL,
  customer_id INT NOT NULL,
  shipping_address_id INT,
  payment_method VARCHAR(100),
  subtotal DECIMAL(12,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  tracking_number VARCHAR(150),
  deleted_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id),
  FOREIGN KEY (shipping_address_id) REFERENCES addresses(id)
) ENGINE=InnoDB;

CREATE TABLE coupon_usage (
  id INT PRIMARY KEY AUTO_INCREMENT,
  coupon_id INT NOT NULL,
  user_id INT,
  order_id INT,
  used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (coupon_id) REFERENCES coupons(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (order_id) REFERENCES orders(id)
) ENGINE=InnoDB;

CREATE TABLE order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  variant_id INT,
  quantity INT DEFAULT 1,
  price DECIMAL(12,2) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (variant_id) REFERENCES product_variants(id)
) ENGINE=InnoDB;

CREATE TABLE order_status_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  status VARCHAR(100) NOT NULL,
  changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  note TEXT,
  FOREIGN KEY (order_id) REFERENCES orders(id)
) ENGINE=InnoDB;

CREATE TABLE refunds (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  amount DECIMAL(12,2) DEFAULT 0,
  reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id)
) ENGINE=InnoDB;

CREATE TABLE payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  method VARCHAR(100),
  amount DECIMAL(12,2) DEFAULT 0,
  status VARCHAR(100) DEFAULT 'pending',
  transaction_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id)
) ENGINE=InnoDB;

CREATE TABLE transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  payment_id INT NOT NULL,
  reference VARCHAR(200),
  amount DECIMAL(12,2) DEFAULT 0,
  status VARCHAR(100),
  gateway VARCHAR(120),
  transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (payment_id) REFERENCES payments(id)
) ENGINE=InnoDB;

CREATE TABLE reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  customer_id INT NOT NULL,
  rating INT NOT NULL,
  title VARCHAR(200),
  comment TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  deleted_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (customer_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE ratings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  customer_id INT NOT NULL,
  rating INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (customer_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT,
  channel VARCHAR(50) DEFAULT 'email',
  priority VARCHAR(50) DEFAULT 'normal',
  status VARCHAR(50) DEFAULT 'pending',
  read_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sender_id INT,
  recipient_id INT,
  subject VARCHAR(200),
  body TEXT,
  read_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (recipient_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE media_files (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  mime_type VARCHAR(100),
  size BIGINT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE posters (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(200),
  subtitle VARCHAR(255),
  background_color VARCHAR(20),
  accent_color VARCHAR(20),
  file_path VARCHAR(500),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  `key` VARCHAR(120) NOT NULL UNIQUE,
  `value` TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE about (
  id INT PRIMARY KEY AUTO_INCREMENT,
  heading VARCHAR(255),
  tagline VARCHAR(255),
  story TEXT,
  commitment TEXT,
  core_values JSON,
  why_choose JSON,
  stats JSON,
  team JSON,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  level VARCHAR(20),
  message TEXT,
  meta JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE activity_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  action VARCHAR(255),
  metadata JSON,
  category VARCHAR(100) DEFAULT 'general',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE audit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  entity VARCHAR(120),
  entity_id INT,
  action VARCHAR(120),
  user_id INT,
  before_data JSON,
  after_data JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE analytics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  key_name VARCHAR(150),
  value JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE reports (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(150),
  type VARCHAR(120),
  payload JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE dashboards (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(150),
  layout JSON,
  settings JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE customers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  loyalty_level VARCHAR(100),
  segment VARCHAR(100),
  preferred_channel VARCHAR(100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE order_notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  notification TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id)
) ENGINE=InnoDB;

CREATE TABLE product_reviews_summary (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  average_rating DECIMAL(4,2),
  review_count INT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB;

CREATE TABLE order_comments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  user_id INT,
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE inventory_audits (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  previous_quantity INT,
  new_quantity INT,
  reason VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB;

CREATE TABLE promotional_modules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(150),
  description TEXT,
  active TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE service_messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200),
  body TEXT,
  type VARCHAR(50),
  active TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE access_tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  provider VARCHAR(100),
  token VARCHAR(500),
  expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE notification_templates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(150),
  subject VARCHAR(255),
  body TEXT,
  channel VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE product_collections (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(150),
  description TEXT,
  is_public TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE collection_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  collection_id INT NOT NULL,
  product_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (collection_id) REFERENCES product_collections(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB;

CREATE TABLE webhooks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(150),
  url VARCHAR(500),
  event VARCHAR(100),
  active TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE webhook_deliveries (
  id INT PRIMARY KEY AUTO_INCREMENT,
  webhook_id INT NOT NULL,
  payload JSON,
  response_code INT,
  status VARCHAR(50),
  delivered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (webhook_id) REFERENCES webhooks(id)
) ENGINE=InnoDB;

CREATE TABLE phone_verifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  code VARCHAR(10),
  expires_at DATETIME,
  used TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE staff_activity_metrics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  staff_id INT NOT NULL,
  activity_type VARCHAR(120),
  details JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (staff_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE product_views (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  user_id INT,
  session_id VARCHAR(255),
  viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE sales_targets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(150),
  target_amount DECIMAL(12,2) DEFAULT 0,
  start_date DATE,
  end_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE kpi_metrics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  metric_name VARCHAR(150),
  metric_value VARCHAR(255),
  refresh_interval VARCHAR(50),
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE storefront_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  theme VARCHAR(120),
  logo_path VARCHAR(500),
  primary_color VARCHAR(50),
  secondary_color VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO roles (name, description) VALUES
('Admin', 'Full system administrator'),
('Staff', 'Operations and store manager'),
('Customer', 'End customer');

INSERT INTO modules (name, description) VALUES
('Auth', 'User and access management'),
('Products', 'Product catalog and inventory'),
('Orders', 'Order processing'),
('CRM', 'Customer management'),
('Analytics', 'Business insights'),
('Notifications', 'Alerts and messages');

INSERT INTO permissions (name, description) VALUES
('view_users', 'View user list'),
('manage_users', 'Create and update users'),
('view_products', 'View products'),
('manage_products', 'Create and update products'),
('view_orders', 'View order list'),
('manage_orders', 'Update orders'),
('view_reports', 'View reports'),
('manage_settings', 'Update application settings');

INSERT INTO products (name, description, price, category_id, sku, stock_quantity, featured, trending, status) VALUES
('Luxury Chocolate Box', 'Decadent handcrafted chocolate collection for celebrations.', 25.00, NULL, 'SS-LUX-CHOC-001', 100, 1, 0, 'active'),
('Signature Candy Mix', 'Colorful candy assortment made for party orders.', 18.00, NULL, 'SS-SIG-CANDY-001', 100, 0, 1, 'active'),
('Seasonal Gift Bundle', 'A festive bundle with seasonal sweets and packaging.', 30.00, NULL, 'SS-SEASON-GIFT-001', 100, 1, 1, 'active'),
('Custom Cake Design', 'Personalized cake design with custom decorations.', 45.00, NULL, 'SS-CUSTOM-CAKE-001', 50, 0, 1, 'active');
