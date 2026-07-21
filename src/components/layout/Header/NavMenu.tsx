import { ChevronDown, Menu } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

// Placeholder categories - lấy từ API sau
const CATEGORIES = [
  { name: 'Điện thoại', slug: 'dien-thoai' },
  { name: 'Laptop', slug: 'laptop' },
  { name: 'Tai nghe', slug: 'tai-nghe' },
  { name: 'Đồng hồ', slug: 'dong-ho' },
  { name: 'Giày dép', slug: 'giay-dep' },
  { name: 'Túi xách', slug: 'tui-xach' },
  { name: 'Mỹ phẩm', slug: 'my-pham' },
  { name: 'Đồ gia dụng', slug: 'do-gia-dung' },
];

interface NavMenuProps {
  className?: string;
}

export function NavMenu({ className = '' }: NavMenuProps) {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Trang chủ', path: '/' },
    { name: 'Sản phẩm', path: '/products' },
    { name: 'Khuyến mãi', path: '/promotions' },
    { name: 'Bestseller', path: '/bestseller' },
    { name: 'Tin tức', path: '/news' },
    { name: 'Liên hệ', path: '/contact' },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className={'bg-white hidden md:block ' + className}>
        <div className="container mx-auto py-2">
          <ul className="flex items-center h-11">
            {/* Danh mục Dropdown */}
            <li
              className="group relative"
              onMouseEnter={() => setIsCategoryOpen(true)}
              onMouseLeave={() => setIsCategoryOpen(false)}
            >
              <button className="flex items-center gap-2 px-4 h-11 text-black text-sm hover:bg-primary hover:text-white transition-colors duration-200">
                <Menu className="w-4 h-4" />
                <span className="font-medium">Danh mục</span>
                <ChevronDown
                  className={'w-4 h-4 transition-transform' + (isCategoryOpen ? ' rotate-180' : '')}
                />
              </button>

              {/* Dropdown Grid */}
              <div
                className={
                  'absolute left-0 top-full w-150 bg-white shadow-xl rounded-b-lg transition-all duration-200 z-50 ' +
                  (isCategoryOpen
                    ? 'opacity-100 visible translate-y-0'
                    : 'opacity-0 invisible -translate-y-2')
                }
              >
                <div className="grid grid-cols-4 gap-1 p-4">
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat.slug}
                      to={`/products?category=${cat.slug}`}
                      className="block px-3 py-2 text-gray-700 hover:bg-primary hover:text-white transition-colors duration-200 rounded text-sm"
                      onClick={() => setIsCategoryOpen(false)}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            </li>

            {/* Nav Links */}
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={
                      'group relative flex items-center px-4 h-11 text-sm transition-colors duration-300 font-medium ' +
                      (isActive ? 'text-primary' : 'text-black hover:text-primary')
                    }
                  >
                    {link.name}
                    <span
                      className={
                        'absolute bottom-0 h-0.5 bg-primary transition-all duration-300 ' +
                        (isActive
                          ? 'w-full left-0'
                          : 'w-0 left-1/2 group-hover:w-full group-hover:left-0')
                      }
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className={'md:hidden bg-primary ' + className}>
        <div className="container mx-auto px-4">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex items-center gap-2 py-3 text-black w-full"
          >
            <Menu className="w-4 h-4" />
            <span className="font-medium">Danh mục sản phẩm</span>
          </button>

          {/* Mobile Menu Items */}
          <div
            className={
              'overflow-hidden transition-all duration-300 ' +
              (isMobileMenuOpen ? 'max-h-96 pb-3' : 'max-h-0')
            }
          >
            {/* Categories */}
            <div className="py-2 border-b border-white/20">
              <p className="px-4 py-1 text-xs text-black/70 uppercase tracking-wide">Danh mục</p>
              <div className="grid grid-cols-2 gap-1">
                {CATEGORIES.slice(0, 6).map((cat) => (
                  <Link
                    key={cat.slug}
                    to={`/products?category=${cat.slug}`}
                    className="block px-4 py-2 text-black hover:text-orange-200 text-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Nav Links */}
            <div className="py-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="block px-4 py-2 text-black hover:text-orange-200 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

export default NavMenu;
