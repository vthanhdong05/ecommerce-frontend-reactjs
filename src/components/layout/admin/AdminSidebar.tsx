import { type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';
import { usePermission } from '../../../hooks/usePermission';
import { ADMIN_ROUTES } from '../../../routes/adminRoutes';

export function AdminSidebar() {
  return (
    <aside className="hidden md:flex md:flex-col md:w-60 lg:w-64 bg-white border-r border-gray-200 shrink-0">
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {/* Dashboard link (always visible to admin) */}
        <SidebarItem to="/admin" label="Tổng quan" icon={LayoutDashboard} end />

        {ADMIN_ROUTES.filter((r) => !r.hideInSidebar).map((entry) => (
          <SidebarPermissionGate key={entry.path} permissionKey={entry.readPermission}>
            <NavLink
              to={entry.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              <entry.icon className="w-4 h-4" />
              <span>{entry.label}</span>
            </NavLink>
          </SidebarPermissionGate>
        ))}
      </nav>
    </aside>
  );
}

interface SidebarItemProps {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
}

function SidebarItem({ to, label, icon: Icon, end }: SidebarItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${
          isActive ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700 hover:bg-gray-50'
        }`
      }
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </NavLink>
  );
}

function SidebarPermissionGate({
  permissionKey,
  children,
}: {
  permissionKey: string;
  children: ReactNode;
}) {
  const allowed = usePermission(permissionKey);
  if (!allowed) return null;
  return <>{children}</>;
}

export default AdminSidebar;
