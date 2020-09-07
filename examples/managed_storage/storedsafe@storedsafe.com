{
  "name": "storedsafe@storedsafe.com",
  "description": "StoredSafe managed settings",
  "type": "storage",
  "data": {
    "sites": [
      {
        "url": "my-site",
        "apikey": "my-api-key"
      }
    ],
    "settings": {
      "enforced": {
        "maxTokenLife": 8
      },
      "defaults": {
        "autoFill": false,
        "idleMax": 60
      }
    }
  }
}