

-- Create stored procedure to get user session and session agents
CREATE OR ALTER PROCEDURE [dbo].[sp_GetUserSession]
    @UserEmail NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @CurrentMonth NVARCHAR(7) = FORMAT(GETDATE(), 'yyyy-MM');
    DECLARE @SessionID NVARCHAR(100);
    
    -- Get current session
    SELECT 
        @SessionID = ucs.[SessionID]
    FROM [dbo].[user_current_session] ucs
    WHERE ucs.[UserEmail] = @UserEmail AND ucs.[IsActive] = 1;

    SELECT 
        ucs.[SessionID],
        ucs.[UserEmail],
        ucs.[IsActive],
        ucs.[CreatedDate],
        ucs.[ModifiedDate]
    FROM [dbo].[user_current_session] ucs
    WHERE ucs.[SessionID] = @SessionID
    
    -- Get session agents (all agents registered in this session)
    SELECT 
        usa.[SessionAgentID],
        usa.[SessionID],
        usa.[AgentID],
        usa.[AgentName],
        usa.[AgentIcon],
        usa.[IsActive],
        usa.[LaunchedDate],
        usa.[CreatedDate],
        usa.[ModifiedDate],
        a.[Description] as AgentDescription,
        a.[SystemPrompt] as AgentSystemPrompt
    FROM [dbo].[user_session_agents] usa
    INNER JOIN [dbo].[agents] a ON usa.[AgentID] = a.[AgentID]
    WHERE usa.[SessionID] = @SessionID
    ORDER BY usa.[LaunchedDate] DESC, usa.[AgentName];
    
    -- Get current month token usage (total across all agents)
    SELECT 
        ISNULL(SUM([TotalTokens]), 0) as CurrentMonthTokens,
        ISNULL(SUM([MessageCount]), 0) as CurrentMonthMessages,
        ISNULL(SUM([ThreadCount]), 0) as CurrentMonthThreads
    FROM [dbo].[user_agent_usage_monthly]
    WHERE [UserEmail] = @UserEmail AND [UsageMonth] = @CurrentMonth;
    
END