-- Create stored procedure to increment NumberOfUses
CREATE OR ALTER PROCEDURE [dbo].[sp_IncrementAgentUsage]
        @AgentID INT,
        @IncrementBy INT = 1
    AS
    BEGIN
        SET NOCOUNT ON;
        
        UPDATE [dbo].[agents]
        SET [NumberOfUses] = [NumberOfUses] + @IncrementBy,
            [ModifiedDate] = GETDATE()
        WHERE [AgentID] = @AgentID AND [Active] = 1;
        
        IF @@ROWCOUNT = 0
        BEGIN
            RAISERROR('Agent not found or inactive', 16, 1);
        END
    END