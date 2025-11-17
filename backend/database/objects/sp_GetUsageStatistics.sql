

-- Create stored procedure to get usage statistics
CREATE OR ALTER PROCEDURE [dbo].[sp_GetUsageStatistics]
        @UserEmail NVARCHAR(255),
        @UsageMonth NVARCHAR(7) = NULL
    AS
    BEGIN
        SET NOCOUNT ON;
        
        SET @UsageMonth = COALESCE(@UsageMonth, FORMAT(GETDATE(), 'yyyy-MM'));
        
        -- Monthly usage by agent
        SELECT 
            [AgentName],
            [TotalTokens],
            [InputTokens],
            [OutputTokens],
            [MessageCount],
            [ThreadCount]
        FROM [dbo].[user_agent_usage_monthly]
        WHERE [UserEmail] = @UserEmail AND [UsageMonth] = @UsageMonth
        ORDER BY [TotalTokens] DESC;
    END