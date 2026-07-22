import { Heart, LogIn, User } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../../../hooks/toastContext';
import { useAuth } from '../../../hooks/useAuth';

interface UserMenuProps {
  className?: string;
}

export function UserMenu({ className = '' }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { showToast } = useToast();

  const handleLogout = async () => {
    setIsOpen(false);
    try {
      await logout();
      showToast('Đăng xuất thành công!', 'success');
      navigate('/');
    } catch {
      showToast('Đăng xuất thất bại.', 'error');
    }
  };

  const rawName = user?.firstName || user?.email?.split('@')[0] || 'User';
  const userName = rawName.length > 15 ? `${rawName.slice(0, 15)}...` : rawName;
  const initial = rawName.charAt(0).toUpperCase();

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-gray-700 font-semibold hover:text-primary transition-colors cursor-pointer"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {isAuthenticated ? (
          <>
            <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">{initial}</span>
            </div>
            <span className="hidden md:inline text-sm">{userName}</span>
          </>
        ) : (
          <>
            <User className="w-5 h-5" />
            <span className="hidden md:inline text-sm">Tài khoản</span>
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Tài khoản của tôi
                </Link>
                <Link
                  to="/orders"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Đơn hàng
                </Link>
                <Link
                  to="/wishlist"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    Yêu thích
                  </span>
                </Link>
                <hr className="my-2 border-gray-100" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors cursor-pointer"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Đăng nhập
                  </span>
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default UserMenu;
