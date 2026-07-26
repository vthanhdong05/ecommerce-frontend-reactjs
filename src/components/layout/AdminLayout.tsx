import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './admin/AdminSidebar';
import { AdminTopbar } from './admin/AdminTopbar';

export function AdminLayout() {
  return (
    <div className="grid bg-gray-50 min-h-screen" style={{ gridTemplateRows: 'auto 1fr' }}>
      <AdminTopbar />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 min-w-0 overflow-x-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
