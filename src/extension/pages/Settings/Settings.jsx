import React, { useState, useEffect } from 'react';
import Message from '../../utils/Message';
import Input from '../../components/Input';
import Header from '../../components/Header';
import Loading from '../../components/Loading';

export default function Settings() {
  const [isLoading, setIsLoading] = useState(true);
  const [site, setSite] = useState(null);
  const [apikey, setApikey] = useState(null);

  useEffect(() => {
    Message.getSettings().then(({ site: savedSite, apikey: savedApikey }) => {
      setSite(savedSite);
      setApikey(savedApikey);
      setIsLoading(false);
    });
  }, []);

  const onSiteChange = (event) => {
    setSite(event.target.value);
    setIsLoading(true);
    Message.updateSettings({ site: event.target.value }).then(() => {
      setIsLoading(false);
    });
  };

  const onApikeyChange = (event) => {
    setApikey(event.target.value);
    setIsLoading(true);
    Message.updateSettings({ apikey: event.target.value }).then(() => {
      setIsLoading(false);
    });
  };

  return (
    <div className="settings">
      <Header />
      <section className="card">
        <h1>Settings</h1>
        <Input
          type="text"
          name="site"
          title="Site"
          value={site || ''}
          onChange={onSiteChange}
        />
        <Input
          type="text"
          name="apikey"
          title="API Key"
          value={apikey || ''}
          onChange={onApikeyChange}
        />
        {isLoading && <Loading />}
      </section>
    </div>
  );
}
