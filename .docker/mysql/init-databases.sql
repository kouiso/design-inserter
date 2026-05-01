CREATE DATABASE IF NOT EXISTS designinserter
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

GRANT ALL PRIVILEGES ON designinserter.* TO 'wordpress'@'%';
FLUSH PRIVILEGES;
