import React from 'react'
import './ObjectView.scss'
import { Button } from '../../common/input'

export type OnShowCallback = (
  host: string,
  resultId: number,
  fieldId: number
) => void
export type OnCopyCallback = (
  host: string,
  resultId: number,
  fieldId: number
) => void
export type OnFillCallback = (host: string, resultId: number) => void

interface ObjectViewProps {
  host: string
  resultId: number
  result: SSObject
  onShow: OnShowCallback
  onCopy: OnCopyCallback
  onFill: OnFillCallback
}

export const ObjectView: React.FunctionComponent<ObjectViewProps> = ({
  host,
  resultId,
  result,
  onShow,
  onCopy,
  onFill
}: ObjectViewProps) => {
  const encryptedFieldText = (
    field: SSField,
    onShow: () => void
  ): React.ReactNode => {
    if (!field.isShowing) {
      return (
        <button className='show' onClick={onShow}>
          show
        </button>
      )
    }
    return field.value.split('').map((c, i) => {
      let className = 'encrypted-field'
      if (/[0-9]/.test(c)) {
        className += ' number'
      } else if (/[a-z]/.test(c)) {
        className += ' lowercase'
      } else if (/[A-Z]/.test(c)) {
        className += ' uppercase'
      } else {
        className += ' symbol'
      }
      return (
        <span key={i} className={className}>
          {c}
        </span>
      )
    })
  }

  return (
    <section className='object-view'>
      <article className='object-view-container'>
        <Button
          className='object-view-fill'
          onClick={(): void => onFill(host, resultId)}
        >
          Fill
        </Button>
        {result.fields.map((field, fieldId) => {
          let value: React.ReactNode
          if (field.isEncrypted) {
            value = encryptedFieldText(field, (): void =>
              onShow(host, resultId, fieldId)
            )
          } else {
            value = field.value
          }
          return (
            <div className='object-view-field' key={field.name}>
              <p className='object-view-field-text'>
                <span className='field-title'>{field.title}</span>
                <span className='field-value'>{value}</span>
              </p>
              <button
                className='object-view-field-copy'
                onClick={(): void => onCopy(host, resultId, fieldId)}
              >
                Copy
              </button>
            </div>
          )
        })}
      </article>
    </section>
  )
}
