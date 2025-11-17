
-- Create stored procedure to register an agent to a session
CREATE OR ALTER PROCEDURE [dbo].[sp_RegisterSessionAgent]
        @SessionID NVARCHAR(100),
        @AgentID INT,
        @SetAsActive BIT = 1
    AS
    BEGIN
        SET NOCOUNT ON;
        
        DECLARE @AgentName NVARCHAR(100);
        DECLARE @AgentIcon NVARCHAR(100);
        DECLARE @CurrentDate DATETIME2 = GETDATE();
        
        -- Get agent details
        SELECT @AgentName = [AgentName], @AgentIcon = [Icon] 
        FROM [dbo].[agents] 
        WHERE [AgentID] = @AgentID AND [Active] = 1;
        
        IF @AgentName IS NULL
        BEGIN
            RAISERROR('Agent not found or inactive', 16, 1);
            RETURN;
        END
        
        -- Check if session exists
        IF NOT EXISTS (SELECT 1 FROM [dbo].[user_current_session] WHERE [SessionID] = @SessionID AND [IsActive] = 1)
        BEGIN
            RAISERROR('Session not found or inactive', 16, 1);
            RETURN;
        END
        
        -- If setting as active, deactivate all other agents for this session
        IF @SetAsActive = 1
        BEGIN
            UPDATE [dbo].[user_session_agents]
            SET [IsActive] = 0
            WHERE [SessionID] = @SessionID;
        END
        
        -- Check if agent is already registered for this session
        IF EXISTS (SELECT 1 FROM [dbo].[user_session_agents] WHERE [SessionID] = @SessionID AND [AgentID] = @AgentID)
        BEGIN
            -- Update existing record
            UPDATE [dbo].[user_session_agents]
            SET [IsActive] = @SetAsActive
            WHERE [SessionID] = @SessionID AND [AgentID] = @AgentID;
        END
        ELSE
        BEGIN
            -- Insert new session agent record
            INSERT INTO [dbo].[user_session_agents]
            ([SessionID], [AgentID], [AgentName], [AgentIcon], [IsActive], [LaunchedDate])
            VALUES (@SessionID, @AgentID, @AgentName, @AgentIcon, @SetAsActive, @CurrentDate);
        END
        
        SELECT 
            [SessionAgentID],
            [AgentID],
            [AgentName],
            [AgentIcon],
            [IsActive],
            [LaunchedDate]
        FROM [dbo].[user_session_agents]
        WHERE [SessionID] = @SessionID AND [AgentID] = @AgentID;
    END