# FreddyAI Database Objects Combiner - Usage Examples

The `combine_objects.ps1` script is designed to combine database object files (stored procedures, triggers, functions, etc.) from the `objects` folder into a single consolidated SQL script with embedded migration checking.

## Key Features

- **Auto-discovery**: Automatically finds all `*.sql` files in the objects folder
- **Type grouping**: Groups objects by type (StoredProcedures, Triggers, Functions, etc.)
- **Embedded SQL checks**: Generates SQL script with built-in migration checking logic
- **No database connection required**: All checking logic is embedded in the output SQL
- **Smart categorization**: Automatically detects object types based on filename prefixes
- **Migration tracking**: Each object deployment is recorded in history_migrations table

## Object Type Detection

The script automatically categorizes objects based on filename prefixes:

| Prefix | Object Type | Examples |
|--------|-------------|----------|
| `sp_*` | StoredProcedures | `sp_CreateThread.sql`, `sp_GetUserSession.sql` |
| `fn_*` | Functions | `fn_CalculateTokens.sql`, `fn_ValidateUser.sql` |
| `tr_*` | Triggers | `tr_agents_UpdateModifiedDate.sql` |
| `vw_*` | Views | `vw_ActiveSessions.sql`, `vw_UserStatistics.sql` |
| `udf_*` | UserDefinedFunctions | `udf_ParseJson.sql` |
| `idx_*` | Indexes | `idx_threads_user_email.sql` |
| Others | Other | Any files not matching above patterns |

## Basic Usage Examples

### 1. Default Behavior (Recommended)
```powershell
.\combine_objects.ps1
```
- Processes all `*.sql` files in `.\objects` folder
- Groups objects by type for better organization
- Includes embedded migration checks
- Creates `FreddyAI_Objects_Migration.sql`

### 2. Without Type Grouping
```powershell
.\combine_objects.ps1 -GroupByType:$false
```
- Processes all objects in alphabetical order
- No type-based organization
- Still includes migration checks

### 3. Custom Output File
```powershell
.\combine_objects.ps1 -OutputFileName "Production_Objects_Update.sql"
```
- Uses custom output filename
- Maintains all other default behaviors

### 4. Different Objects Folder
```powershell
.\combine_objects.ps1 -ObjectsFolder ".\database_objects" -OutputFileName "Custom_Objects.sql"
```
- Uses a different source folder
- Custom output filename

### 5. Without Migration Checks
```powershell
.\combine_objects.ps1 -AddMigrationChecks:$false
```
- Combines all objects without conditional checks
- Use with caution - may cause errors if objects already exist

## Advanced Examples

### 6. Stored Procedures Only
```powershell
.\combine_objects.ps1 -FilePattern "sp_*.sql" -OutputFileName "StoredProcedures_Only.sql"
```
- Only includes stored procedure files
- Filters by filename pattern

### 7. Exclude Certain Files
```powershell
.\combine_objects.ps1 -ExcludePattern "*_temp*" -OutputFileName "Production_Ready_Objects.sql"
```
- Excludes files with "_temp" in the name
- Useful for excluding development/test objects

### 8. Production Deployment Script
```powershell
.\combine_objects.ps1 `
    -ObjectsFolder ".\objects" `
    -OutputFileName "FreddyAI_Objects_Production_$(Get-Date -Format 'yyyyMMdd_HHmm').sql" `
    -GroupByType `
    -AddMigrationChecks `
    -ShowDiscoveredFiles
```
- Timestamped output file for production tracking
- Shows all discovered files for verification
- Groups by type for organized deployment

### 9. Development Environment (All Objects)
```powershell
.\combine_objects.ps1 `
    -GroupByType:$false `
    -AddMigrationChecks `
    -IncludeComments `
    -ShowDiscoveredFiles
```
- Alphabetical order without grouping
- Detailed comments and file listing
- Safe migration checks included

## Parameter Reference

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `ObjectsFolder` | String | `.\objects` | Folder containing database object SQL files |
| `OutputFileName` | String | `FreddyAI_Objects_Migration.sql` | Output combined SQL file |
| `AddMigrationChecks` | Switch | `$true` | Add SQL-based migration checking logic |
| `GroupByType` | Switch | `$true` | Group objects by type (SP, triggers, etc.) |
| `IncludeComments` | Switch | `$true` | Add descriptive comments |
| `AddBatchSeparators` | Switch | `$true` | Add GO statements between objects |
| `FilePattern` | String | `*.sql` | Pattern to match object files |
| `ExcludePattern` | String | `` | Pattern to exclude files |
| `ShowDiscoveredFiles` | Switch | `$true` | Display discovered files list |

## Output Structure

### With GroupByType = $true (Default)
Objects are organized by type in this order:
1. **STOREDPROCEDURES** - All `sp_*.sql` files
2. **TRIGGERS** - All `tr_*.sql` files  
3. **FUNCTIONS** - All `fn_*.sql` files
4. **VIEWS** - All `vw_*.sql` files
5. **USERDEFINEDNFUNCTIONS** - All `udf_*.sql` files
6. **INDEXES** - All `idx_*.sql` files
7. **OTHER** - All other files

### With GroupByType = $false
All objects are processed in alphabetical order regardless of type.

## Example Output Structure

```sql
-- ========================================
-- FreddyAI Database Objects Migration Script
-- Generated on: 2024-10-26 15:30:00
-- Source: .\objects folder
-- ========================================

-- ========================================
-- STOREDPROCEDURES (15 objects)
-- ========================================

-- Check if object migration 'sp_CreateThread.sql' has already been applied
IF NOT EXISTS (SELECT 1 FROM [dbo].[history_migrations] WHERE [migration_name] = 'sp_CreateThread.sql')
BEGIN
    PRINT 'Applying object migration: sp_CreateThread.sql';
    
    -- [Original stored procedure content here]
    
    -- Record this object migration as applied
    INSERT INTO [dbo].[history_migrations] ([migration_name]) VALUES ('sp_CreateThread.sql');
    PRINT 'Object migration sp_CreateThread.sql completed successfully.';
END
ELSE
BEGIN
    PRINT 'Object migration sp_CreateThread.sql already applied, skipping.';
END
GO

-- ========================================
-- TRIGGERS (2 objects)
-- ========================================

-- [Similar structure for triggers...]
```

## Best Practices

1. **Always test first**: Run generated script on test database before production
2. **Review object dependencies**: Ensure objects are deployed in correct order
3. **Backup before deployment**: Always backup target database
4. **Use type grouping**: Helps organize deployment and troubleshooting
5. **Monitor execution**: Watch for error messages during script execution
6. **Version control**: Keep track of which objects have been deployed

## Error Handling

- **Objects folder missing**: Script exits with error message
- **No matching files**: Script exits with informative message
- **File read errors**: Individual files are skipped, others continue processing
- **Object creation errors**: Each object is wrapped individually, so one failure won't stop others

## Integration with Migration System

This script works seamlessly with the existing migration infrastructure:
- Uses the same `history_migrations` table as schema migrations
- Compatible with manual migration tracking
- Works alongside other migration tools
- Follows the same tracking patterns

## Deployment Workflow

1. **Generate objects script**: `.\combine_objects.ps1`
2. **Review generated SQL**: Check the output file before deployment
3. **Test on development**: Run on test database first
4. **Deploy to production**: Execute the generated script
5. **Verify deployment**: Check that objects were created and recorded in history_migrations

This ensures a safe, trackable deployment process for all database objects.