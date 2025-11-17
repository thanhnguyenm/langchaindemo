
-- Create stored procedure to get thread messages
CREATE OR ALTER PROCEDURE [dbo].[sp_GetThreadMessages]
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
        
        SELECT 
            [MessageID],
            [ThreadID],
            [AgentID],
            [AgentName],
            [Role],
            [Content],
            [InputTokens],
            [OutputTokens],
            [TotalTokens],
            [MessageOrder],
            [IsEdited],
            [EditedDate],
            [CreatedDate],
            [ModifiedDate]
        FROM [dbo].[thread_messages]
        WHERE [ThreadID] = @ThreadID
        ORDER BY [MessageOrder] ASC, CreatedDate ASC;
    END