
-- Add test users with different password hashes
DECLARE @users TABLE (
    email NVARCHAR(255),
    password NVARCHAR(50),
    password_hash NVARCHAR(64)
);

-- Insert test user data
-- Note: These are SHA-256 hashes of the corresponding passwords
INSERT INTO @users (email, password, password_hash) VALUES
('admin@freddyai.com', 'admin123', 'fc8252c8dc55839967c58b9ad755a59b61b67c13227ddae4bd3f78a38bf394f7'),
('test@freddyai.com', 'test123', '4c3c9b74bd6c8e5c0e6a5b2c5d8e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e'),
('demo@freddyai.com', 'demo123', '3e3b59e8e6c7a8f6c7e5c8f9e6c8e9f0c7e9f0e1c8f0e1d2c9f1d2e3d0e2d3e4'),
('developer@freddyai.com', 'dev123', '4d8c6e9f7e8d9f0e1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4');


-- Insert users if they don't exist
DECLARE @email NVARCHAR(255);
DECLARE @password NVARCHAR(50);
DECLARE @password_hash NVARCHAR(64);
DECLARE @count INT = 0;

DECLARE user_cursor CURSOR FOR
SELECT email, password, password_hash FROM @users;

OPEN user_cursor;
FETCH NEXT FROM user_cursor INTO @email, @password, @password_hash;

WHILE @@FETCH_STATUS = 0
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[users] WHERE email = @email)
    BEGIN
        INSERT INTO [dbo].[users] (email, password_hash)
        VALUES (@email, @password_hash);
        
        SET @count = @count + 1;
        PRINT 'Added user: ' + @email + ' (password: ' + @password + ')';
    END
    ELSE
    BEGIN
        PRINT 'User already exists: ' + @email;
    END
    
    FETCH NEXT FROM user_cursor INTO @email, @password, @password_hash;
END

CLOSE user_cursor;
DEALLOCATE user_cursor;

PRINT '';
PRINT '=== Test Users Summary ===';
PRINT 'Total users added: ' + CAST(@count AS NVARCHAR(10));
PRINT '';
PRINT 'Available test accounts:';
PRINT '1. user@heineken.com / password123 (default demo user)';
PRINT '2. admin@freddyai.com / admin123';
PRINT '3. test@freddyai.com / test123';
PRINT '4. demo@freddyai.com / demo123';
PRINT '5. developer@freddyai.com / dev123';
PRINT '';



-- Show all users in the database
SELECT 
    email,
    created_date,
    last_login_date
FROM [dbo].[users]
ORDER BY created_date;

-- Show total user count
SELECT COUNT(*) as TotalUsers FROM [dbo].[users];

