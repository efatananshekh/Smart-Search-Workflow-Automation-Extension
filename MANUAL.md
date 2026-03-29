================================================================================
                    CASE SEARCHER EXTENSION - USER MANUAL
================================================================================

================================================================================
TABLE OF CONTENTS
================================================================================

1. OVERVIEW ................................................. Section 1
2. SYSTEM REQUIREMENTS ..................................... Section 2
3. INSTALLATION GUIDE ...................................... Section 3
   3.1 Automatic Configuration (Windows)
   3.2 Manual Configuration
   3.3 Loading the Extension in Chrome
4. CONFIGURATION REFERENCE ................................. Section 4
5. DAILY USAGE ............................................. Section 5
   5.1 Selecting Search Mode
   5.2 Automatic Search Process
   5.3 Supported Identifiers
6. EXTRACTION LOGIC DETAILS ................................ Section 6
   6.1 Customer ID Extraction
   6.2 Order Number Extraction
   6.3 Skill Group Context
7. TROUBLESHOOTING ......................................... Section 7
8. FREQUENTLY ASKED QUESTIONS .............................. Section 8
9. CUSTOMIZATION GUIDE ..................................... Section 9
   9.1 Changing Label Patterns
   9.2 Modifying Search Input Selectors
   9.3 Adjusting Search Button Detection
10. SUPPORT ................................................ Section 10
11. VERSION HISTORY ........................................ Section 11

================================================================================
SECTION 1: OVERVIEW
================================================================================

Case Searcher is a Chrome extension that automates the search process within 
case management systems. When viewing a case page, the extension automatically:

1. Detects the page URL matches your configured pattern
2. Reads the current search mode (Customer ID or Order Number)
3. Extracts the relevant identifier from the page content
4. Pastes the identifier into the search input field
5. Clicks the search button or submits the form

This automation eliminates manual copy-paste operations, reduces errors, and 
speeds up case resolution workflows.

================================================================================
SECTION 2: SYSTEM REQUIREMENTS
================================================================================

Component               | Requirement
------------------------|----------------------------------------------
Browser                 | Google Chrome version 88 or higher
OS Support              | Windows 10/11, macOS 10.14+, Linux
Internet                | Required (access to your case management system)
Permissions             | "storage" - only for saving your mode preference
Disk Space              | Approximately 50 KB
Dependencies            | None (standalone extension)

================================================================================
SECTION 3: INSTALLATION GUIDE
================================================================================

3.1 Automatic Configuration (Windows Only)

The configure.bat script automates the configuration process:

1. Double-click configure.bat to run the script
2. Enter your domain when prompted
   - Example: cs.yourcompany.com
   - Do NOT include https://
   - Do NOT include trailing slash
3. Enter your case view path when prompted
   - Example: inquiry-center/cases/view
   - Do NOT include leading or trailing slashes
4. Review the confirmation screen
5. Type Y and press Enter to apply configuration
6. The script will automatically update manifest.json and contentScript.js

3.2 Manual Configuration (All Operating Systems)

If the batch script does not work or you are on Mac/Linux:

Step A: Configure manifest.json
--------------------------------
Open manifest.json in any text editor.

Find this line:
"matches": ["https://YOUR_DOMAIN_HERE/YOUR_PATH_HERE/*"]

Replace YOUR_DOMAIN_HERE with your domain
Replace YOUR_PATH_HERE with your case view path

Example result:
"matches": ["https://cs.yourcompany.com/inquiry-center/cases/view/*"]

Step B: Configure contentScript.js
-----------------------------------
Open contentScript.js in any text editor.

Find these lines:
const BASE_URL = "YOUR_DOMAIN_HERE";
const URL_PATTERN = "YOUR_PATH_HERE";

Replace YOUR_DOMAIN_HERE with https:// plus your domain
Replace YOUR_PATH_HERE with / plus your path plus /

Example result:
const BASE_URL = "https://cs.yourcompany.com";
const URL_PATTERN = "/inquiry-center/cases/view/";

Step C: Save both files

3.3 Loading the Extension in Chrome

1. Open Google Chrome browser
2. In the address bar, type: chrome://extensions/
3. Press Enter
4. In the top-right corner, toggle ON "Developer mode"
5. Click the "Load unpacked" button
6. Navigate to the folder containing the extension files
7. Click "Select Folder" (or "Open" on some systems)
8. The extension "Case Searcher" should appear in your extensions list
9. The extension icon will appear in the Chrome toolbar

================================================================================
SECTION 4: CONFIGURATION REFERENCE
================================================================================

manifest.json Settings:

| Setting     | Description                           | Example Value                                    |
|-------------|---------------------------------------|--------------------------------------------------|
| matches     | URL pattern where extension runs      | "https://cs.company.com/cases/view/*"           |
| name        | Extension display name                | "Case Searcher"                                  |
| version     | Extension version                     | "1.5"                                            |
| permissions  | Chrome permissions required           | ["storage"]                                      |

contentScript.js Settings:

| Variable        | Description                           | Example Value                                    |
|-----------------|---------------------------------------|--------------------------------------------------|
| BASE_URL        | Your system's base URL with https://  | "https://cs.yourcompany.com"                    |
| URL_PATTERN     | Path that identifies case pages       | "/inquiry-center/cases/view/"                   |

Valid URL Pattern Examples:

| System URL                                      | URL_PATTERN Value                    |
|-------------------------------------------------|--------------------------------------|
| https://cs.company.com/cases/view/123          | "/cases/view/"                       |
| https://app.company.com/support/tickets/456    | "/support/tickets/"                  |
| https://internal.company.com/inquiry/789       | "/inquiry/"                          |

================================================================================
SECTION 5: DAILY USAGE
================================================================================

5.1 Selecting Search Mode

1. Click the extension icon in the Chrome toolbar
2. A popup window appears with two buttons and a toggle
3. To search by Customer ID:
   - Click the "Customer" button (left side)
   - OR move the toggle to the left position
4. To search by Order Number:
   - Click the "Order" button (right side)
   - OR move the toggle to the right position
5. The selected mode is highlighted with a blue border
6. The text below the buttons shows "Currently: Customer ID" or "Currently: Order Number"
7. A "Saved" confirmation appears briefly
8. Your selection is automatically saved and persists across browser sessions

5.2 Automatic Search Process

When you navigate to a case view page:

1. The extension checks if the current URL matches URL_PATTERN
2. It reads the saved search mode from Chrome storage
3. It scans the page HTML for the relevant identifier
4. Once found, it locates the search input field
5. It pastes the identifier into the input field
6. It finds the search button and clicks it (or submits the form)
7. The search results load automatically

The entire process takes 1-2 seconds after page load.

5.3 Supported Identifiers

Customer ID Extraction - Looks for:
------------------------------------
- Text labels containing "Customer ID" followed by a number
- Table rows where first cell contains "Customer" or "Customer Name"
- Patterns like "Customer Name | 123456"
- Inline text matching "Customer ID : 123456"
- Any 3+ digit number near a Customer label

Order Number Extraction - Looks for:
-------------------------------------
- Text labels containing "Order Number" followed by the order ID
- Skill Group field to determine extraction method
- If Skill Group contains "manual ov": extracts from Order Number block
- If Skill Group is other value: extracts Order Id from Return Info section
- Numeric sequences with 6 or more digits near Order labels

================================================================================
SECTION 6: EXTRACTION LOGIC DETAILS
================================================================================

6.1 Customer ID Extraction

The extension uses a multi-stage approach to find Customer IDs:

Stage 1 - Inline Pattern:
   Searches for patterns like "Customer ID : 868543" anywhere in text

Stage 2 - Label Lookup:
   Finds elements containing exactly "Customer ID" text
   Looks at sibling elements, parent children, and adjacent elements for values

Stage 3 - Table Row Analysis:
   Iterates through all HTML tables
   Checks if first cell contains "Customer" related text
   Extracts digits from remaining cells

Stage 4 - Pattern Matching:
   Looks for "Customer Name | 868543" patterns
   Extracts the numeric portion

Stage 5 - Fallback:
   Performs a regex search on the entire page body
   Returns first 3+ digit sequence found

6.2 Order Number Extraction

The extension first reads the Skill Group field:

If Skill Group contains "manual ov" (case insensitive):
   - Extracts from Order Number block using label lookup
   - Returns the first 6+ digit sequence found

If Skill Group is any other value:
   - First attempts to extract Order Id from Return Info section
   - Falls back to Order Number block extraction
   - Returns the first valid identifier

If Skill Group is not found:
   - Attempts Order Number extraction first
   - Falls back to Return Info Order Id extraction

6.3 Skill Group Context

The Skill Group field is used to determine the correct extraction method because:
- Manual OV cases have Order Numbers in a standard block
- Return cases have Order Ids in a Return Info section
- Using the wrong extraction method would return incorrect values

================================================================================
SECTION 7: TROUBLESHOOTING
================================================================================

7.1 Extension Does Not Activate on Case Pages

Symptom: Nothing happens when you navigate to a case view page

Possible Causes:
- URL pattern does not match your actual URL
- Extension not properly loaded
- Content script not injected

Solutions:
1. Verify the URL in your browser matches the pattern in manifest.json
2. Go to chrome://extensions/ and click the refresh icon on the extension card
3. Refresh the case page
4. Open Developer Tools (F12) and check for "Case Searcher" log messages

7.2 Search Input Field Not Populated

Symptom: Extension runs but search box remains empty

Possible Causes:
- Customer ID or Order Number not found on page
- Search input selector does not match your system
- Page structure is different than expected

Solutions:
1. Open Developer Tools (F12) and look for console logs
2. Check if you see "Customer ID not found" or "Order not found" messages
3. Verify the identifier actually exists on the page
4. Check if the search input has a different name or class
5. Update the findSearchInput() selectors in contentScript.js

7.3 Wrong Identifier Extracted

Symptom: Extension pastes incorrect Customer ID or Order Number

Possible Causes:
- Wrong search mode selected
- Page contains multiple numeric identifiers
- Label text differs from expected patterns

Solutions:
1. Click the extension icon and verify the correct mode is selected
2. Check if the page uses non-standard labeling (e.g., "Client ID" instead of "Customer ID")
3. Update the label patterns in contentScript.js:
   - /Customer\s*ID\b/i for Customer ID
   - /\bOrder\s*Number\b/i for Order Number

7.4 Order Number Not Found

Symptom: Order search returns nothing or wrong value

Possible Causes:
- Skill Group label not present or differently worded
- Return Info section missing Order Id
- Page structure differs from expected

Solutions:
1. Check if "Skill Group" label exists on the page
2. Verify the exact text of the Skill Group value
3. Check if "Return Info" section contains "Order Id"
4. Update the skill group patterns in contentScript.js if needed

7.5 Search Button Not Clicked Automatically

Symptom: Value is pasted but search does not execute

Possible Causes:
- Search button selector does not match your system
- Button has different structure than expected

Solutions:
1. The extension will still paste the value - you can click search manually
2. Update the findSearchButtonNear() function in contentScript.js
3. Add your button's selector to the function

7.6 Extension Not Loading After Chrome Update

Symptom: Extension disappeared from toolbar after Chrome updated

Solutions:
1. Go to chrome://extensions/
2. Disable then re-enable Developer mode
3. Click "Load unpacked" and reselect the extension folder
4. The extension will reload with all previous settings intact

7.7 configure.bat Fails to Run

Symptom: Batch script shows errors or does nothing

Possible Causes:
- PowerShell is disabled on your system
- File paths contain spaces
- Insufficient permissions

Solutions:
1. Right-click configure.bat and select "Run as Administrator"
2. Or configure manually using the instructions in Section 3.2
3. Move the extension folder to a path without spaces (e.g., C:\extensions\)

================================================================================
SECTION 8: FREQUENTLY ASKED QUESTIONS
================================================================================

Q1: Does the extension store any personal data?
A1: No. Only the selected search mode (Customer or Order) is stored locally using
    Chrome's storage API. No page data, identifiers, or browsing history is saved.

Q2: Will the extension work on multiple tabs simultaneously?
A2: Yes. Each tab operates independently. The extension runs separately on each tab.

Q3: Can I use the extension on different domains?
A3: The extension is configured for a single domain pattern. To use on multiple 
    domains, you would need to create separate configurations or modify the 
    matches pattern in manifest.json to be less specific.

Q4: Does the extension work offline?
A4: No. The extension requires access to your case management system to extract 
    identifiers and perform searches.

Q5: How do I reset to default settings?
A5: Delete the extension from chrome://extensions/ and reload it from the original 
    files. Your configured URL pattern will be lost and need to be re-entered.

Q6: What happens when Chrome updates?
A6: Chrome updates typically preserve installed extensions. In rare cases, Chrome 
    may disable Developer mode extensions. Simply re-enable Developer mode and 
    reload the extension.

Q7: Can I share this extension with my team?
A7: Yes. The extension is open source under the MIT license. Your team members 
    will need to configure it with your company's domain.

Q8: Does the extension work on Firefox or Edge?
A8: This extension is built specifically for Chrome. It uses Chrome-specific APIs 
    and will not work on other browsers without modification.

Q9: How often does the extension run?
A9: The extension runs once when a case page loads. It does not run continuously 
    or in the background.

Q10: Can I disable the automatic search and only use the paste feature?
A10: Currently, the extension automatically triggers search. To change this 
     behavior, you would need to modify the attemptPasteAndSearch() function in 
     contentScript.js.

================================================================================
SECTION 9: CUSTOMIZATION GUIDE
================================================================================

9.1 Changing Label Patterns

If your system uses different labels, edit contentScript.js:

Original Pattern               | Replace With
-------------------------------|---------------------------------------------
/Customer\s*ID\b/i             | /Client\s*ID\b/i or /Account\s*Number\b/i
/\bOrder\s*Number\b/i          | /\bOrder\s*ID\b/i or /\bPurchase\s*ID\b/i
/\bSkill\s*Group\b/i           | /\bCase\s*Type\b/i or /\bWorkflow\b/i
/Return\s*Info/i               | /\bRefund\s*Details\b/i or /\bExchange\b/i

Example modification for "Client ID" instead of "Customer ID":
Find: /Customer\s*ID\b/i
Replace with: /Client\s*ID\b/i

9.2 Modifying Search Input Selectors

Update the findSearchInput() function in contentScript.js:

Default selectors:
const selectors = [
  'input[name="SearchTerm"]',
  'input[placeholder*="Search"]',
  'input[placeholder*="search"]',
  'input[aria-label*="Search"]',
  'input[type="search"]'
];

Add your own selector:
const selectors = [
  'input[name="YourFieldName"]',
  '#your-input-id',
  '.your-input-class',
  'input[placeholder*="YourText"]'
];

9.3 Adjusting Search Button Detection

Update the findSearchButtonNear() function. Add your button selector early in 
the function:

Example addition:
const btn = document.querySelector('#your-search-button');
if (btn && btn.offsetParent !== null) return btn;

================================================================================
SECTION 10: SUPPORT
================================================================================

Reporting Issues:

When reporting issues, please include:
- Chrome version (chrome://version/)
- Extension version (see manifest.json)
- Your operating system
- The exact URL pattern you configured
- Console logs (F12 -> Console tab)
- Steps to reproduce the issue

Contact Information:

GitHub Repository: https://github.com/efatananshekh/Smart-Search-Workflow-Automation-Extension
Open an Issue: https://github.com/efatananshekh/Smart-Search-Workflow-Automation-Extension/issues

================================================================================
SECTION 11: VERSION HISTORY
================================================================================

Version 1.5 (Current Release)
------------------------------
- Added search mode toggle (Customer ID / Order Number)
- Added Skill Group context logic for Order extraction
- Added configure.bat for automatic configuration
- Added comprehensive documentation
- Added duplicate search prevention
- Added SPA navigation support

Version 1.0 (Initial Release)
------------------------------
- Basic Customer ID extraction and search
- Manual configuration only
- Basic popup interface

================================================================================
END OF MANUAL
================================================================================
