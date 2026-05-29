USE shopsweet;

SET FOREIGN_KEY_CHECKS = 0;

SET @drop_sql = NULL;

SELECT GROUP_CONCAT(CONCAT('DROP TABLE IF EXISTS `', table_name, '`') SEPARATOR '; ')
INTO @drop_sql
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND table_name NOT IN (
    'users',
    'roles',
    'permissions',
    'modules',
    'permissions_map',
    'user_roles',
    'role_permissions',
    'sessions',
    'tokens',
    'tokens_blacklist',
    'password_resets',
    'categories',
    'subcategories',
    'products',
    'product_variants',
    'suppliers',
    'purchase_orders',
    'purchase_order_items',
    'coupons',
    'coupon_usage',
    'carts',
    'cart_items',
    'addresses',
    'orders',
    'order_items',
    'order_status_logs',
    'refunds',
    'payments',
    'reviews',
    'ratings',
    'notifications',
    'activity_logs',
    'media_files',
    'posters',
    'settings',
    'stock_logs'
  );

SET @drop_sql = IFNULL(@drop_sql, 'SELECT 1');

PREPARE stmt FROM @drop_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET FOREIGN_KEY_CHECKS = 1;
