
-- Create stored procedure to get agent tags
CREATE OR ALTER PROCEDURE [dbo].[sp_GetAgentTags]
        @AgentID INT
    AS
    BEGIN
        SET NOCOUNT ON;
        
        SELECT 
            [TagID],
            [TagName],
            [TagValue],
            [CreatedDate],
            [CreatedBy]
        FROM [dbo].[agent_tags]
        WHERE [AgentID] = @AgentID
        ORDER BY [TagName];
    END