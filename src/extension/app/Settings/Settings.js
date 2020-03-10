import React from 'react';

export default function Settings(props) {
  const fields = props.fields.map(field => {
    return (
      <label key={field.key} htmlFor={field.key}>
        <p>{field.title}:</p>
        {React.createElement(field.element, {
          ...field.attr,
          [field.event]: props.onValueChange,
          id: field.key,
          name: field.key,
          disabled: field.managed === true,
        })}
      </label>
    )
  });

  return (
    <section className="settings">
      {fields}
    </section>
  );
}
