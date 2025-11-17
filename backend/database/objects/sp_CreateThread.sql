
-- Create stored procedure to create a new thread
CREATE OR ALTER PROCEDURE [dbo].[sp_CreateThread]
        @UserEmail NVARCHAR(255),
        @ThreadTitle NVARCHAR(500),
        @ThreadIcon NVARCHAR(10) = NULL,
        @ThreadID UNIQUEIDENTIFIER OUTPUT
    AS
    BEGIN
        SET NOCOUNT ON;
        
        SET @ThreadID = NEWID();
        
        INSERT INTO [dbo].[user_threads] 
        ([ThreadID], [UserEmail], [ThreadTitle], [ThreadIcon])
        VALUES (@ThreadID, @UserEmail, @ThreadTitle, @ThreadIcon);
        
        SELECT @ThreadID as ThreadID;
    END