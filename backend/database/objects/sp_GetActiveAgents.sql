
-- Update stored procedures to include Icon in results
CREATE OR ALTER PROCEDURE [dbo].[sp_GetActiveAgents]
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        [AgentID],
        [AgentName],
        [AgentCode],
        [Description],
        [Icon],
        [Instruments],
        [SystemPrompt],
        [NumberOfUses],
        [CreatedDate],
        [ModifiedDate]
    FROM [dbo].[agents]
    WHERE [Active] = 1
    ORDER BY [AgentName];
END


PRINT 'sp_GetActiveAgents procedure updated with Icon column.';