import { Outlet } from 'react-router-dom';
import { Layout } from './Layout';

export function UserLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export default UserLayout;
