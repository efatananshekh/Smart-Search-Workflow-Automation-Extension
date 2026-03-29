
                    CASE SEARCHER EXTENSION - USER MANUAL



1. OVERVIEW


This Chrome extension automates the search process within case management 
systems. When viewing a case, the extension extracts either the Customer ID or 
Order Number and automatically performs a search.


2. INSTALLATION


Using the Configuration Script (Recommended):

1. Double-click configure.bat
2. Enter your domain when prompted (example: cs.yourcompany.com)
3. Enter your case view path when prompted (example: inquiry-center/cases/view)
4. Confirm your settings
5. The script automatically configures both files

Manual Configuration:

1. Open manifest.json and replace the URL pattern with your actual URL
2. Open contentScript.js and set BASE_URL and URL_PATTERN variables
3. Save both files

Load in Chrome:

1. Open Chrome and navigate to chrome://extensions/
2. Enable Developer mode
3. Click "Load unpacked"
4. Select the extension folder


3. USAGE


1. Click the extension icon in the Chrome toolbar
2. Select Customer or Order mode
3. Navigate to any case view page
4. Extension automatically extracts and searches


4. TROUBLESHOOTING


Issue: Extension does nothing on case pages
Solution: Verify URL pattern matches your website in manifest.json

Issue: Search input not filled
Solution: Open browser console (F12) to see log messages

Issue: Wrong identifier extracted
Solution: Check mode selection (Customer vs Order)

Issue: Extension not loading
Solution: Verify manifest.json has valid URL pattern


5. TROUBLESHOOTING


For issues or questions:
- Open a GitHub issue
- Contact the author


END OF MANUAL
