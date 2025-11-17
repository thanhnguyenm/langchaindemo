
-- Create stored procedure to get thread messages
CREATE OR ALTER PROCEDURE [dbo].[sp_GetThreadById]
        @ThreadID UNIQUEIDENTIFIER,
        @UserEmail NVARCHAR(255)
    AS
    BEGIN
        SET NOCOUNT ON;
        
        -- Verify user owns the thread
        IF NOT EXISTS (SELECT 1 FROM [dbo].[user_threads] WHERE [ThreadID] = @ThreadID AND [UserEmail] = @UserEmail)
        BEGIN
            RAISERROR('Thread not found or access denied', 16, 1);
            RETURN;
        END
        
        SELECT ThreadID FROM [dbo].[user_threads]
        WHERE ThreadID = @ThreadID AND UserEmail = @UserEmail AND IsActive = 1

    END