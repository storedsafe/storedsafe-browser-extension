import React, { useState, useEffect } from 'react';
import Message from '../../lib/Message';
import Input from '../../components/Input';
import Header from '../../components/Header';

const useSettings = (cb) => {
  const [inputs, setInputs] = useState({});

  const onChange = (event) => {
    const { name, type } = event.target;
    const value = ['checkbox'].includes(type)
      ? event.target.checked
      : event.target.value;
    setInputs({ ...inputs, [name]: value });
    cb(name, value);
  };

  const reset = (defaults) => {
    setInputs(defaults);
  };

  return {
    inputs,
    onChange,
    reset,
  };
};

const onSettingChanged = (name, value) => {
  Message.updateSettings({ [name]: value });
};

export default function Settings() {
  const { inputs, onChange, reset } = useSettings(onSettingChanged);

  useEffect(() => {
    Message.getSettings().then((settings) => {
      reset(settings);
    });
  }, []);

  return (
    <div className="settings">
      <Header />
      <section className="card">
        <h1>Settings</h1>
        <div className="site">
          <Input
            type="text"
            name="site"
            title="Site"
            value={inputs.site || ''}
            onChange={onChange}
          />
          <Input
            type="text"
            name="apikey"
            title="API Key"
            value={inputs.apikey || ''}
            onChange={onChange}
          />
        </div>
      </section>
    </div>
  );
}
