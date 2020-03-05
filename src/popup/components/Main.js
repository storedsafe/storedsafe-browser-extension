import React, { useState } from 'react';
import SearchContainer from '../containers/SearchContainer';
import ObjectListContainer from '../containers/ListContainer';

export default function Main(props) {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);

  return (
    <section className="popup_main">
      <SearchContainer
        onSearch={items => setItems(items)}
      />
      <ObjectListContainer
        items={items}
        onSelect={selected => setSelected(selected) }
      />
      <button onClick={props.onLogOut}>Log out</button>
    </section>
  );
}
