import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Loader } from '../components';
import { RouterList } from './routerList';

import HomePage from '../pages/App';
import RegisterPage from '../pages/RegisterPage';
const LoginPage = lazy(() => import(/* webpackChunkName: "about" */ '../pages/LoginPage'));
const ServerErrorPage = lazy(() => import(/* webpackChunkName: "servererror" */ '../pages/ServerError'));
const NotFoundPage = lazy(() => import(/* webpackChunkName: "notfound" */ '../pages/NotFound'));

export function Router() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path={RouterList.HOME}>
          <Route index element={<HomePage />} />
          <Route path={RouterList.LOGIN} element={<LoginPage />} />
          <Route path={RouterList.REGISTER} element={<RegisterPage />} />
          <Route path={RouterList.SERVER_ERROR} element={<ServerErrorPage />} />
          <Route path={RouterList.NOT_FOUND} element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

