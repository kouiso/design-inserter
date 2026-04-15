-- Docker初回起動時にJP/EN両方のデータベースを作成
-- MYSQL_DATABASE(=musashi_jp)は公式イメージが自動作成するが、冪等性のためIF NOT EXISTSで両方記述
CREATE DATABASE IF NOT EXISTS musashi_jp
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS musashi_en
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

GRANT ALL PRIVILEGES ON musashi_jp.* TO 'wordpress'@'%';
GRANT ALL PRIVILEGES ON musashi_en.* TO 'wordpress'@'%';
FLUSH PRIVILEGES;
