import React from 'react';
import * as PopupUI from '../ui/Popup';

export const Popup: React.FunctionComponent = () => {
  return (
    <PopupUI.Main menu="menu" left="left" right="right" status="status" />
  );
};
