-- Create trigger for user_session_agents table to automatically update NumberOfUses in agents table
-- This trigger handles both INSERT and DELETE operations

CREATE OR ALTER TRIGGER [dbo].[tr_user_session_agents_usage]
ON [dbo].[user_session_agents]
AFTER INSERT, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Handle INSERT operations (increment usage count)
        IF EXISTS (SELECT 1 FROM inserted) AND NOT EXISTS (SELECT 1 FROM deleted)
        BEGIN
            UPDATE [dbo].[agents] 
            SET 
                [NumberOfUses] = [NumberOfUses] + 1,
                [ModifiedDate] = GETDATE()
            FROM [dbo].[agents] a
            INNER JOIN inserted i ON a.[AgentID] = i.[AgentID];
            
            PRINT 'Agent usage count incremented for INSERT operations.';
        END
        
        -- Handle DELETE operations (decrement usage count, but not below 0)
        IF EXISTS (SELECT 1 FROM deleted) AND NOT EXISTS (SELECT 1 FROM inserted)
        BEGIN
            UPDATE [dbo].[agents] 
            SET 
                [NumberOfUses] = CASE 
                    WHEN [NumberOfUses] > 0 THEN [NumberOfUses] - 1 
                    ELSE 0 
                END,
                [ModifiedDate] = GETDATE()
            FROM [dbo].[agents] a
            INNER JOIN deleted d ON a.[AgentID] = d.[AgentID];
            
            PRINT 'Agent usage count decremented for DELETE operations.';
        END
        
        -- Handle UPDATE operations (if AgentID changes, adjust both old and new agents)
        IF EXISTS (SELECT 1 FROM inserted) AND EXISTS (SELECT 1 FROM deleted)
        BEGIN
            -- Check if AgentID actually changed
            IF EXISTS (SELECT 1 FROM inserted i INNER JOIN deleted d ON i.[SessionAgentID] = d.[SessionAgentID] WHERE i.[AgentID] != d.[AgentID])
            BEGIN
                -- Decrement old agent usage
                UPDATE [dbo].[agents] 
                SET 
                    [NumberOfUses] = CASE 
                        WHEN [NumberOfUses] > 0 THEN [NumberOfUses] - 1 
                        ELSE 0 
                    END,
                    [ModifiedDate] = GETDATE()
                FROM [dbo].[agents] a
                INNER JOIN deleted d ON a.[AgentID] = d.[AgentID]
                INNER JOIN inserted i ON d.[SessionAgentID] = i.[SessionAgentID]
                WHERE i.[AgentID] != d.[AgentID];
                
                -- Increment new agent usage
                UPDATE [dbo].[agents] 
                SET 
                    [NumberOfUses] = [NumberOfUses] + 1,
                    [ModifiedDate] = GETDATE()
                FROM [dbo].[agents] a
                INNER JOIN inserted i ON a.[AgentID] = i.[AgentID]
                INNER JOIN deleted d ON i.[SessionAgentID] = d.[SessionAgentID]
                WHERE i.[AgentID] != d.[AgentID];
                
                PRINT 'Agent usage count adjusted for AgentID UPDATE operations.';
            END
        END
        
    END TRY
    BEGIN CATCH
        -- Log error information
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        PRINT 'Error in tr_user_session_agents_usage trigger: ' + @ErrorMessage;
        
        -- Re-raise the error
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END

GO

PRINT 'Trigger tr_user_session_agents_usage created successfully.';
PRINT 'This trigger will automatically:';
PRINT '  - Increment NumberOfUses when an agent is added to a session (INSERT)';
PRINT '  - Decrement NumberOfUses when an agent is removed from a session (DELETE)';
PRINT '  - Adjust NumberOfUses when an agent is changed in a session (UPDATE)';
PRINT '  - Prevent NumberOfUses from going below 0';
PRINT '  - Update ModifiedDate timestamp on affected agents';