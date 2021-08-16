/**
 * @author @rkrishna-gembrill
 * @since Feb 16 2021
 * @version V11.0
 */
import React from 'react';

export const ApiUrlAndTokenContext = React.createContext({});

const ApiUrlAndTokenProvider = ({ apiURL, token, ...props }) => {
  return (
    <ApiUrlAndTokenContext.Provider value={{ apiURL, token }}>
      {props.children}
    </ApiUrlAndTokenContext.Provider>
  );
};

export default ApiUrlAndTokenProvider;
