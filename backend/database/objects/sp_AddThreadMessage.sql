
-- Create stored procedure to add a message to a thread
CREATE OR ALTER PROCEDURE [dbo].[sp_AddThreadMessage]
        @ThreadID UNIQUEIDENTIFIER,
        @AgentCode NVARCHAR(50) = NULL,
        @Content NVARCHAR(MAX),
        @InputTokens INT = 0,
        @OutputTokens INT = 0
    AS
    BEGIN
        SET NOCOUNT ON;
        
        DECLARE @AgentName NVARCHAR(100) = NULL;
        DECLARE @MessageOrder INT, @AgentID INT, @ThreadCount INT;
        DECLARE @UserEmail NVARCHAR(255);
        DECLARE @CurrentDate DATETIME2 = GETDATE();
        DECLARE @UsageMonth NVARCHAR(7) = FORMAT(@CurrentDate, 'yyyy-MM');
        DECLARE @UsageDate DATE = CAST(@CurrentDate AS DATE);
        
        -- Get agent details by AgentCode if provided (takes priority over AgentID)
        IF @AgentCode IS NOT NULL
        BEGIN
            SELECT @AgentID = [AgentID], @AgentName = [AgentName] 
            FROM [dbo].[agents] 
            WHERE [AgentCode] = @AgentCode AND [Active] = 1;
            
            IF @AgentID IS NULL
            BEGIN
                RAISERROR('Agent not found or inactive for AgentCode', 16, 1);
                RETURN;
            END
        END
        
        -- Get user email and next message order
        SELECT @UserEmail = [UserEmail] FROM [dbo].[user_threads] WHERE [ThreadID] = @ThreadID;
        SELECT @MessageOrder = ISNULL(MAX([MessageOrder]), 0) + 1 FROM [dbo].[thread_messages] WHERE [ThreadID] = @ThreadID;
        
        IF @UserEmail IS NULL
        BEGIN
            RAISERROR('Thread not found', 16, 1);
            RETURN;
        END
        
        -- Insert message
        INSERT INTO [dbo].[thread_messages] 
        ([ThreadID], [AgentID], [AgentName], [Role], [Content], [InputTokens], [OutputTokens], [MessageOrder])
        VALUES (@ThreadID, @AgentID, @AgentName, IIF(@AgentCode IS NOT NULL, @AgentCode, 'User'), @Content, @InputTokens, @OutputTokens, @MessageOrder);
        
        --
		SELECT @ThreadCount = COUNT(*) FROM (SELECT DISTINCT AgentID FROM [dbo].[thread_messages] WHERE [ThreadID] = @ThreadID) AS A;

        -- Update thread statistics
        UPDATE [dbo].[user_threads]
        SET [TotalMessages] = [TotalMessages] + 1,
            [TotalTokens] = [TotalTokens] + @InputTokens + @OutputTokens,
            [LastActivityDate] = @CurrentDate
        WHERE [ThreadID] = @ThreadID;
        
        -- Update usage statistics only if AgentID is provided
        IF @AgentID IS NOT NULL
        BEGIN
            -- Update daily usage summary
            IF EXISTS (SELECT 1 FROM [dbo].[user_agent_usage_daily] WHERE [UserEmail] = @UserEmail AND [AgentID] = @AgentID AND [UsageDate] = @UsageDate)
            BEGIN

                SELECT @ThreadCount = COUNT(*) FROM (SELECT DISTINCT AgentID FROM [dbo].[thread_messages] WHERE [ThreadID] = @ThreadID) AS A;
                
                UPDATE [dbo].[user_agent_usage_daily]
                SET [TotalTokens] = [TotalTokens] + @InputTokens + @OutputTokens,
                    [InputTokens] = [InputTokens] + @InputTokens,
                    [OutputTokens] = [OutputTokens] + @OutputTokens,
                    [MessageCount] = [MessageCount] + 1,
                    [ModifiedDate] = @CurrentDate,
                    [ThreadCount] = @ThreadCount
                WHERE [UserEmail] = @UserEmail AND [AgentID] = @AgentID AND [UsageDate] = @UsageDate;
            END
            ELSE
            BEGIN
                INSERT INTO [dbo].[user_agent_usage_daily]
                ([UserEmail], [AgentID], [AgentName], [UsageDate], [TotalTokens], [InputTokens], [OutputTokens], [MessageCount], [ThreadCount])
                VALUES (@UserEmail, @AgentID, @AgentName, @UsageDate, @InputTokens + @OutputTokens, @InputTokens, @OutputTokens, 1, 1);
            END
            
            -- Update monthly usage summary
            IF EXISTS (SELECT 1 FROM [dbo].[user_agent_usage_monthly] WHERE [UserEmail] = @UserEmail AND [AgentID] = @AgentID AND [UsageMonth] = @UsageMonth)
            BEGIN
                UPDATE [dbo].[user_agent_usage_monthly]
                SET [TotalTokens] = [TotalTokens] + @InputTokens + @OutputTokens,
                    [InputTokens] = [InputTokens] + @InputTokens,
                    [OutputTokens] = [OutputTokens] + @OutputTokens,
                    [MessageCount] = [MessageCount] + 1,
                    [ModifiedDate] = @CurrentDate
                WHERE [UserEmail] = @UserEmail AND [AgentID] = @AgentID AND [UsageMonth] = @UsageMonth;
            END
            ELSE
            BEGIN
                INSERT INTO [dbo].[user_agent_usage_monthly]
                ([UserEmail], [AgentID], [AgentName], [UsageMonth], [TotalTokens], [InputTokens], [OutputTokens], [MessageCount], [ThreadCount])
                VALUES (@UserEmail, @AgentID, @AgentName, @UsageMonth, @InputTokens + @OutputTokens, @InputTokens, @OutputTokens, 1, 1);
            END
        END
        
        SELECT @@IDENTITY as MessageID;
    END