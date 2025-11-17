

-- Create stored procedure to create or get user session
CREATE OR ALTER PROCEDURE [dbo].[sp_CreateOrGetUserSession]
        @UserEmail NVARCHAR(255)
    AS
    BEGIN
        SET NOCOUNT ON;
        DECLARE @DefaultAgentID INT = 1;
        DECLARE @SessionID NVARCHAR(100);
        DECLARE @CurrentDate DATETIME2 = GETDATE();
        DECLARE @CurrentMonth NVARCHAR(7) = FORMAT(GETDATE(), 'yyyy-MM');

        IF NOT EXISTS (SELECT 1 FROM [dbo].[agents] WHERE [AgentID] = @DefaultAgentID AND [Active] = 1)
        BEGIN
            -- Fall back to first active agent
            SELECT TOP 1 @DefaultAgentID = [AgentID] FROM [dbo].[agents] WHERE [Active] = 1 ORDER BY [AgentID];
        END
        
        -- Check if user already has an active session
        SELECT @SessionID = [SessionID] FROM [dbo].[user_current_session] WHERE [UserEmail] = @UserEmail AND [IsActive] = 1;
        
        IF @SessionID IS NULL
        BEGIN
            -- Create new session
            SET @SessionID = CAST(NEWID() AS NVARCHAR(100));
            
            INSERT INTO [dbo].[user_current_session] ([SessionID], [UserEmail], [IsActive])
            VALUES (@SessionID, @UserEmail, 1);
            
            -- Register default agent to the session
            IF @DefaultAgentID IS NOT NULL
            BEGIN
                EXEC [dbo].[sp_RegisterSessionAgent] @SessionID = @SessionID, @AgentID = @DefaultAgentID, @SetAsActive = 1;
            END
        END
        
        -- Return session info with current active agent
        SELECT 
            ucs.[SessionID],
            ucs.[UserEmail],
            ucs.[CreatedDate] as SessionCreatedDate,
            ucs.[ModifiedDate] as SessionModifiedDate
        FROM [dbo].[user_current_session] ucs
        WHERE ucs.[SessionID] = @SessionID;

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
            a.[SystemPrompt] as AgentSystemPrompt,
            a.[AgentCode] as AgentCode
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