import { Footer } from './Footer';
import { Header } from './Header';
import { Outlet } from 'react-router-dom';

export function UserLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default UserLayout;
