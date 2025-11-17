-- Create history_migrations table to track applied migrations
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[history_migrations]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[history_migrations] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [migration_name] NVARCHAR(255) NOT NULL UNIQUE,
        [applied_on] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [applied_by] NVARCHAR(128) NOT NULL DEFAULT SYSTEM_USER
    );
    
    PRINT 'History migrations table created successfully.';
END
ELSE
BEGIN
    PRINT 'History migrations table already exists.';
END