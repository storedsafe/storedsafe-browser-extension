import { StoredSafeResponse } from 'storedsafe';

const ssVault: StoredSafeResponse = {
  "VAULT": [
    {
      "id": "139",
      "groupname": "Docgen",
      "policy": "16",
      "description": "Information",
      "status": "4",
      "statustext": "Admin"
    }
  ],
  "OBJECTS": [
    {
      "id": "1275",
      "parentid": "0",
      "templateid": "2",
      "groupid": "139",
      "status": "128",
      "objectname": "Folder",
      "filename": "",
      "children": "1",
      "notes": false,
      "tags": "",
      "alarmed": false,
      "public": {
        "name": "Folder",
        "info": "Description"
      }
    },
    {
      "id": "1277",
      "parentid": "0",
      "templateid": "0",
      "groupid": "139",
      "status": "128",
      "objectname": "Personnummer",
      "filename": "",
      "children": "0",
      "notes": false,
      "tags": "",
      "alarmed": false,
      "public": {
        "pnr": "Personnummer",
        "namn": "Namn",
        "adress": "Adress"
      }
    },
    {
      "id": "1278",
      "parentid": "0",
      "templateid": "4",
      "groupid": "139",
      "status": "128",
      "objectname": "Host",
      "filename": "",
      "children": "0",
      "notes": false,
      "tags": "",
      "alarmed": false,
      "public": {
        "host": "Host",
        "username": "Username"
      }
    },
    {
      "id": "1279",
      "parentid": "0",
      "templateid": "10",
      "groupid": "139",
      "status": "128",
      "objectname": "Username",
      "filename": "",
      "children": "0",
      "notes": false,
      "tags": "",
      "alarmed": false,
      "public": {
        "username": "Username"
      }
    },
    {
      "id": "1280",
      "parentid": "0",
      "templateid": "1",
      "groupid": "139",
      "status": "128",
      "objectname": "Host",
      "filename": "",
      "children": "0",
      "notes": false,
      "tags": "",
      "alarmed": false,
      "public": {
        "host": "Host",
        "username": "Username",
        "info": "Information"
      }
    },
    {
      "fileinfo": {
        "objectid": "1373",
        "name": "wall.awk",
        "size": "53",
        "type": "text/plain",
        "filepath": "/opt/storedsafe/upload/200527100933_1373.enc",
        "created": "2020-05-27 10:09:33",
        "ext": "awk",
        "iconpath": "/img/ico/mime/unknown.png"
      },
      "id": "1373",
      "parentid": "0",
      "templateid": "3",
      "groupid": "139",
      "status": "128",
      "objectname": "",
      "filename": "wall.awk",
      "children": "0",
      "notes": false,
      "tags": "",
      "alarmed": false,
      "public": {
        "file1": "",
        "description": "Count duplicates in first column"
      }
    },
    {
      "id": "1281",
      "parentid": "0",
      "templateid": "5",
      "groupid": "139",
      "status": "128",
      "objectname": "Name",
      "filename": "",
      "children": "0",
      "notes": false,
      "tags": "",
      "alarmed": false,
      "public": {
        "name": "Name",
        "progress": "50"
      }
    },
    {
      "id": "1282",
      "parentid": "0",
      "templateid": "8",
      "groupid": "139",
      "status": "128",
      "objectname": "Name",
      "filename": "",
      "children": "0",
      "notes": false,
      "tags": "",
      "alarmed": false,
      "public": {
        "name": "Name"
      }
    },
    {
      "id": "1283",
      "parentid": "0",
      "templateid": "9",
      "groupid": "139",
      "status": "128",
      "objectname": "Name",
      "filename": "",
      "children": "0",
      "notes": false,
      "tags": "",
      "alarmed": false,
      "public": {
        "name": "Name",
        "info": "Information"
      }
    },
    {
      "id": "1284",
      "parentid": "0",
      "templateid": "11",
      "groupid": "139",
      "status": "128",
      "objectname": "Bank",
      "filename": "",
      "children": "0",
      "notes": false,
      "tags": "",
      "alarmed": false,
      "public": {
        "service": "Bank",
        "owner": "Cardholder",
        "note2": "Public"
      }
    },
    {
      "id": "1285",
      "parentid": "0",
      "templateid": "12",
      "groupid": "139",
      "status": "128",
      "objectname": "Name",
      "filename": "",
      "children": "0",
      "notes": false,
      "tags": "",
      "alarmed": false,
      "public": {
        "name": "Name",
        "keylen": "2048",
        "algorithm": "SHA-256",
        "commonname": "Common",
        "countrycode": "SE",
        "state": "State",
        "city": "City",
        "org": "Organization",
        "orgunit": "Unit",
        "altnames": "SAN"
      }
    },
    {
      "id": "1286",
      "parentid": "0",
      "templateid": "1001",
      "groupid": "139",
      "status": "128",
      "objectname": "Host",
      "filename": "",
      "children": "0",
      "notes": false,
      "tags": "",
      "alarmed": false,
      "public": {
        "host": "Host",
        "ip": "IP",
        "username": "Username",
        "info": "Information"
      }
    }
  ],
  "TEMPLATES": [
    {
      "id": "2",
      "info": {
        "id": "2",
        "name": "Folder",
        "ico": "ico_folder",
        "active": true,
        "wb": true
      },
      "structure": [
        {
          "translation": "Folder name",
          "type": "text",
          "encrypted": false,
          "show": true,
          "policy": false,
          "alarm": false,
          "opt": false,
          "cc": false,
          "nc": false,
          "fieldname": "name"
        },
        {
          "translation": "Description",
          "type": "textarea",
          "encrypted": false,
          "show": true,
          "policy": false,
          "alarm": false,
          "opt": true,
          "cc": false,
          "nc": false,
          "fieldname": "info"
        }
      ]
    },
    {
      "id": "0",
      "info": {
        "id": "0",
        "name": "Person",
        "ico": "ico_person",
        "active": true,
        "wb": true
      },
      "structure": [
        {
          "translation": "Personnummer",
          "type": "text",
          "encrypted": false,
          "show": true,
          "policy": false,
          "alarm": false,
          "opt": false,
          "cc": false,
          "nc": false,
          "fieldname": "pnr"
        },
        {
          "translation": "Namn",
          "type": "text",
          "encrypted": false,
          "show": true,
          "policy": false,
          "alarm": false,
          "opt": false,
          "cc": false,
          "nc": false,
          "fieldname": "namn"
        },
        {
          "translation": "Adress",
          "type": "textarea",
          "encrypted": false,
          "show": true,
          "policy": false,
          "alarm": false,
          "opt": false,
          "cc": false,
          "nc": false,
          "fieldname": "adress"
        },
        {
          "translation": "Sensitive info",
          "type": "textarea",
          "encrypted": true,
          "show": true,
          "policy": false,
          "alarm": false,
          "opt": true,
          "cc": false,
          "nc": true,
          "fieldname": "cryptedinfo"
        }
      ]
    },
    {
      "id": "4",
      "info": {
        "id": "4",
        "name": "Login",
        "ico": "ico_server",
        "active": true,
        "wb": true
      },
      "structure": [
        {
          "translation": "Host / IP",
          "type": "text",
          "encrypted": false,
          "show": true,
          "policy": false,
          "alarm": false,
          "opt": false,
          "cc": false,
          "nc": false,
          "fieldname": "host"
        },
        {
          "translation": "Username",
          "type": "text",
          "encrypted": false,
          "show": true,
          "policy": false,
          "alarm": false,
          "opt": false,
          "cc": false,
          "nc": false,
          "log": true,
          "fieldname": "username"
        },
        {
          "translation": "Password",
          "type": "text-passwdgen",
          "encrypted": true,
          "show": true,
          "policy": true,
          "alarm": true,
          "opt": false,
          "cc": true,
          "nc": true,
          "fieldname": "password"
        }
      ]
    },
    {
      "id": "10",
      "info": {
        "id": "10",
        "name": "Short login",
        "ico": "ico_server",
        "active": true,
        "wb": true
      },
      "structure": [
        {
          "translation": "Username",
          "type": "text",
          "encrypted": false,
          "show": true,
          "policy": false,
          "alarm": false,
          "opt": false,
          "cc": false,
          "nc": false,
          "fieldname": "username"
        },
        {
          "translation": "Password",
          "type": "text-passwdgen",
          "encrypted": true,
          "show": true,
          "policy": true,
          "alarm": true,
          "opt": false,
          "cc": true,
          "nc": true,
          "fieldname": "password"
        }
      ]
    },
    {
      "id": "1",
      "info": {
        "id": "1",
        "name": "Server",
        "ico": "ico_server",
        "active": true,
        "wb": true
      },
      "structure": [
        {
          "translation": "Host",
          "type": "text",
          "encrypted": false,
          "show": true,
          "policy": false,
          "alarm": false,
          "opt": false,
          "cc": false,
          "nc": false,
          "fieldname": "host"
        },
        {
          "translation": "Username",
          "type": "text",
          "encrypted": false,
          "show": true,
          "policy": false,
          "alarm": false,
          "opt": false,
          "cc": false,
          "nc": false,
          "log": true,
          "fieldname": "username"
        },
        {
          "translation": "Password",
          "type": "text-passwdgen",
          "encrypted": true,
          "show": true,
          "policy": true,
          "alarm": true,
          "opt": false,
          "cc": true,
          "nc": true,
          "fieldname": "password"
        },
        {
          "translation": "Information",
          "type": "textarea",
          "encrypted": false,
          "show": true,
          "policy": false,
          "alarm": false,
          "opt": true,
          "cc": false,
          "nc": false,
          "fieldname": "info"
        },
        {
          "translation": "Sensitive info",
          "type": "textarea",
          "encrypted": true,
          "show": false,
          "policy": false,
          "alarm": false,
          "opt": true,
          "cc": false,
          "nc": false,
          "fieldname": "cryptedinfo"
        }
      ]
    },
    {
      "id": "3",
      "info": {
        "id": "3",
        "name": "File",
        "ico": "ico_file",
        "active": true,
        "wb": true,
        "jp": true,
        "file": "*"
      },
      "structure": [
        {
          "translation": "File",
          "type": "file",
          "encrypted": false,
          "show": true,
          "policy": false,
          "alarm": false,
          "opt": false,
          "cc": false,
          "nc": false,
          "fieldname": "file1"
        },
        {
          "translation": "Description",
          "type": "text",
          "encrypted": false,
          "show": true,
          "policy": false,
          "alarm": false,
          "opt": false,
          "cc": false,
          "nc": false,
          "fieldname": "description"
        }
      ]
    },
    {
      "id": "5",
      "info": {
        "id": "5",
        "name": "Quicknote",
        "ico": "ico_quicknote",
        "active": true,
        "wb": true
      },
      "structure": [
        {
          "translation": "Namn",
          "type": "text",
          "encrypted": false,
          "show": true,
          "policy": false,
          "alarm": false,
          "opt": false,
          "cc": false,
          "nc": false,
          "fieldname": "name"
        },
        {
          "translation": "Slutförd",
          "type": "progress",
          "encrypted": false,
          "show": true,
          "policy": false,
          "alarm": false,
          "opt": false,
          "cc": false,
          "nc": false,
          "fieldname": "progress"
        }
      ]
    },
    {
      "id": "8",
      "info": {
        "id": "8",
        "name": "Note",
        "ico": "ico_note",
        "active": true,
        "ed": true,
        "wb": false,
        "jp": true
      },
      "structure": [
        {
          "translation": "Name",
          "type": "text",
          "encrypted": false,
          "show": true,
          "policy": false,
          "alarm": false,
          "opt": false,
          "cc": false,
          "nc": false,
          "fieldname": "name"
        },
        {
          "translation": "Note",
          "type": "textarea",
          "encrypted": true,
          "show": true,
          "policy": false,
          "alarm": false,
          "opt": true,
          "cc": false,
          "nc": true,
          "fieldname": "note"
        }
      ]
    },
    {
      "id": "9",
      "info": {
        "id": "9",
        "name": "PIN code",
        "ico": "ico_pin",
        "active": true,
        "ed": true,
        "wb": false,
        "jp": true
      },
      "structure": [
        {
          "translation": "Name",
          "type": "text",
          "encrypted": false,
          "show": true,
          "policy": false,
          "alarm": false,
          "opt": false,
          "cc": false,
          "nc": false,
          "fieldname": "name"
        },
        {
          "translation": "PIN Code",
          "type": "text-passwdgen",
          "encrypted": true,
          "show": true,
          "policy": true,
          "alarm": true,
          "opt": false,
          "cc": true,
          "nc": true,
          "fieldname": "pincode"
        },
        {
          "translation": "Information",
          "type": "textarea",
          "encrypted": false,
          "show": true,
          "policy": false,
          "alarm": false,
          "opt": true,
          "cc": false,
          "nc": false,
          "fieldname": "info"
        }
      ]
    },
    {
      "id": "11",
      "info": {
        "id": "11",
        "name": "Credit Card",
        "ico": "ico_ccard",
        "active": true,
        "wb": true,
        "jp": false
      },
      "structure": [
        {
          "translation": "Bank/Service",
          "type": "text",
          "encrypted": false,
          "show": true,
          "policy": false,
          "alarm": false,
          "opt": false,
          "cc": false,
          "nc": false,
          "fieldname": "service"
        },
        {
          "translation": "Card number",
          "type": "text",
          "encrypted": true,
          "show": true,
          "policy": false,
          "alarm": false,
          "opt": false,
          "cc": false,
          "nc": true,
          "fieldname": "cardno"
        },
        {
          "translation": "Expires",
          "type": "date",
          "encrypted": true,
          "show": true,
          "policy": false,
          "alarm": false,
          "opt": true,
          "cc": false,
          "nc": true,
          "fieldname": "expires"
        },
        {
          "translation": "CVC",
          "type": "text",
          "encrypted": true,
          "show": true,
          "policy": false,
          "alarm": false,
          "opt": true,
          "cc": false,
          "nc": true,
          "fieldname": "cvc"
        },
        {
          "translation": "Cardholder Name",
          "type": "text",
          "encrypted": false,
          "show": true,
          "policy": false,
          "alarm": false,
          "opt": true,
          "cc": false,
          "nc": false,
          "fieldname": "owner"
        },
        {
          "translation": "PIN Code",
          "type": "text",
          "encrypted": true,
          "show": false,
          "policy": false,
          "alarm": false,
          "opt": true,
          "cc": true,
          "nc": true,
          "fieldname": "pincode"
        },
        {
          "translation": "Secret Note",
          "type": "textarea",
          "encrypted": true,
          "show": false,
          "policy": false,
          "alarm": false,
          "opt": true,
          "cc": false,
          "nc": true,
          "fieldname": "note1"
        },
        {
          "translation": "Public Note",
          "type": "textarea",
          "encrypted": false,
          "show": false,
          "policy": false,
          "alarm": false,
          "opt": true,
          "cc": false,
          "nc": false,
          "fieldname": "note2"
        }
      ]
    },
    {
      "id": "12",
      "info": {
        "id": "12",
        "name": "x.509",
        "ico": "ico_certfolder",
        "active": true,
        "wb": true,
        "jp": true
      },
      "structure": [
        {
          "translation": "Name",
          "type": "text",
          "encrypted": false,
          "show": true,
          "policy": false,
          "alarm": false,
          "opt": false,
          "cc": false,
          "nc": false,
          "fieldname": "name"
        },
        {
          "translation": "Key length",
          "type": "dropdown",
          "encrypted": false,
          "show": true,
          "policy": false,
          "alarm": false,
          "opt": true,
          "cc": false,
          "nc": false,
          "options": [
            "1024",
            "2048",
            "4096"
          ],
          "options_default": "2048",
          "fieldname": "keylen"
        },
        {
          "translation": "Digest algorithm",
          "type": "dropdown",
          "encrypted": false,
          "show": true,
          "policy": false,
          "alarm": false,
          "opt": true,
          "cc": false,
          "nc": false,
          "options": [
            "SHA-1",
            "SHA-256",
            "SHA-384",
            "SHA-512"
          ],
          "options_default": "SHA-256",
          "fieldname": "algorithm"
        },
        {
          "translation": "Password",
          "type": "text-passwdgen",
          "encrypted": true,
          "show": true,
          "policy": true,
          "alarm": true,
          "opt": true,
          "cc": false,
          "nc": true,
          "fieldname": "password"
        },
        {
          "translation": "Common name",
          "type": "text",
          "encrypted": false,
          "show": true,
          "policy": false,
          "alarm": false,
          "opt": false,
          "cc": false,
          "nc": false,
          "placeholder": "e.g. example.com",
          "fieldname": "commonname"
        },
        {
          "translation": "Country code",
          "type": "countrycode",
          "encrypted": false,
          "show": true,
          "policy": false,
          "alarm": false,
          "opt": false,
          "cc": false,
          "nc": false,
          "options_default": "SE",
          "fieldname": "countrycode"
        },
        {
          "translation": "State / provice",
          "type": "text",
          "encrypted": false,
          "show": false,
          "policy": false,
          "alarm": false,
          "opt": true,
          "cc": false,
          "nc": false,
          "placeholder": "e.g. Arizona",
          "fieldname": "state"
        },
        {
          "translation": "City",
          "type": "text",
          "encrypted": false,
          "show": false,
          "policy": false,
          "alarm": false,
          "opt": true,
          "cc": false,
          "nc": false,
          "placeholder": "e.g. Stockholm",
          "fieldname": "city"
        },
        {
          "translation": "Organization",
          "type": "text",
          "encrypted": false,
          "show": false,
          "policy": false,
          "alarm": false,
          "opt": true,
          "cc": false,
          "nc": false,
          "placeholder": "",
          "fieldname": "org"
        },
        {
          "translation": "Organization unit",
          "type": "text",
          "encrypted": false,
          "show": false,
          "policy": false,
          "alarm": false,
          "opt": true,
          "cc": false,
          "nc": false,
          "placeholder": "",
          "fieldname": "orgunit"
        },
        {
          "translation": "Subject Alternative Name - SAN",
          "type": "text",
          "encrypted": false,
          "show": false,
          "policy": false,
          "alarm": false,
          "opt": true,
          "cc": false,
          "nc": false,
          "placeholder": "mail.example.com,www.example.com (separated with comma)",
          "fieldname": "altnames"
        }
      ]
    },
    {
      "id": "1001",
      "info": {
        "id": "1001",
        "name": "Server/IP",
        "ico": "ico_server",
        "active": true,
        "wb": true
      },
      "structure": [
        {
          "translation": "Host",
          "type": "text",
          "encrypted": false,
          "show": true,
          "policy": false,
          "alarm": false,
          "opt": false,
          "cc": false,
          "nc": false,
          "fieldname": "host"
        },
        {
          "translation": "IP",
          "type": "text",
          "encrypted": false,
          "show": true,
          "policy": false,
          "alarm": false,
          "opt": false,
          "cc": false,
          "nc": false,
          "fieldname": "ip"
        },
        {
          "translation": "Username",
          "type": "text",
          "encrypted": false,
          "show": true,
          "policy": false,
          "alarm": false,
          "opt": false,
          "cc": false,
          "nc": false,
          "log": true,
          "fieldname": "username"
        },
        {
          "translation": "Password",
          "type": "text-passwdgen",
          "encrypted": true,
          "show": true,
          "policy": true,
          "alarm": true,
          "opt": false,
          "cc": true,
          "nc": true,
          "fieldname": "password"
        },
        {
          "translation": "Information",
          "type": "textarea",
          "encrypted": false,
          "show": true,
          "policy": false,
          "alarm": false,
          "opt": true,
          "cc": false,
          "nc": false,
          "fieldname": "info"
        },
        {
          "translation": "Sensitive info",
          "type": "textarea",
          "encrypted": true,
          "show": false,
          "policy": false,
          "alarm": false,
          "opt": true,
          "cc": false,
          "nc": false,
          "fieldname": "cryptedinfo"
        }
      ]
    }
  ],
  "DATA": {
    "token": "oZLDLq63cxJ1UfkF7uufphdg3sk657rpog11qs3qg6"
  },
  "HEADERS": {
    "Connection": "close",
    "Host": "chili.dev.xpd.se",
    "User-Agent": "Ruby",
    "Accept": "*/*",
    "Accept-Encoding": "gzip;q=1.0,deflate;q=0.6,identity;q=0.3"
  },
  "PARAMS": [],
  "CALLINFO": {
    "token": "oZLDLq63cxJ1UfkF7uufphdg3sk657rpog11qs3qg6",
    "general": [],
    "handler": "VaultHandler",
    "status": "SUCCESS",
    "errors": 0,
    "errorcodes": 0
  }
};

export default ssVault;