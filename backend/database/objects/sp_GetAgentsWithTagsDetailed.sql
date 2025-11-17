

-- Create an alternative procedure that returns tags as separate rows
-- This can be useful if you need more detailed tag information

CREATE OR ALTER PROCEDURE [dbo].[sp_GetAgentsWithTagsDetailed]
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Return agents information
    SELECT 
        a.[AgentID] as AgentId,
        a.[AgentCode],
        a.[AgentName],
        a.[Description],
        a.[Icon],
        a.[Instruments],
        a.[SystemPrompt],
        a.[Active] as IsActive,
        a.[NumberOfUses],
        a.[CreatedDate],
        a.[CreatedBy],
        a.[ModifiedDate],
        a.[ModifiedBy]
    FROM [dbo].[agents] a
    WHERE a.[Active] = 1
    ORDER BY a.[NumberOfUses] DESC, a.[AgentName];
    
    -- Return tags separately
    SELECT 
        t.[AgentID] as AgentId,
        t.[TagName],
        t.[TagValue]
    FROM [dbo].[agent_tags] t
    INNER JOIN [dbo].[agents] a ON t.[AgentID] = a.[AgentID]
    WHERE a.[Active] = 1
    ORDER BY t.[AgentID], t.[TagName];
END


PRINT 'sp_GetAgentsWithTagsDetailed procedure created successfully.';