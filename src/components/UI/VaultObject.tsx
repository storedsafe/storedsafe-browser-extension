import * as React from 'react';
import { StoredSafeObject, StoredSafeTemplate } from 'storedsafe';
import './VaultObject.scss';

export interface VaultObjectProps {
  ssObject: StoredSafeObject;
  ssTemplate: StoredSafeTemplate;
}

export const VaultObject: React.FC<VaultObjectProps> = ({
  ssObject,
  ssTemplate,
}: VaultObjectProps) => {
  const fields = Object.keys(ssTemplate.STRUCTURE);
  const fieldElements = fields.map((field) => {
    const fieldTemplate = ssTemplate.STRUCTURE[field];
    const fieldTitle = fieldTemplate.translation;
    const fieldValue = fieldTemplate.encrypted ? '******' : ssObject.public[field];
    return (
      <div key={field} className="vault-object-field">
        <div className="vault-object-field-title">{fieldTitle}: </div>
        <div className="vault-object-field-value">{fieldValue}</div>
      </div>
    );
  });
  const title = (
    <div className="vault-object-title">
      <div className="vault-object-title-name">
        {ssObject.objectname === '' ? ssObject.filename : ssObject.objectname}
      </div>
    </div>
  );

  return (
    <div>
      {title}
      {fieldElements}
    </div>
  );
}
