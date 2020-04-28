import * as React from 'react';
import StoredSafe, {
  StoredSafeObject,
  StoredSafeTemplate,
  StoredSafeResponse,
} from 'storedsafe';
import * as Sessions from '../../model/Sessions';
import { Field } from '../Form';
import { VaultObject } from '../Layout';

interface SiteResponse {
  url: string;
  data: StoredSafeResponse;
}

type SitePromise = Promise<SiteResponse>;

interface SSObjects {
  [url: string]: {
    [id: string]: {
      ssObject: StoredSafeObject;
      ssTemplate: StoredSafeTemplate;
    };
  };
}

export const Search: React.FC = () => {
  const [needle, setNeedle] = React.useState<string>('');
  const [ssObjects, setSSObjects] = React.useState<SSObjects>();

  const requestFind = React.useCallback((url: string, session: Sessions.Session): SitePromise => {
    const { apikey, token } = session;
    const storedSafe = new StoredSafe(url, apikey, token);
    return storedSafe.find(needle).then((res) => {
      if (res.status === 200) {
        return { url, data: res.data };
      }
      throw new Error(`${res.status} ${res.statusText}`);
    });
  }, [needle]);

  const getObjects = React.useCallback((sessions: Sessions.Sessions): void => {
    const promises: SitePromise[] = [];
    Object.keys(sessions).forEach((url) => {
      promises.push(requestFind(url, sessions[url]));
    });
    const finishedPromises: Promise<void>[] = [];
    const newSSObjects: SSObjects = {};
    promises.forEach((promise) => {
      finishedPromises.push(promise.then(({ url, data }) => {
        newSSObjects[url] = {};
        const objectIDs = Object.keys(data.OBJECT);
        objectIDs.forEach((id) => {
          const ssObject = data.OBJECT[id];
          const templateID = ssObject.templateid;
          const ssTemplate = data.TEMPLATESINFO[templateID];
          newSSObjects[url][id] = { ssObject, ssTemplate };
        });
      }));
    });
    Promise.all(finishedPromises).then(() => setSSObjects(newSSObjects));
  }, [requestFind]);

  React.useEffect(() => {
    const getSSObjects = (): void => {
        Sessions.get().then((sessions) => {
          getObjects(sessions);
        });
    };

    if (needle.length > 0) {
      const id = setTimeout(getSSObjects, 1000);
      return (): void => { clearTimeout(id) };
    }
  }, [getObjects, needle]);

  return (
    <div className="search">
      <h2>Vault</h2>
      <Field
        label="Search"
        name="needle"
        value={needle}
        onChange={(newNeedle: string): void => setNeedle(newNeedle)}
      />
      {ssObjects && (
        Object.keys(ssObjects).map((url) => (
          <div key={url} style={{ marginBottom: '0.2em' }}>
            <h3>{url}</h3>
            {Object.keys(ssObjects[url]).map((id) => (
              <VaultObject key={id} {...ssObjects[url][id]} />
            ))}
          </div>
        ))
      )}
      {!ssObjects && <p>No objects found</p>}
    </div>
  );
}
