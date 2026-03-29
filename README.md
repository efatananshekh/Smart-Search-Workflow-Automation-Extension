                                                                                
                    CASE SEARCHER EXTENSION - README
                                                                                

                                                                                
PROJECT OVERVIEW
                                                                                

Case Searcher is a Chrome extension that automates the search process within 
case management systems. When viewing a case, the extension extracts either the 
Customer ID or Order Number from the page and automatically performs a search.

This eliminates manual copy-paste operations and reduces repetitive work for 
customer support agents, case managers, and operations teams.

                                                                                
CORE FEATURES
                                                                                

1. Automatic Customer ID Extraction
   - Identifies Customer ID from various page layouts
   - Supports inline labels, table rows, and structured content
   - Falls back to multiple extraction methods

2. Automatic Order Number Extraction
   - Reads Skill Group context to determine extraction method
   - Extracts from Order Number block or Return Info section
   - Handles both manual verification and return cases

3. Dual Search Modes
   - Customer ID mode (default)
   - Order Number mode
   - One-click toggle in popup interface

4. Persistent Preferences
   - Saves selected mode to Chrome storage
   - Survives browser restarts
   - Consistent across tabs

5. SPA Navigation Support
   - Detects single-page application route changes
   - Re-initializes on navigation
   - Handles dynamic content loading

6. Duplicate Prevention
   - Tracks processed identifiers per page
   - Prevents repeated searches on same case
   - Resets on navigation

                                                                                
SYSTEM REQUIREMENTS
                                                                                

Requirement              | Minimum Specification
-------------------------|--------------------------------
Browser                  | Google Chrome 88 or higher
Operating System         | Windows, macOS, Linux
Internet Connection      | Required (to access case system)
Permissions Required     | Storage (for saving preferences)

                                                                                
FILE STRUCTURE
                                                                                

extension-folder/
│
├── LICENSE                 - MIT License file
├── README.txt              - This quick start guide
├── MANUAL.txt              - Complete user manual
├── configure.bat           - Windows configuration script
│
├── manifest.json           - Chrome extension manifest
├── contentScript.js        - Main extraction logic
├── popup.html              - Popup interface HTML
├── popup.css               - Popup interface styling
└── popup.js                - Popup interface logic

                                                                                
QUICK INSTALLATION
                                                                                

STEP 1: Download or clone this repository to a folder on your computer

STEP 2: Run the configuration script
        - Double-click configure.bat
        - Enter your domain (example: cs.yourcompany.com)
        - Enter your case view path (example: inquiry-center/cases/view)
        - Do NOT include https:// or slashes
        - Confirm the settings

STEP 3: Load the extension in Chrome
        - Open Chrome and go to chrome://extensions/
        - Enable "Developer mode" (toggle in top-right corner)
        - Click "Load unpacked"
        - Select the folder containing the extension files

STEP 4: Verify installation
        - Extension icon appears in Chrome toolbar
        - Click icon to see popup interface
        - Navigate to a case view page to test

                                                                                
CONFIGURATION EXAMPLES
                                                                                

EXAMPLE 1: Standard Setup
-------------------------
Domain: cs.yourcompany.com
Path: inquiry-center/cases/view
Full URL: https://cs.yourcompany.com/inquiry-center/cases/view/12345

manifest.json setting:
"matches": ["https://cs.yourcompany.com/inquiry-center/cases/view/*"]

contentScript.js settings:
const BASE_URL   "https://cs.yourcompany.com";
const URL_PATTERN   "/inquiry-center/cases/view/";

EXAMPLE 2: Custom Domain
------------------------
Domain: support.yourcompany.com
Path: tickets/view
Full URL: https://support.yourcompany.com/tickets/view/67890

manifest.json setting:
"matches": ["https://support.yourcompany.com/tickets/view/*"]

contentScript.js settings:
const BASE_URL   "https://support.yourcompany.com";
const URL_PATTERN   "/tickets/view/";

EXAMPLE 3: Different Path Structure
------------------------------------
Domain: app.company.com
Path: cases/customer/view
Full URL: https://app.company.com/cases/customer/view/abc123

manifest.json setting:
"matches": ["https://app.company.com/cases/customer/view/*"]

contentScript.js settings:
const BASE_URL   "https://app.company.com";
const URL_PATTERN   "/cases/customer/view/";

                                                                                
USAGE QUICK REFERENCE
                                                                                

Action                              | How To
------------------------------------|--------------------------------------
Open extension popup                | Click extension icon in toolbar
Switch to Customer ID mode          | Click "Customer" button or toggle left
Switch to Order Number mode         | Click "Order" button or toggle right
See current mode                    | Read text below the buttons
Extension auto-runs on case pages   | No action needed after configuration

                                                                                
TROUBLESHOOTING QUICK REFERENCE
                                                                                

Problem                             | Solution
------------------------------------|--------------------------------------
Extension does nothing              | Verify URL pattern in manifest.json
Search input not filled             | Open F12 console to see logs
Wrong identifier extracted          | Check if correct mode is selected
Extension not loading               | Check manifest.json for valid JSON
configure.bat fails                 | Configure manually (see MANUAL.txt)

                                                                                
For complete documentation, see MANUAL.txt
                                                                                
