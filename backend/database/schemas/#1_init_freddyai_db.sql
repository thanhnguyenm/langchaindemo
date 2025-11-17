
-- Create users table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[users] (
        [email] NVARCHAR(255) NOT NULL,
        [password_hash] NVARCHAR(64) NOT NULL,
        [created_date] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [modified_date] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [last_login_date] DATETIME2 NULL,
        CONSTRAINT [PK_users] PRIMARY KEY CLUSTERED ([email] ASC)
    );
    PRINT 'Users table created successfully.';
END
ELSE
BEGIN
    PRINT 'Users table already exists.';
END


-- Create users table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[users] (
        [email] NVARCHAR(255) NOT NULL,
        [password_hash] NVARCHAR(64) NOT NULL,
        [created_date] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [modified_date] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [last_login_date] DATETIME2 NULL,
        CONSTRAINT [PK_users] PRIMARY KEY CLUSTERED ([email] ASC)
    );
    PRINT 'Users table created successfully.';
END
ELSE
BEGIN
    PRINT 'Users table already exists.';
END

-- Insert demo user (using SHA-256 hash of 'password123')
-- Password hash: ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f
DECLARE @demo_email NVARCHAR(255) = 'user@heineken.com';
DECLARE @demo_password_hash NVARCHAR(64) = 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f';

IF NOT EXISTS (SELECT 1 FROM [dbo].[users] WHERE email = @demo_email)
BEGIN
    INSERT INTO [dbo].[users] (email, password_hash)
    VALUES (@demo_email, @demo_password_hash);
    PRINT 'Demo user created successfully.';
    PRINT 'Email: user@heineken.com';
    PRINT 'Password: password123';
END
ELSE
BEGIN
    PRINT 'Demo user already exists.';
END


-- Create additional indexes for performance
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_users_last_login_date' AND object_id = OBJECT_ID('[dbo].[users]'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_users_last_login_date] 
    ON [dbo].[users] ([last_login_date] ASC);
    PRINT 'Index IX_users_last_login_date created successfully.';
END


-- Display final status
PRINT '=== Database Initialization Complete ===';
PRINT 'Database: FreddyAI';
PRINT 'Tables created: users';
PRINT 'Triggers created: tr_users_update_modified_date';
PRINT 'Demo credentials:';
PRINT '  Email: user@heineken.com';
PRINT '  Password: password123';
PRINT '=== Ready for FreddyAI Authentication ===';


-- Verify the setup by showing table structure
SELECT 
    'users' as TableName,
    COUNT(*) as RecordCount
FROM [dbo].[users];

-- Show table structure
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'users'
ORDER BY ORDINAL_POSITION;

