-- Migration: Add AgentCode column to agents table
-- Date: 2025-10-28

-- Check if AgentCode column already exists
-- Check if AgentCode column already exists
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_NAME = 'agents' 
               AND COLUMN_NAME = 'AgentCode' 
               AND TABLE_SCHEMA = 'dbo')
BEGIN
    -- Add AgentCode column
    ALTER TABLE [dbo].[agents]
    ADD [AgentCode] NVARCHAR(100) NULL;
    
    PRINT 'AgentCode column added to agents table.';
    
END

IF EXISTS (
	SELECT 1 FROM sys.indexes i
	JOIN sys.objects o ON i.object_id = o.object_id
	JOIN sys.schemas s ON o.schema_id = s.schema_id
	WHERE o.name = 'agents' AND s.name = 'dbo' AND i.name = 'IX_agents_AgentCode'
)
BEGIN
	DROP INDEX [IX_agents_AgentCode]  ON [dbo].[agents];
END;

-- Create unique index on AgentCode (allowing NULL values)
CREATE UNIQUE NONCLUSTERED INDEX [IX_agents_AgentCode] 
ON [dbo].[agents] ([AgentCode])
WHERE [AgentCode] IS NOT NULL;
    
PRINT 'Unique index created on AgentCode column.';

-- Update existing records with AgentCode based on AgentName
-- This maps existing agents to their enum codes
UPDATE [dbo].[agents] 
SET [AgentCode] = CASE 
    WHEN [AgentName] = 'FreddyAI Assistant' THEN 'FreddyAI_Assistant'
    WHEN [AgentName] = 'Reality Agent' THEN 'Reality_Agent'
    WHEN [AgentName] = 'Performance Agent' THEN 'Performance_Agent'
    WHEN [AgentName] = 'Trends Agent' THEN 'Trends_Agent'
    WHEN [AgentName] = 'Taste Landscape Agent' THEN 'Taste_Landscape_Agent'
    WHEN [AgentName] = 'BWCS Agent' THEN 'BWCS_Agent'
    WHEN [AgentName] = 'Telescope Agent' THEN 'Telescope_Agent'
    ELSE NULL
END
WHERE [AgentCode] IS NULL;

PRINT 'Updated existing agents with AgentCode values.';
