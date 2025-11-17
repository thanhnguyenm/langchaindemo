

-- Fix emoji encoding by using Unicode literals (N'emoji')
PRINT 'Updating icons with proper Unicode encoding...';

UPDATE agents SET Icon = N'📊' WHERE AgentName = 'Reality Agent';
UPDATE agents SET Icon = N'📈' WHERE AgentName = 'Performance Agent';
UPDATE agents SET Icon = N'🔭' WHERE AgentName = 'Telescope Agent';
UPDATE agents SET Icon = N'⭐' WHERE AgentName = 'Trends Agent';
UPDATE agents SET Icon = N'🍽️' WHERE AgentName = 'Taste Landscape Agent';
UPDATE agents SET Icon = N'🎯' WHERE AgentName = 'BWCS Agent';
UPDATE agents SET Icon = N'🤖' WHERE AgentName = 'FreddyAI Assistant';


-- Verify the fix
PRINT 'Updated icon state:';
SELECT AgentName, Icon, LEN(Icon) as IconLength FROM agents ORDER BY AgentName;


PRINT 'Icons updated successfully!';

