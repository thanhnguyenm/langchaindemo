
-- Create stored procedure to switch active agent in session
CREATE OR ALTER PROCEDURE [dbo].[sp_SwitchSessionAgent]
        @SessionID NVARCHAR(100),
        @AgentID INT
    AS
    BEGIN
        SET NOCOUNT ON;
        
        DECLARE @CurrentDate DATETIME2 = GETDATE();
        
        -- Check if agent is registered for this session
        IF NOT EXISTS (SELECT 1 FROM [dbo].[user_session_agents] WHERE [SessionID] = @SessionID AND [AgentID] = @AgentID)
        BEGIN
            -- Register the agent first
            EXEC [dbo].[sp_RegisterSessionAgent] @SessionID = @SessionID, @AgentID = @AgentID, @SetAsActive = 1;
        END
        ELSE
        BEGIN
            -- Deactivate all agents for this session
            UPDATE [dbo].[user_session_agents]
            SET [IsActive] = 0
            WHERE [SessionID] = @SessionID;
            
            -- Activate the selected agent
            UPDATE [dbo].[user_session_agents]
            SET [IsActive] = 1
            WHERE [SessionID] = @SessionID AND [AgentID] = @AgentID;
        END
        
        -- Return current active agent
        SELECT 
            usa.[AgentID],
            usa.[AgentName],
            usa.[AgentIcon],
            a.[Description] as AgentDescription
        FROM [dbo].[user_session_agents] usa
        INNER JOIN [dbo].[agents] a ON usa.[AgentID] = a.[AgentID]
        WHERE usa.[SessionID] = @SessionID AND usa.[IsActive] = 1;
    END