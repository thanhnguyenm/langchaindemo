
-- Drop the existing sp_GetAgentsForUI procedure if it exists

CREATE OR ALTER PROCEDURE [dbo].[sp_GetAgentsForUI]
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        a.[AgentID] as AgentId,
        a.[AgentName],
        a.[AgentCode],
        a.[Description],
        a.[Icon],
        a.[Instruments],
        a.[SystemPrompt],
        a.[Active] as IsActive,
        a.[NumberOfUses],
        a.[CreatedDate],
        a.[CreatedBy],
        a.[ModifiedDate],
        a.[ModifiedBy],
        -- Aggregate tags as a comma-separated string for easy parsing
        STRING_AGG(ISNULL(t.[TagName], ''), ',') as Tags
    FROM [dbo].[agents] a
    LEFT JOIN [dbo].[agent_tags] t ON a.[AgentID] = t.[AgentID]
    WHERE a.[Active] = 1
    GROUP BY 
        a.[AgentID],
        a.[AgentName],
        a.[AgentCode],
        a.[Description],
        a.[Icon],
        a.[Instruments],
        a.[SystemPrompt],
        a.[Active],
        a.[NumberOfUses],
        a.[CreatedDate],
        a.[CreatedBy],
        a.[ModifiedDate],
        a.[ModifiedBy]
    ORDER BY a.[NumberOfUses] DESC, a.[AgentName];
END


PRINT 'sp_GetAgentsForUI procedure updated successfully with agent tags support.';