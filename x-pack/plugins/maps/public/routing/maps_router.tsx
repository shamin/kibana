/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { Router, Switch, Route, Redirect, RouteComponentProps } from 'react-router-dom';
import { Provider } from 'react-redux';
import { AppMountParameters, AppMountContext } from 'kibana/public';
import { getCoreI18n, getToasts, getEmbeddableService } from '../kibana_services';
import {
  createKbnUrlStateStorage,
  withNotifyOnErrors,
  IKbnUrlStateStorage,
} from '../../../../../src/plugins/kibana_utils/public';
import { getStore } from './store_operations';
import { LoadListAndRender } from './routes/list/load_list_and_render';
import { LoadMapAndRender } from './routes/maps_app/load_map_and_render';

export let goToSpecifiedPath: (path: string) => void;
export let kbnUrlStateStorage: IKbnUrlStateStorage;

export async function renderApp(
  context: AppMountContext,
  { appBasePath, element, history, onAppLeave }: AppMountParameters
) {
  goToSpecifiedPath = (path: string) => history.push(path);
  kbnUrlStateStorage = createKbnUrlStateStorage({
    useHash: false,
    history,
    ...withNotifyOnErrors(getToasts()),
  });

  render(<App history={history} appBasePath={appBasePath} onAppLeave={onAppLeave} />, element);

  return () => {
    unmountComponentAtNode(element);
  };
}

interface AppProps {
  history: AppMountParameters['history'] | RouteComponentProps['history'];
  appBasePath: AppMountParameters['appBasePath'];
  onAppLeave: AppMountParameters['onAppLeave'];
}

const App: React.FC<AppProps> = ({ history, appBasePath, onAppLeave }: AppProps) => {
  const store = getStore();
  const I18nContext = getCoreI18n().Context;

  const stateTransfer = getEmbeddableService()?.getStateTransfer(
    history as AppMountParameters['history']
  );

  const { originatingApp }: { originatingApp?: string } =
    stateTransfer?.getIncomingEditorState({ keysToRemoveAfterFetch: ['originatingApp'] }) || {};

  return (
    <I18nContext>
      <Provider store={store}>
        <Router history={history as RouteComponentProps['history']}>
          <Switch>
            <Route
              path={`/map/:savedMapId`}
              render={(props) => (
                <LoadMapAndRender
                  savedMapId={props.match.params.savedMapId}
                  onAppLeave={onAppLeave}
                  stateTransfer={stateTransfer}
                  originatingApp={originatingApp}
                />
              )}
            />
            <Route
              exact
              path={`/map`}
              render={() => (
                <LoadMapAndRender
                  onAppLeave={onAppLeave}
                  stateTransfer={stateTransfer}
                  originatingApp={originatingApp}
                />
              )}
            />
            // Redirect other routes to list, or if hash-containing, their non-hash equivalents
            <Route
              path={``}
              render={({ location: { pathname, hash } }) => {
                if (hash) {
                  // Remove leading hash
                  const newPath = hash.substr(1);
                  return <Redirect to={newPath} />;
                } else if (pathname === '/' || pathname === '') {
                  return <LoadListAndRender />;
                } else {
                  return <Redirect to="/" />;
                }
              }}
            />
          </Switch>
        </Router>
      </Provider>
    </I18nContext>
  );
};
