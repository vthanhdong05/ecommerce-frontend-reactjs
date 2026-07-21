import { Link } from 'react-router-dom';
import { User, Heart, LogIn } from 'lucide-react';
import { useState } from 'react';

interface UserMenuProps {
  className?: string;
}

export function UserMenu({ className = '' }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  // TODO: Lấy từ auth state (Redux)
  const isLoggedIn = false;
  const userName = '';

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {isLoggedIn ? (
          <>
            <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">{userName.charAt(0).toUpperCase()}</span>
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
            {isLoggedIn ? (
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
                  onClick={() => {
                    setIsOpen(false);
                    // TODO: handle logout
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
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
