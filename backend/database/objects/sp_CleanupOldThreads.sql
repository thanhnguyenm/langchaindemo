


-- Create stored procedure to cleanup old threads
CREATE OR ALTER PROCEDURE [dbo].[sp_CleanupOldThreads]
        @InactiveDays INT = 90
    AS
    BEGIN
        SET NOCOUNT ON;
        
        DECLARE @CutoffDate DATETIME2 = DATEADD(DAY, -@InactiveDays, GETDATE());
        
        UPDATE [dbo].[user_threads]
        SET [IsActive] = 0
        WHERE [LastActivityDate] < @CutoffDate AND [IsActive] = 1;
        
        SELECT @@ROWCOUNT as ThreadsDeactivated;
    END