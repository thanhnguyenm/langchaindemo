-- Create trigger for user_session_agents table to automatically update NumberOfUses in agents table
-- This trigger handles both INSERT and DELETE operations

CREATE OR ALTER TRIGGER [dbo].[tr_user_thread_totalmessages]
ON [dbo].[thread_messages]
AFTER INSERT, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Handle INSERT operations (increment usage count)
        IF EXISTS (SELECT 1 FROM inserted) AND NOT EXISTS (SELECT 1 FROM deleted)
        BEGIN
            UPDATE [dbo].[user_threads]
            SET TotalMessages = TotalMessages + 1,
                LastActivityDate = GETDATE(),
                ModifiedDate = GETDATE()
            FROM [dbo].[user_threads] a
            INNER JOIN inserted i ON a.[ThreadID] = i.[ThreadID];
        END
        
        -- Handle DELETE operations (decrement usage count, but not below 0)
        IF EXISTS (SELECT 1 FROM deleted) AND NOT EXISTS (SELECT 1 FROM inserted)
        BEGIN
            UPDATE [dbo].[user_threads] 
            SET 
                [TotalMessages] = CASE 
                    WHEN [TotalMessages] > 0 THEN [TotalMessages] - 1 
                    ELSE 0 
                END,
                [ModifiedDate] = GETDATE(),
                [LastActivityDate] = GETDATE()
            FROM [dbo].[user_threads] a
            INNER JOIN deleted d ON a.[ThreadID] = d.[ThreadID];
            
        END
    END TRY
    BEGIN CATCH
        -- Log error information

        PRINT 'Error in tr_user_session_agents_usage trigger: ' + ERROR_MESSAGE();
       -- Optionally log the error to a table
    END CATCH
END

GO