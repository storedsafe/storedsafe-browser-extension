import React from 'react';
import { StoredSafeObject, StoredSafeTemplate } from 'storedsafe';
import { Button } from '../common';
import icons from '../../../ico';
import './ObjectView.scss';

const encryptedFieldText = (
  field: string,
  ssObject: StoredSafeObject,
  onDecrypt: (field: string, id: string) => void
): React.ReactNode => {
  const onClick = (): void => {
    onDecrypt(field, ssObject.id);
  };
  if (ssObject.crypted === undefined) {
    return <button className="decrypt" onClick={onClick}>show</button>;
  }
  return ssObject.crypted[field].split('').map((c, i) => {
    let className = 'encrypted-field';
    if (/[0-9]/.test(c)) {
      className += ' number';
    } else if (/[a-z]/.test(c)) {
      className += ' lowercase';
    } else if (/[A-Z]/.test(c)) {
      className += ' uppercase';
    } else {
      className += ' symbol';
    }
    return <span key={i} className={className}>{c}</span>
  });
};

interface ObjectViewProps {
  selected?: { url: string; id: number };
  results: {
    [url: string]: {
      ssObject: StoredSafeObject;
      ssTemplate: StoredSafeTemplate;
    }[];
  };
  onDecrypt: (field: string, id: string) => void;
  onCopy: (value: string) => void;
  onFill: () => void;
}

export const ObjectView: React.FunctionComponent<ObjectViewProps> = ({
  selected,
  results,
  onDecrypt,
  onCopy,
  onFill,
}: ObjectViewProps) => {
  if (selected === undefined) {
    return (
      <section className="object-view">
        No object selected
      </section>
    );
  }

  const { url, id } = selected;
  const { ssObject, ssTemplate } = results[url][id];
  return (
    <section className="object-view">
      <article className="object-view-container">
        <hgroup
          className="object-view-title"
          style={{ backgroundImage: `url('${icons[ssTemplate.INFO.ico]}')`}}>
          <h2 className="object-view-name">{ssObject.objectname}</h2>
          <h3 className="obejct-view-url">{url}</h3>
        </hgroup>
        <Button className="object-view-fill" onClick={onFill}>Fill</Button>
        {Object.keys(ssTemplate.STRUCTURE).map((field) => {
          let value: React.ReactNode;
          const isEncrypted = ssTemplate.STRUCTURE[field].encrypted;
          if (isEncrypted) {
            value = encryptedFieldText(field, ssObject, onDecrypt);
          } else {
            value = ssObject.public[field];
          }
          return (
            <div className="object-view-field" key={field}>
              <p className="object-view-field-text">
                <span className="field-title">
                  {field}
                </span>
                <span className="field-value">
                  {value}
                </span>
              </p>
              <button
                className="object-view-field-copy"
                onClick={(): void => onCopy(isEncrypted ? (ssObject.crypted !== undefined ? ssObject.crypted[field] : '') : ssObject.public[field])}>
                Copy
              </button>
            </div>
          );
        })}
      </article>
    </section>
  );
};
