/**
 * Properties for fields to be passed to the React component that renders the
 * form to update settings.
 * */
interface FieldsProps {
  [name: string]: {
    label: string
    unit?: string
    attributes: {
      type: string
      [attr: string]: string | number | boolean
    }
  }
}

/**
 * Description of all fields that can be adjusted by the user and.
 * */
export const fields: FieldsProps = {
  autoFill: {
    label: 'Auto Fill',
    attributes: {
      type: 'checkbox'
    }
  },
  idleMax: {
    label: 'Logout after being idle for',
    unit: 'minutes',
    attributes: {
      type: 'number',
      required: true,
      min: 1,
      max: 120
    }
  },
  maxTokenLife: {
    label: 'Logout after being online for',
    unit: 'hours',
    attributes: {
      type: 'number',
      required: true,
      min: 1,
      max: 24
    }
  }
}