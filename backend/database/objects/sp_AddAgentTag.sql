
-- Create stored procedure to add agent tag
CREATE OR ALTER PROCEDURE [dbo].[sp_AddAgentTag]
        @AgentID INT,
        @TagName NVARCHAR(50),
        @TagValue NVARCHAR(255) = NULL,
        @CreatedBy NVARCHAR(255) = NULL
    AS
    BEGIN
        SET NOCOUNT ON;
        
        -- Check if agent exists and is active
        IF NOT EXISTS (SELECT 1 FROM [dbo].[agents] WHERE [AgentID] = @AgentID AND [Active] = 1)
        BEGIN
            RAISERROR('Agent not found or inactive', 16, 1);
            RETURN;
        END
        
        -- Insert or update tag
        IF EXISTS (SELECT 1 FROM [dbo].[agent_tags] WHERE [AgentID] = @AgentID AND [TagName] = @TagName)
        BEGIN
            UPDATE [dbo].[agent_tags]
            SET [TagValue] = @TagValue,
                [CreatedDate] = GETDATE(),
                [CreatedBy] = @CreatedBy
            WHERE [AgentID] = @AgentID AND [TagName] = @TagName;
        END
        ELSE
        BEGIN
            INSERT INTO [dbo].[agent_tags] ([AgentID], [TagName], [TagValue], [CreatedBy])
            VALUES (@AgentID, @TagName, @TagValue, @CreatedBy);
        END
    END