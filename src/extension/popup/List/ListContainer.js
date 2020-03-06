import React from 'react';
import List from '../components/List';

function ItemsTypeException(message, items) {
  this.message = message;
  this.items = items;
}

export default function ListContainer(props) {

  function onSelectItem(item) {
    props.onSelect(item);
  }

  if (!Array.isArray(props.items)) {
    throw new ItemsTypeException(
      "Expected 'props.items' to be of type Array.",
      props.items
    );
  }

  return <List items={props.items} onSelectItem={onSelectItem} />;
}
