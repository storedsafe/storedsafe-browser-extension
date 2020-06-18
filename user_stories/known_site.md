# User Story - Save chili credentials
User scenario where the user logs in to a site that isn't found in StoredSafe.

## Requirements
- Browser extension is installed.
- Managed storage manifest is present with a single site listed.
- StoredSafe site must not have any credentials matching chili server.
- Auto fill is turned off.

## Instructions

### Login
1. Login to StoredSafe in the extension popup using TOTP.
2. Go to chili website.
3. Login to chili website manually.
4. Choose to save credentials after login.
5. Logout from chili website.

### Fill
1. Go to chili website.
2. Fill login form through the extension.
3. Logout from chili website.

### Auto Fill
1. Open extension options.
2. Enable auto fill.
3. Go to chili website.
