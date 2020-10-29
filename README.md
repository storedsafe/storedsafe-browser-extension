# StoredSafe Browser Extension

## Features

### Popup

#### Sessions
  - [x] Welcome page when no StoredSafe hosts have been added
  - [x] Login/logout to one or more StoredSafe hosts
  - [x] See warnings/violations for active sessions
  - [x] See how long session has been active

#### Search
  - [x] Able to perform search on all active StoredSafe hosts
  - [x] Able to edit StoredSafe object
  - [x] Able to delete StoredSafe object (with prompt)
  - [x] Able to decrypt StoredSafe objects
  - [x] Able to show/hide encrypted data
  - [x] Able to toggle large password view
  - [x] Able to open URLs in objects
    - [ ] Able to fill fields on page after URL is opened
  - [x] Able to view results related to active tab when popup is opened (or search field is empty)

#### Add / Generate Password
  - [x] Able to add objects to StoredSafe
  - [x] Able to generate passwords in add/edit fields
  - [x] Able to generate password with full options in password generator tab
  - [x] Able to verify password against vault password policy

#### Settings
  - **General Settings**
    - [x] Able to toggle auto fill on/off
    - [x] Able to set the amount minutes of idle state required for automatic logout
    - [x] Able to set the max amount of hours a session is allowed to be active
    - [x] Able to enforce/override default settings from external configuration
    - [x] Able to view managed settings
  - **Sites**
    - [x] Able to add/remove StoredSafe hosts
    - [x] Able to add StoredSafe hosts from external configuration
    - [x] Able to view managed StoredSafe hosts
  - **Ignore List**
    - [x] Able to remove URLs from ignore list
  - **Clear Data**
    - [x] Able to clear all extension data in browser storage created by the user
      - [ ] TODO: Translations
      - [x] Able to clear sessions
      - [x] Able to clear user settings
      - [x] Able to clear user sites
      - [x] Able to clear all preferences (saved user interaction patterns)
        - [x] Able to clear only login preferences
        - [x] Able to clear only fill preferences
        - [ ] Able to clear only add object preferences
      - [x] Able to clear ignore list

### Background Tasks
  - [x] Keep sessions alive in favor of browser idle / hard timeout for automatic logout
  - [x] Logout automatically after idle timer is triggered (based on value in settings)
    - Keep your StoredSafe vaults secure if you step away from your computer, for example when going to lunch.
  - [x] Logout automatically after max session life is reached (based on value in settings)
    - Helps you remember your master password
  - [x] Enable keyboard shortcut (default ctrl+shift+f) for automatically filling forms on active tab.
  - [x] Automatically fill forms on active tab when opened (based on value in settings)
  - [x] Automatically search for results related to the active tab
    - [x] Only perform search if the URL starts with http (avoids for example chrome://settings etc.)
    - [x] Filter out irrelevant search results
      - [x] Remove results with a different subdomain (keep results with no subdomain)
      - [x] Remove results where the URL is part of an e-mail address

### On Tab
  - [x] Offer to save on login if no matching url+username combo exists
  - [ ] Offer to choose fill