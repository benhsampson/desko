import React from 'react';
import { Provider } from 'react-redux';

import store from '../store';

export default function withRedux<P>(Component: React.ComponentType<P>) {
  const WithRedux: React.ComponentType<P> = (props) => (
    <Provider store={store}>
      <Component {...props} />
    </Provider>
  );

  return WithRedux;
}
