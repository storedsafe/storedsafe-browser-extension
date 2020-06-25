export const results: Results = new Map<string, SSObject[]>([
  [
    'host',
    [
      {
        id: '1',
        templateId: '4',
        vaultId: '139',
        name: 'server',
        type: 'Login',
        icon: 'ico_server',
        isDecrypted: false,
        fields: [
          {
            name: 'host',
            title: 'Host / IP',
            value: 'server',
            isEncrypted: false,
            isPassword: false
          },
          {
            name: 'username',
            title: 'Username',
            value: 'username',
            isEncrypted: false,
            isPassword: false
          },
          {
            name: 'password',
            title: 'Password',
            value: undefined,
            isEncrypted: true,
            isPassword: true
          }
        ]
      }
    ]
  ]
])
export const sResults: SerializableResults = Array.from(results)

export const decryptedResult: SSObject = {
  id: '1',
  templateId: '4',
  vaultId: '139',
  name: 'server',
  type: 'Login',
  icon: 'ico_server',
  isDecrypted: true,
  fields: [
    {
      name: 'host',
      title: 'Host / IP',
      value: 'server',
      isEncrypted: false,
      isPassword: false
    },
    {
      name: 'username',
      title: 'Username',
      value: 'username',
      isEncrypted: false,
      isPassword: false
    },
    {
      name: 'password',
      title: 'Password',
      value: 'password',
      isEncrypted: true,
      isPassword: true
    }
  ]
}

// export const tabResults: TabResults = new Map([[1, results]])
export const sTabResults = [[1, sResults]]
