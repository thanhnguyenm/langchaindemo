-- Update sp_GetAgentsByTag to include Icon

CREATE OR ALTER PROCEDURE [dbo].[sp_GetAgentsByTag]
    @TagName NVARCHAR(50),
    @TagValue NVARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT DISTINCT
        a.[AgentID],
        a.[AgentName],
        a.[Description],
        a.[Icon],
        a.[Instruments],
        a.[SystemPrompt],
        a.[Active],
        a.[NumberOfUses],
        a.[CreatedDate],
        a.[ModifiedDate]
    FROM [dbo].[agents] a
    INNER JOIN [dbo].[agent_tags] t ON a.[AgentID] = t.[AgentID]
    WHERE t.[TagName] = @TagName
    AND (@TagValue IS NULL OR t.[TagValue] = @TagValue)
    AND a.[Active] = 1
    ORDER BY a.[AgentName];
END


PRINT 'sp_GetAgentsByTag procedure updated with Icon column.';