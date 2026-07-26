import { Footer } from './Footer';
import { Header } from './Header';
import { Outlet } from 'react-router-dom';

export function UserLayout() {
  return (
    <div className="grid bg-white" style={{ gridTemplateRows: 'auto 1fr auto' }}>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default UserLayout;
