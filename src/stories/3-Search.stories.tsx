import React, { useState } from 'react';
import * as Search from '../components/Search';

export default {
  title: 'Search',
}

export const Searchbar: React.FunctionComponent = () => {
  const [needle, setNeedle] = useState<string>('');
  const [isLoading, setLoading] = useState<boolean>(false);

  return (
    <section>
      <Search.SearchBar
        needle={needle}
        isLoading={isLoading}
        onNeedleChange={setNeedle}
        onSearch={(): void => setLoading(!isLoading)}
      />
      <Search.SearchBar
        needle={needle}
        isLoading={!isLoading}
        onNeedleChange={setNeedle}
        onSearch={(): void => setLoading(!isLoading)}
      />
    </section>
  );
};
