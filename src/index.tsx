import * as React from 'react';
import { PiletApi } from 'consolid-shell';
import App from './App'
import { Link } from 'react-router-dom'

export function setup(app: PiletApi) {
  const constants = app.getData("CONSTANTS")
  const connect = app.makeState(app, constants)
  const Module = connect(({ state, actions }) => app.withState(App, { app, state, actions }))

  app.showNotification(`Registered "${app.meta.name}" module!`, { autoClose: 2000, });
  if (app.meta.route) {
    app.registerMenu(() => <Link to={app.meta.route} style={{ marginLeft: 5, marginRight: 5 }}>{app.meta.name}</Link>);
    app.registerPage(app.meta.route, () => <Module />)
  }
  app.registerExtension(app.meta["link"], Module)
}
