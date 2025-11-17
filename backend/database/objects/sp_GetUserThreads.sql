
-- Create stored procedure to get user threads
CREATE OR ALTER PROCEDURE [dbo].[sp_GetUserThreads]
        @UserEmail NVARCHAR(255),
        @Limit INT = 50,
        @Offset INT = 0
    AS
    BEGIN
        SET NOCOUNT ON;
        
        SELECT 
            ThreadID,
            UserEmail,
            ThreadTitle,
            ThreadIcon,
            IsActive,
            TotalMessages,
            TotalTokens,
            LastActivityDate,
            CreatedDate,
            ModifiedDate
        FROM [dbo].[user_threads]
        WHERE [UserEmail] = @UserEmail AND [IsActive] = 1
        ORDER BY [LastActivityDate] DESC, CreatedDate DESC
        OFFSET @Offset ROWS
        FETCH NEXT @Limit ROWS ONLY;
    END