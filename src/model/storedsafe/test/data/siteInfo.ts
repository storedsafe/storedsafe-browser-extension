export const siteInfo: SSSiteInfo = {
  vaults: [{ id: '1', name: 'vault1', canWrite: true }],
  templates: [
    {
      id: '4',
      name: 'Login',
      icon: 'ico_server',
      structure: [
        {
          isEncrypted: false,
          name: 'host',
          title: 'Host / IP',
          type: 'text'
        },
        {
          isEncrypted: false,
          name: 'username',
          title: 'Username',
          type: 'text'
        },
        {
          isEncrypted: true,
          name: 'password',
          title: 'Password',
          type: 'text-passwdgen'
        }
      ]
    }
  ]
}

export const siteInfoNoVaults: SSSiteInfo = {
  vaults: [],
  templates: [
    {
      id: '4',
      name: 'Login',
      icon: 'ico_server',
      structure: [
        {
          isEncrypted: false,
          name: 'host',
          title: 'Host / IP',
          type: 'text'
        },
        {
          isEncrypted: false,
          name: 'username',
          title: 'Username',
          type: 'text'
        },
        {
          isEncrypted: true,
          name: 'password',
          title: 'Password',
          type: 'text-passwdgen'
        }
      ]
    }
  ]
}
