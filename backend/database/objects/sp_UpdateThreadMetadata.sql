
-- Create stored procedure to update thread title and icon
CREATE OR ALTER PROCEDURE [dbo].[sp_UpdateThreadMetadata]
        @ThreadID UNIQUEIDENTIFIER,
        @UserEmail NVARCHAR(255),
        @ThreadTitle NVARCHAR(500) = NULL,
        @ThreadIcon NVARCHAR(10) = NULL
    AS
    BEGIN
        SET NOCOUNT ON;
        
        -- Verify user owns the thread
        IF NOT EXISTS (SELECT 1 FROM [dbo].[user_threads] WHERE [ThreadID] = @ThreadID AND [UserEmail] = @UserEmail)
        BEGIN
            RAISERROR('Thread not found or access denied', 16, 1);
            RETURN;
        END
        
        UPDATE [dbo].[user_threads]
        SET [ThreadTitle] = COALESCE(@ThreadTitle, [ThreadTitle]),
            [ThreadIcon] = COALESCE(@ThreadIcon, [ThreadIcon])
        WHERE [ThreadID] = @ThreadID AND [UserEmail] = @UserEmail;
        
        SELECT @@ROWCOUNT as RowsUpdated;
    END