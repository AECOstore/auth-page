import * as React from 'react';
import { PiletApi } from 'consolid-shell';
import Cookies from 'universal-cookie';
import App from './App'
import { Link } from 'react-router-dom';
const cookies = new Cookies()

export function setup(app: PiletApi) {
  const constants = app.getData("CONSTANTS")

  let token = cookies.get(constants.ACCESS_TOKEN)
  app.setData(constants.ACCESS_TOKEN, token)

  const connect = app.makeState(app)
  const Module = connect(({state, actions}) => app.withState(App, {app, state, actions}))

  app.showNotification('Registered auth Pilet!', {
    autoClose: 2000,
  });
  app.registerMenu(() =>
    <Link to="/auth" style={{marginLeft: 5, marginRight: 5}}>Log In</Link>
  );
  app.registerPage("/auth", Module)
  app.registerExtension('auth-pilet', Module)
}
