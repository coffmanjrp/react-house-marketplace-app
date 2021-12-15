import { FC } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Spinner } from 'components';
import { useAuthStatus } from 'hooks/useAuthStatus';

const PrivateRoute: FC = () => {
  const { loggedIn, checkingStatus } = useAuthStatus();

  if (checkingStatus) {
    return <Spinner />;
  }

  return loggedIn ? <Outlet /> : <Navigate to="/sign-in" />;
};

export default PrivateRoute;
