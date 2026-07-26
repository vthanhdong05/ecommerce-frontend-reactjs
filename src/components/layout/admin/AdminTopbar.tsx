import { LogOut, Store } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../../../hooks/toastContext';
import { useAuth } from '../../../hooks/useAuth';

export function AdminTopbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const rawName = user?.firstName || user?.email?.split('@')[0] || 'Admin';
  const initial = rawName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    try {
      await logout();
      showToast('Đăng xuất thành công!', 'success');
      navigate('/');
    } catch {
      showToast('Đăng xuất thất bại.', 'error');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <Link to="/admin" className="text-base font-semibold text-gray-900">
              VTDhub Admin
            </Link>
            <p className="text-xs text-gray-500 -mt-0.5">Bảng điều khiển</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="text-sm text-gray-600 hover:text-primary transition-colors hidden md:inline"
          >
            Về trang chủ
          </Link>
          <div className="flex items-center gap-2 px-2 py-1">
            <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">{initial}</span>
            </div>
            <span className="hidden md:inline text-sm text-gray-700">{rawName}</span>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-red-500 transition-colors px-2 py-1 rounded"
            title="Đăng xuất"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Đăng xuất</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default AdminTopbar;
