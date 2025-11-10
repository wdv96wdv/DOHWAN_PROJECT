-- SQL command to add the 'provider' column to the 'users' table
-- Execute this command using a PostgreSQL client (e.g., psql, pgAdmin, DBeaver)
-- If the 'users' table already exists, this command will add the new column.
-- If the 'users' table does NOT exist, you should run the full DDL.sql script instead.

ALTER TABLE users
ADD COLUMN provider VARCHAR(50) DEFAULT 'traditional';

-- After running this, you might want to update existing social login users' 'provider' field
-- For example, if you know which users are Google logins:
-- UPDATE users SET provider = 'google' WHERE email LIKE '%@gmail.com' AND provider = 'traditional';
-- (This is a placeholder example, adjust the WHERE clause based on how you identify social users)
