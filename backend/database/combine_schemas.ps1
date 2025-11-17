# FreddyAI Schema Migration Combiner
# This script combines SQL files from the schemas folder into a single consolidated SQL script
# Only includes files that haven't been applied according to the history_migrations table

# Load required assemblies for SQL Server connectivity
Add-Type -AssemblyName "System.Data"

param(
    [string]$SchemasFolder,
    [string]$OutputFileName,
    [switch]$IncludeComments,
    [switch]$AddBatchSeparators,
    [string]$FilePattern,
    [string]$ExcludePattern,
    [switch]$ShowDiscoveredFiles,
    [switch]$AddMigrationChecks
)

# Set default values
if (-not $SchemasFolder) { $SchemasFolder = ".\schemas" }
if (-not $OutputFileName) { $OutputFileName = "FreddyAI_Schemas_Migration.sql" }
if (-not $PSBoundParameters.ContainsKey('IncludeComments')) { $IncludeComments = $true }
if (-not $PSBoundParameters.ContainsKey('AddBatchSeparators')) { $AddBatchSeparators = $true }
if (-not $FilePattern) { $FilePattern = "#*.sql" }
if (-not $ExcludePattern) { $ExcludePattern = "" }
if (-not $PSBoundParameters.ContainsKey('ShowDiscoveredFiles')) { $ShowDiscoveredFiles = $true }
if (-not $PSBoundParameters.ContainsKey('AddMigrationChecks')) { $AddMigrationChecks = $true }

# Define colors for output
$InfoColor = "Cyan"
$SuccessColor = "Green"
$WarningColor = "Yellow"
$ErrorColor = "Red"

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

# Function to generate SQL migration checking block
function Get-MigrationCheckSQL {
    param([string]$MigrationFileName)
    
    return @(
        "-- Check if migration '$MigrationFileName' has already been applied",
        "IF NOT EXISTS (SELECT 1 FROM [dbo].[history_migrations] WHERE [migration_name] = '$MigrationFileName')",
        "BEGIN",
        "    PRINT 'Applying schema migration: $MigrationFileName';"
    )
}

# Function to generate SQL migration completion block  
function Get-MigrationCompletionSQL {
    param([string]$MigrationFileName)
    
    return @(
        "",
        "    -- Record this migration as applied",
        "    INSERT INTO [dbo].[history_migrations] ([migration_name]) VALUES ('$MigrationFileName');",
        "    PRINT 'Schema migration $MigrationFileName completed successfully.';",
        "END",
        "ELSE",
        "BEGIN",
        "    PRINT 'Schema migration $MigrationFileName already applied, skipping.';",
        "END"
    )
}

Clear-Host
Write-ColorOutput "========================================" $InfoColor
Write-ColorOutput "FreddyAI Schema Migration Combiner" $InfoColor
Write-ColorOutput "========================================" $InfoColor
Write-Host ""

# Validate schemas folder exists
if (!(Test-Path $SchemasFolder)) {
    Write-ColorOutput "ERROR: Schemas folder '$SchemasFolder' not found!" $ErrorColor
    Write-ColorOutput "Please ensure the schemas folder exists in the current directory." $ErrorColor
    Read-Host "Press Enter to exit"
    exit 1
}

Write-ColorOutput "Configuration:" $InfoColor
Write-ColorOutput "  Schemas Folder: $SchemasFolder" $InfoColor
Write-ColorOutput "  Output File: $OutputFileName" $InfoColor
Write-ColorOutput "  Add Migration Checks: $AddMigrationChecks" $InfoColor
Write-ColorOutput "  Include Comments: $IncludeComments" $InfoColor
Write-ColorOutput "  File Pattern: $FilePattern" $InfoColor
Write-Host ""

# Auto-discover schema files
Write-ColorOutput "Discovering schema files in '$SchemasFolder' folder..." $InfoColor

# Get all SQL files matching the pattern and sort them naturally
$allFiles = Get-ChildItem -Path $SchemasFolder -Filter $FilePattern | 
    Sort-Object { 
        # Extract the number from filename for proper sorting
        if ($_.Name -match "^#(\d+)") { 
            [int]$matches[1] 
        } else { 
            # For files without numbers, sort alphabetically
            $_.Name
        }
    }

# Apply exclusion filter if specified
if ($ExcludePattern -ne "") {
    Write-ColorOutput "Applying exclusion pattern: $ExcludePattern" $InfoColor
    $schemaFiles = $allFiles | Where-Object { $_.Name -notlike $ExcludePattern } | Select-Object -ExpandProperty Name
} else {
    $schemaFiles = $allFiles | Select-Object -ExpandProperty Name
}

if ($schemaFiles.Count -eq 0) {
    Write-ColorOutput "ERROR: No schema files found matching pattern '$FilePattern' in '$SchemasFolder'" $ErrorColor
    Write-ColorOutput "Expected files like: #0_create_db.sql, #1_init_freddyai_db.sql, etc." $ErrorColor
    Read-Host "Press Enter to exit"
    exit 1
}

Write-ColorOutput "Found $($schemaFiles.Count) schema files:" $InfoColor

# All schema files will be included with SQL-based migration checks
Write-ColorOutput "Files to be included in combined script:" $InfoColor
foreach ($file in $schemaFiles) {
    $checkStatus = if ($AddMigrationChecks -and $file -ne "#0_create_db.sql") { " (with migration check)" } else { " (direct execution)" }
    Write-ColorOutput "  ➕ $file$checkStatus" $SuccessColor
}

Write-Host ""
Write-ColorOutput "Summary:" $InfoColor
Write-ColorOutput "  Total schema files: $($schemaFiles.Count)" $SuccessColor
Write-ColorOutput "  Files with SQL checks: $(($schemaFiles | Where-Object { $_ -ne '#0_create_db.sql' }).Count)" $InfoColor
Write-ColorOutput "  Files without checks: $(($schemaFiles | Where-Object { $_ -eq '#0_create_db.sql' }).Count)" $InfoColor

# Check if output file exists and prompt for overwrite
if (Test-Path $OutputFileName) {
    $overwrite = Read-Host "Output file '$OutputFileName' exists. Overwrite? (y/N)"
    if ($overwrite -ne 'y' -and $overwrite -ne 'Y') {
        Write-ColorOutput "Operation cancelled." $WarningColor
        exit 0
    }
}

Write-Host ""
Write-ColorOutput "Generating combined schema migration..." $InfoColor

# Initialize the combined content
$combinedContent = @()

# Add header comment
if ($IncludeComments) {
    $combinedContent += @(
        "-- ========================================",
        "-- FreddyAI Schema Migration Script",
        "-- Generated on: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')",
        "-- Source: $SchemasFolder folder",
        "-- ========================================",
        "-- This script contains all schema migration files with embedded checking:",
        "-- Each migration checks the history_migrations table before execution",
        "-- Already applied migrations will be automatically skipped",
        ""
    )
    
    foreach ($file in $schemaFiles) {
        $status = if ($AddMigrationChecks -and $file -ne "#0_create_db.sql") { " (with SQL migration check)" } else { " (direct execution)" }
        $combinedContent += "-- - $file$status"
    }
    
    $combinedContent += @(
        "",
        "-- ========================================",
        "-- IMPORTANT: Run this script with appropriate database permissions",
        "-- The script includes conditional checks for already applied migrations",
        "-- ========================================",
        ""
    )
}

# Process each schema file
$processedFiles = 0
$skippedFiles = 0

foreach ($schemaFile in $schemaFiles) {
    $filePath = Join-Path $SchemasFolder $schemaFile
    Write-ColorOutput "Processing: $schemaFile" $InfoColor
    
    if (!(Test-Path $filePath)) {
        Write-ColorOutput "  - WARNING: File not found, skipping" $WarningColor
        $skippedFiles++
        continue
    }
    
    try {
        # Read the file content
        $fileContent = Get-Content $filePath -Encoding UTF8
        
        # Add section header comment
        if ($IncludeComments) {
            $migrationStatus = if ($AddMigrationChecks -and $schemaFile -ne "#0_create_db.sql") { " [WITH SQL MIGRATION CHECK]" } else { " [DIRECT EXECUTION]" }
            $combinedContent += @(
                "",
                "-- ========================================",
                "-- Schema File: $schemaFile$migrationStatus",
                "-- Source: $filePath",
                "-- ========================================",
                ""
            )
        }
        
        # Add SQL-based migration check for files other than #0_create_db.sql
        if ($AddMigrationChecks -and $schemaFile -ne "#0_create_db.sql") {
            $combinedContent += Get-MigrationCheckSQL -MigrationFileName $schemaFile
            $combinedContent += ""
        }
        
        # Add the file content (preserve original formatting)
        $combinedContent += $fileContent
        
        # Add migration completion SQL block
        if ($AddMigrationChecks -and $schemaFile -ne "#0_create_db.sql") {
            $combinedContent += Get-MigrationCompletionSQL -MigrationFileName $schemaFile
        }
        
        # Add batch separator if requested
        if ($AddBatchSeparators) {
            # Check if file already ends with GO
            $lastNonEmptyLine = ($fileContent | Where-Object { $_.Trim() -ne "" } | Select-Object -Last 1)
            if ($lastNonEmptyLine -and $lastNonEmptyLine.Trim() -ne "GO") {
                $combinedContent += "GO"
            }
        }
        
        Write-ColorOutput "  - SUCCESS: Added to combined script" $SuccessColor
        $processedFiles++
    }
    catch {
        Write-ColorOutput "  - ERROR: Failed to process file - $($_.Exception.Message)" $ErrorColor
        $skippedFiles++
    }
}

# Add footer comment
if ($IncludeComments) {
    $combinedContent += @(
        "",
        "-- ========================================",
        "-- End of Schema Migration Script",
        "-- Files processed: $processedFiles",
        "-- Files skipped: $skippedFiles",
        "-- Generated on: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')",
        "-- ========================================"
    )
}

# Write the combined content to output file
try {
    $combinedContent | Out-File -FilePath $OutputFileName -Encoding UTF8
    Write-Host ""
    Write-ColorOutput "========================================" $InfoColor
    Write-ColorOutput "Schema Combination Complete!" $SuccessColor
    Write-ColorOutput "========================================" $InfoColor
    Write-Host ""
    Write-ColorOutput "Output file: $OutputFileName" $SuccessColor
    Write-ColorOutput "Schema files processed: $processedFiles" $SuccessColor
    Write-ColorOutput "Files skipped: $skippedFiles" $SuccessColor
    Write-ColorOutput "Total lines: $($combinedContent.Count)" $InfoColor
    
    # Get file size
    $fileSize = (Get-Item $OutputFileName).Length
    $fileSizeKB = [math]::Round($fileSize / 1KB, 2)
    Write-ColorOutput "File size: $fileSizeKB KB" $InfoColor
    
    Write-Host ""
    Write-ColorOutput "Usage Instructions:" $InfoColor
    Write-ColorOutput "1. Connect to your SQL Server instance" $InfoColor
    Write-ColorOutput "2. Ensure you have appropriate database permissions" $InfoColor
    Write-ColorOutput "3. Execute the script against your target database" $InfoColor
    Write-ColorOutput "4. Already applied migrations will be automatically skipped" $InfoColor
    Write-ColorOutput "5. New migrations will be applied and recorded in history_migrations" $InfoColor
}
catch {
    Write-ColorOutput "ERROR: Failed to write output file - $($_.Exception.Message)" $ErrorColor
    exit 1
}

Write-Host ""
Read-Host "Press Enter to exit"