import React from 'react';

export default function List(props) {
  return (
    <ul>
      {props.items.map(item => {
        return <li key={item.id}>{item.objectname}</li>;
      })}
    </ul>
  );
}
