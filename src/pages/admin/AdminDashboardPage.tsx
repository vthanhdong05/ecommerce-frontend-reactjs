import { useEffect, useState } from 'react';
import {
  KeyRound,
  LayoutDashboard,
  Package,
  ShieldCheck,
  ShoppingCart,
  Store,
  Tags,
  Users,
} from 'lucide-react';
import { StatCard } from '../../components/admin/StatCard';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../hooks/useAuth';
import { usePermission } from '../../hooks/usePermission';
import { PERM, ROUTES } from '../../utils/buildPermissionKey';
import { getDashboardStats, type DashboardStats } from '../../api/stats.api';

const ZERO: DashboardStats = {
  users: 0,
  vendors: 0,
  products: 0,
  categories: 0,
  roles: 0,
  permissions: 0,
  orders: 0,
};

export function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>(ZERO);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const result = await getDashboardStats();
        setStats(result);
      } catch {
        setStats(ZERO);
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
        <p className="text-sm text-gray-500 mt-1">
          Chào {user?.firstName || user?.email || 'bạn'}! Đây là tổng quan hệ thống.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <UserTile value={stats.users} loading={isLoading} />
        <VendorTile value={stats.vendors} loading={isLoading} />
        <ProductTile value={stats.products} loading={isLoading} />
        <CategoryTile value={stats.categories} loading={isLoading} />
        <RoleTile value={stats.roles} loading={isLoading} />
        <PermissionTile value={stats.permissions} loading={isLoading} />
        <OrderTile value={stats.orders} loading={isLoading} />
      </div>

      <Card>
        <div className="flex items-start gap-3">
          <LayoutDashboard className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <h2 className="text-base font-semibold text-gray-900">Biểu đồ thời gian</h2>
            <p className="text-sm text-gray-500 mt-1">
              Tính năng đang phát triển. Backend hiện chưa cung cấp API thống kê doanh thu hoặc số
              lượng đơn hàng theo thời gian.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

interface TileProps {
  value: number;
  loading: boolean;
}

function UserTile({ value, loading }: TileProps) {
  const allowed = usePermission(PERM.list(ROUTES.users));
  if (!allowed) return null;
  return (
    <StatCard
      label="Người dùng"
      value={loading ? '…' : value.toLocaleString('vi-VN')}
      icon={Users}
      hint="Tổng user trong hệ thống"
    />
  );
}

function VendorTile({ value, loading }: TileProps) {
  const allowed = usePermission(PERM.list(ROUTES.vendors));
  if (!allowed) return null;
  return (
    <StatCard
      label="Nhà cung cấp"
      value={loading ? '…' : value.toLocaleString('vi-VN')}
      icon={Store}
      iconBg="bg-blue-50 text-blue-600"
    />
  );
}

function ProductTile({ value, loading }: TileProps) {
  const allowed = usePermission(PERM.list(ROUTES.products));
  if (!allowed) return null;
  return (
    <StatCard
      label="Sản phẩm"
      value={loading ? '…' : value.toLocaleString('vi-VN')}
      icon={Package}
      iconBg="bg-emerald-50 text-emerald-600"
    />
  );
}

function CategoryTile({ value, loading }: TileProps) {
  const allowed = usePermission(PERM.list(ROUTES.categories));
  if (!allowed) return null;
  return (
    <StatCard
      label="Danh mục"
      value={loading ? '…' : value.toLocaleString('vi-VN')}
      icon={Tags}
      iconBg="bg-purple-50 text-purple-600"
    />
  );
}

function RoleTile({ value, loading }: TileProps) {
  const allowed = usePermission(PERM.list(ROUTES.roles));
  if (!allowed) return null;
  return (
    <StatCard
      label="Vai trò"
      value={loading ? '…' : value.toLocaleString('vi-VN')}
      icon={ShieldCheck}
      iconBg="bg-amber-50 text-amber-600"
    />
  );
}

function PermissionTile({ value, loading }: TileProps) {
  const allowed = usePermission(PERM.list(ROUTES.permissions));
  if (!allowed) return null;
  return (
    <StatCard
      label="Quyền"
      value={loading ? '…' : value.toLocaleString('vi-VN')}
      icon={KeyRound}
      iconBg="bg-rose-50 text-rose-600"
    />
  );
}

function OrderTile({ value, loading }: TileProps) {
  const allowed = usePermission(PERM.list(ROUTES.orders));
  if (!allowed) return null;
  return (
    <StatCard
      label="Đơn hàng (của tôi)"
      value={loading ? '…' : value.toLocaleString('vi-VN')}
      icon={ShoppingCart}
      iconBg="bg-indigo-50 text-indigo-600"
      hint="Phạm vi user hiện tại"
    />
  );
}

export default AdminDashboardPage;
