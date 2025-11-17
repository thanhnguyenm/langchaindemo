

-- Create stored procedure to get all agents registered to a session
CREATE OR ALTER PROCEDURE [dbo].[sp_GetSessionAgents]
        @SessionID NVARCHAR(100)
    AS
    BEGIN
        SET NOCOUNT ON;
        
        SELECT 
            usa.[SessionAgentID],
            usa.[AgentID],
            usa.[AgentName],
            usa.[AgentIcon],
            usa.[IsActive],
            usa.[LaunchedDate],
            a.[Description] as AgentDescription,
            a.[SystemPrompt] as AgentSystemPrompt
        FROM [dbo].[user_session_agents] usa
        INNER JOIN [dbo].[agents] a ON usa.[AgentID] = a.[AgentID]
        WHERE usa.[SessionID] = @SessionID 
            AND a.[Active] = 1
        ORDER BY usa.[IsActive] DESC, usa.[LaunchedDate] DESC;
    END