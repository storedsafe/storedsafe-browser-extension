import React, { useState } from 'react'

const useInject = () => {
  const [tabValues, setTabValues] = useState<Record<string, string>>({})

  browser.runtime.onMessage.addListener((message, sender) => {
    console.log('INJECT', message, sender)
    if (sender.tab?.active && message?.type === 'save' && message?.values !== undefined) {
      console.log('INJECT FILTERED', message, sender)
      setTabValues(message.values)
    }
  })

  return {
    tabValues
  }
}

const InjectContainer: React.FunctionComponent = () => {
  const { tabValues } = useInject()

  return (
    <section>
      <p>Inject</p>
      {Object.keys(tabValues).map(key => <p key={key}>{key}: {tabValues[key]}</p>)}
    </section>
  )
}

export default InjectContainer
