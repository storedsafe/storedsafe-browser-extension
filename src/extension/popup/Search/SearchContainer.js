import React, { useState } from 'react';
import Search from './Search';

export default function SearchContainer(props) {
  function onSearchChange(event) {
    // TODO: Implement fetch request
    const items = [
      {
        id: 1,
        objectname: 'Foo',
      },
      {
        id: 2,
        objectname: 'Bar',
      },
      {
        id: 3,
        objectname: 'Zot',
      },
    ].filter(item => {
      const objectName = item.objectname.toLowerCase();
      const searchTerm = event.target.value.toLowerCase();
      return objectName.indexOf(searchTerm) !== -1;
    });

    props.onSearch(items);
  }

  return <Search onChange={onSearchChange} />;
}
