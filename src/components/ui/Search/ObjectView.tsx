import React from 'react';
import { SearchResult, SearchResultField } from '../../../model/Search';
import { Button } from '../common';
import icons from '../../../ico';
import './ObjectView.scss';

const encryptedFieldText = (
  field: SearchResultField,
  onDecrypt: () => void
): React.ReactNode => {
  if (!field.isDecrypted) {
    return <button className="decrypt" onClick={onDecrypt}>show</button>;
  }
  return field.value.split('').map((c, i) => {
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
  url: string;
  id: string;
  result: SearchResult;
  onDecrypt: (url: string, objectId: string, field: string) => void;
  onCopy: (url: string, objectId: string, field: string) => void;
  onFill: (url: string, objectId: string) => void;
}

export const ObjectView: React.FunctionComponent<ObjectViewProps> = ({
  url,
  id,
  result,
  onDecrypt,
  onCopy,
  onFill,
}: ObjectViewProps) => {
  return (
    <section className="object-view">
      <article className="object-view-container">
        <hgroup
          className="object-view-title"
          style={{ backgroundImage: `url('${icons[result.icon]}')`}}>
          <h2 className="object-view-name">{result.name}</h2>
          <h3 className="obejct-view-url">{url}</h3>
        </hgroup>
        <Button className="object-view-fill" onClick={(): void => onFill(url, id)}>Fill</Button>
        {Object.keys(result.fields).map((field) => {
          let value: React.ReactNode;
          if (result.fields[field].isEncrypted) {
            value = encryptedFieldText(result.fields[field], (): void => onDecrypt(url, id, field));
          } else {
            value = result.fields[field].value;
          }
          return (
            <div className="object-view-field" key={field}>
              <p className="object-view-field-text">
                <span className="field-title">
                  {result.fields[field].title}
                </span>
                <span className="field-value">
                  {value}
                </span>
              </p>
              <button
                className="object-view-field-copy"
                onClick={(): void => onCopy(url, id, field)}>
                Copy
              </button>
            </div>
          );
        })}
      </article>
    </section>
  );
};
