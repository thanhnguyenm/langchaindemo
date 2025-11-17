-- Create new stored procedure to get agent by AgentCode
CREATE OR ALTER PROCEDURE [dbo].[sp_GetAgentByCode]
    @AgentCode NVARCHAR(50)
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
    WHERE [AgentCode] = @AgentCode;
END
GO

PRINT 'sp_GetAgentByCode created successfully.'