-- Recreate sp_GetAgentByName with Icon column
CREATE OR ALTER PROCEDURE [dbo].[sp_GetAgentByName]
    @AgentName NVARCHAR(100)
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
        [Active],
        [NumberOfUses],
        [CreatedDate],
        [ModifiedDate]
    FROM [dbo].[agents]
    WHERE [AgentName] = @AgentName;
END


PRINT 'sp_GetAgentByName procedure updated with Icon column.';

