import React from 'react';
import Main from './Main';

export default function MainContainer(props) {
  return <Main onLogOut={props.onLogOut} />;
}
