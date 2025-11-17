# FreddyAI Database Objects Combiner
# This script combines SQL object files (stored procedures, triggers, etc.) from the objects folder
# into a single consolidated SQL script with embedded migration checking

# Load required assemblies for SQL Server connectivity
Add-Type -AssemblyName "System.Data"

param(
    [string]$ObjectsFolder,
    [string]$OutputFileName,
    [switch]$IncludeComments,
    [switch]$AddBatchSeparators,
    [string]$FilePattern,
    [string]$ExcludePattern,
    [switch]$ShowDiscoveredFiles,
    [switch]$AddMigrationChecks,
    [switch]$GroupByType
)

# Set default values
if (-not $ObjectsFolder) { $ObjectsFolder = ".\objects" }
if (-not $OutputFileName) { $OutputFileName = "FreddyAI_Objects_Migration.sql" }
if (-not $PSBoundParameters.ContainsKey('IncludeComments')) { $IncludeComments = $true }
if (-not $PSBoundParameters.ContainsKey('AddBatchSeparators')) { $AddBatchSeparators = $true }
if (-not $FilePattern) { $FilePattern = "*.sql" }
if (-not $ExcludePattern) { $ExcludePattern = "" }
if (-not $PSBoundParameters.ContainsKey('ShowDiscoveredFiles')) { $ShowDiscoveredFiles = $true }
if (-not $PSBoundParameters.ContainsKey('AddMigrationChecks')) { $AddMigrationChecks = $false }
if (-not $PSBoundParameters.ContainsKey('GroupByType')) { $GroupByType = $true }

# Define colors for output
$InfoColor = "Cyan"
$SuccessColor = "Green"
$WarningColor = "Yellow"
$ErrorColor = "Red"

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

# Function to determine object type from filename
function Get-ObjectType {
    param([string]$FileName)
    
    if ($FileName -like "sp_*") { return "StoredProcedures" }
    if ($FileName -like "fn_*") { return "Functions" }
    if ($FileName -like "tr_*") { return "Triggers" }
    if ($FileName -like "vw_*") { return "Views" }
    if ($FileName -like "udf_*") { return "UserDefinedFunctions" }
    if ($FileName -like "idx_*") { return "Indexes" }
    return "Other"
}

# Function to generate SQL migration checking block for objects
function Get-ObjectMigrationCheckSQL {
    param([string]$ObjectFileName)
    
    return @(
        "-- Check if object migration '$ObjectFileName' has already been applied",
        "IF NOT EXISTS (SELECT 1 FROM [dbo].[history_migrations] WHERE [migration_name] = '$ObjectFileName')",
        "BEGIN",
        "    PRINT 'Applying object migration: $ObjectFileName';"
    )
}

# Function to generate SQL migration completion block for objects
function Get-ObjectMigrationCompletionSQL {
    param([string]$ObjectFileName)
    
    return @(
        "",
        "    -- Record this object migration as applied",
        "    INSERT INTO [dbo].[history_migrations] ([migration_name]) VALUES ('$ObjectFileName');",
        "    PRINT 'Object migration $ObjectFileName completed successfully.';",
        "END",
        "ELSE",
        "BEGIN",
        "    PRINT 'Object migration $ObjectFileName already applied, skipping.';",
        "END"
    )
}

Clear-Host
Write-ColorOutput "========================================" $InfoColor
Write-ColorOutput "FreddyAI Database Objects Combiner" $InfoColor
Write-ColorOutput "========================================" $InfoColor
Write-Host ""

# Validate objects folder exists
if (!(Test-Path $ObjectsFolder)) {
    Write-ColorOutput "ERROR: Objects folder '$ObjectsFolder' not found!" $ErrorColor
    Write-ColorOutput "Please ensure the objects folder exists in the current directory." $ErrorColor
    Read-Host "Press Enter to exit"
    exit 1
}

Write-ColorOutput "Configuration:" $InfoColor
Write-ColorOutput "  Objects Folder: $ObjectsFolder" $InfoColor
Write-ColorOutput "  Output File: $OutputFileName" $InfoColor
Write-ColorOutput "  Add Migration Checks: $AddMigrationChecks" $InfoColor
Write-ColorOutput "  Group By Type: $GroupByType" $InfoColor
Write-ColorOutput "  Include Comments: $IncludeComments" $InfoColor
Write-ColorOutput "  File Pattern: $FilePattern" $InfoColor
Write-Host ""

# Auto-discover object files
Write-ColorOutput "Discovering database object files in '$ObjectsFolder' folder..." $InfoColor

# Get all SQL files matching the pattern
$allFiles = Get-ChildItem -Path $ObjectsFolder -Filter $FilePattern

# Apply exclusion filter if specified
if ($ExcludePattern -ne "") {
    Write-ColorOutput "Applying exclusion pattern: $ExcludePattern" $InfoColor
    $objectFiles = $allFiles | Where-Object { $_.Name -notlike $ExcludePattern }
} else {
    $objectFiles = $allFiles
}

if ($objectFiles.Count -eq 0) {
    Write-ColorOutput "ERROR: No object files found matching pattern '$FilePattern' in '$ObjectsFolder'" $ErrorColor
    Write-ColorOutput "Expected files like: sp_*.sql, tr_*.sql, fn_*.sql, etc." $ErrorColor
    Read-Host "Press Enter to exit"
    exit 1
}

# Group files by type if requested
if ($GroupByType) {
    $groupedFiles = $objectFiles | Group-Object { Get-ObjectType $_.Name } | Sort-Object Name
    
    Write-ColorOutput "Found $($objectFiles.Count) object files grouped by type:" $InfoColor
    foreach ($group in $groupedFiles) {
        Write-ColorOutput "  $($group.Name): $($group.Count) files" $SuccessColor
        if ($ShowDiscoveredFiles) {
            foreach ($file in ($group.Group | Sort-Object Name)) {
                $checkStatus = if ($AddMigrationChecks) { " (with migration check)" } else { " (direct deployment)" }
                Write-ColorOutput "    ➕ $($file.Name)$checkStatus" $InfoColor
            }
        }
    }
} else {
    # Sort files alphabetically
    $objectFiles = $objectFiles | Sort-Object Name
    
    Write-ColorOutput "Found $($objectFiles.Count) object files:" $InfoColor
    if ($ShowDiscoveredFiles) {
        foreach ($file in $objectFiles) {
            $checkStatus = if ($AddMigrationChecks) { " (with migration check)" } else { " (direct deployment)" }
            Write-ColorOutput "  ➕ $($file.Name)$checkStatus" $SuccessColor
        }
    }
}

Write-Host ""
Write-ColorOutput "Summary:" $InfoColor
Write-ColorOutput "  Total object files: $($objectFiles.Count)" $SuccessColor
Write-ColorOutput "  Files with migration checks: $(if ($AddMigrationChecks) { $objectFiles.Count } else { 0 })" $InfoColor
Write-ColorOutput "  Files for direct deployment: $(if ($AddMigrationChecks) { 0 } else { $objectFiles.Count })" $InfoColor

# Check if output file exists and prompt for overwrite
if (Test-Path $OutputFileName) {
    $overwrite = Read-Host "Output file '$OutputFileName' exists. Overwrite? (y/N)"
    if ($overwrite -ne 'y' -and $overwrite -ne 'Y') {
        Write-ColorOutput "Operation cancelled." $WarningColor
        exit 0
    }
}

Write-Host ""
Write-ColorOutput "Generating combined database objects migration..." $InfoColor

# Initialize the combined content
$combinedContent = @()

# Add header comment
if ($IncludeComments) {
    $combinedContent += @(
        "-- ========================================",
        "-- FreddyAI Database Objects Migration Script",
        "-- Generated on: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')",
        "-- Source: $ObjectsFolder folder",
        "-- ========================================",
        "-- This script contains database objects with embedded checking:",
        "-- Each object checks the history_migrations table before deployment",
        "-- Already applied objects will be automatically skipped",
        "",
        "-- Object Types Included:"
    )
    
    if ($GroupByType) {
        foreach ($group in $groupedFiles) {
            $combinedContent += "-- - $($group.Name): $($group.Count) files"
        }
    } else {
        $combinedContent += "-- - All object files: $($objectFiles.Count) files"
    }
    
    $combinedContent += @(
        "",
        "-- ========================================",
        "-- IMPORTANT: Run this script with appropriate database permissions",
        "-- The script includes conditional checks for already applied objects",
        "-- ========================================",
        ""
    )
}

# Process files by type if grouping is enabled
$processedFiles = 0
$skippedFiles = 0

if ($GroupByType) {
    foreach ($group in $groupedFiles) {
        # Add type header
        if ($IncludeComments) {
            $combinedContent += @(
                "",
                "-- ========================================",
                "-- $($group.Name.ToUpper()) ($($group.Count) objects)",
                "-- ========================================",
                ""
            )
        }
        
        # Process files in this group - using inline processing since we have duplicate code below
        # This section is handled by the re-processing section below
    }
} else {
    # Process all files in alphabetical order - using inline processing since we have duplicate code below
    # This section is handled by the re-processing section below
}

# Process all files using the inline logic below
$combinedContent = @()
$processedFiles = 0
$skippedFiles = 0

# Add header comment again
if ($IncludeComments) {
    $combinedContent += @(
        "-- ========================================",
        "-- FreddyAI Database Objects Migration Script", 
        "-- Generated on: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')",
        "-- Source: $ObjectsFolder folder",
        "-- ========================================",
        "-- This script contains database objects for direct deployment:",
        "-- Objects will be created/altered directly without migration checking",
        "-- Use CREATE OR ALTER statements for safe redeployment",
        "",
        "-- Object Types Included:"
    )
    
    if ($GroupByType) {
        foreach ($group in $groupedFiles) {
            $combinedContent += "-- - $($group.Name): $($group.Count) files"
        }
    } else {
        $combinedContent += "-- - All object files: $($objectFiles.Count) files"
    }
    
    $combinedContent += @(
        "",
        "-- ========================================", 
        "-- IMPORTANT: Run this script with appropriate database permissions",
        "-- Objects will be deployed directly without existence checking",
        "-- ========================================",
        ""
    )
}

# Process files by type if grouping is enabled
if ($GroupByType) {
    foreach ($group in $groupedFiles) {
        # Add type header
        if ($IncludeComments) {
            $combinedContent += @(
                "",
                "-- ========================================",
                "-- $($group.Name.ToUpper()) ($($group.Count) objects)",
                "-- ========================================",
                ""
            )
        }
        
        # Process files in this group
        foreach ($file in ($group.Group | Sort-Object Name)) {
            $filePath = $file.FullName
            $fileName = $file.Name
            
            Write-ColorOutput "Processing: $fileName" $InfoColor
            
            try {
                # Read the file content
                $fileContent = Get-Content $filePath -Encoding UTF8
                
                # Add section header comment
                if ($IncludeComments) {
                    $objectType = Get-ObjectType $fileName
                    $migrationStatus = if ($AddMigrationChecks) { " [WITH MIGRATION CHECK]" } else { " [DIRECT DEPLOYMENT]" }
                    $combinedContent += @(
                        "",
                        "-- ========================================",
                        "-- Object File: $fileName ($objectType)$migrationStatus",
                        "-- Source: $filePath",
                        "-- ========================================",
                        ""
                    )
                }
                
                # Add SQL-based migration check
                if ($AddMigrationChecks) {
                    $combinedContent += Get-ObjectMigrationCheckSQL -ObjectFileName $fileName
                    $combinedContent += ""
                }
                
                # Add the file content (preserve original formatting)
                $combinedContent += $fileContent
                
                # Add migration completion SQL block
                if ($AddMigrationChecks) {
                    $combinedContent += Get-ObjectMigrationCompletionSQL -ObjectFileName $fileName
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
    }
} else {
    # Process all files in alphabetical order
    foreach ($file in $objectFiles) {
        $filePath = $file.FullName
        $fileName = $file.Name
        
        Write-ColorOutput "Processing: $fileName" $InfoColor
        
        try {
            # Read the file content
            $fileContent = Get-Content $filePath -Encoding UTF8
            
            # Add section header comment
            if ($IncludeComments) {
                $objectType = Get-ObjectType $fileName
                $migrationStatus = if ($AddMigrationChecks) { " [WITH MIGRATION CHECK]" } else { " [DIRECT DEPLOYMENT]" }
                $combinedContent += @(
                    "",
                    "-- ========================================",
                    "-- Object File: $fileName ($objectType)$migrationStatus", 
                    "-- Source: $filePath",
                    "-- ========================================",
                    ""
                )
            }
            
            # Add SQL-based migration check
            if ($AddMigrationChecks) {
                $combinedContent += Get-ObjectMigrationCheckSQL -ObjectFileName $fileName
                $combinedContent += ""
            }
            
            # Add the file content (preserve original formatting)
            $combinedContent += $fileContent
            
            # Add migration completion SQL block
            if ($AddMigrationChecks) {
                $combinedContent += Get-ObjectMigrationCompletionSQL -ObjectFileName $fileName
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
}

# Add footer comment
if ($IncludeComments) {
    $combinedContent += @(
        "",
        "-- ========================================",
        "-- End of Database Objects Migration Script",
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
    Write-ColorOutput "Objects Combination Complete!" $SuccessColor
    Write-ColorOutput "========================================" $InfoColor
    Write-Host ""
    Write-ColorOutput "Output file: $OutputFileName" $SuccessColor
    Write-ColorOutput "Object files processed: $processedFiles" $SuccessColor
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
    Write-ColorOutput "3. Execute the script against your FreddyAI database" $InfoColor
    Write-ColorOutput "4. Objects will be created/altered directly" $InfoColor
    Write-ColorOutput "5. Use CREATE OR ALTER statements for safe redeployment" $InfoColor
}
catch {
    Write-ColorOutput "ERROR: Failed to write output file - $($_.Exception.Message)" $ErrorColor
    exit 1
}

Write-Host ""
Read-Host "Press Enter to exit"