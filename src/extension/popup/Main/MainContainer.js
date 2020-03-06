import React from 'react';
import Main from '../components/Main';

export default function MainContainer(props) {
  return <Main onLogOut={props.onLogOut} />;
}
