import { ChevronDown, Menu } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { fetchCategoriesWithChildren } from '../../../store';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';

interface NavMenuProps {
  className?: string;
}

export function NavMenu({ className = '' }: NavMenuProps) {
  const dispatch = useAppDispatch();
  const { categoriesWithChildren } = useAppSelector((state) => state.categories);
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const hasFetched = useRef(false);

  // Fetch categories on mount only if not already loaded (prevent double-fetch in StrictMode)
  useEffect(() => {
    if (!hasFetched.current && categoriesWithChildren.length === 0) {
      hasFetched.current = true;
      dispatch(fetchCategoriesWithChildren());
    }
  }, [dispatch, categoriesWithChildren.length]);

  // Filter only parent categories (parentID is null)
  const parentCategories = categoriesWithChildren.filter((cat) => cat.parentID === null);

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
      <nav className={'relative bg-white hidden md:block ' + className}>
        <div className="container mx-auto py-2">
          <ul className="flex items-center h-11">
            {/* Danh mục Dropdown */}
            <li
              className="relative"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <button
                className={`flex items-center gap-2 px-4 h-11 text-sm cursor-pointer transition-colors duration-100 ${isDropdownOpen ? 'bg-primary text-white' : 'text-black hover:bg-primary hover:text-white'}`}
              >
                <Menu className="w-4 h-4" />
                <span className="font-medium">Danh mục</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* Dropdown Grid */}
              <div
                className={`absolute left-0 top-full w-150 bg-white shadow-xl transition-all duration-150 z-50 ${
                  isDropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}
              >
                <div className="container mx-auto">
                  <div className="grid grid-cols-4 gap-1 p-4">
                    {parentCategories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/products?category=${cat.slug}`}
                        className="block px-3 py-2 text-gray-700 hover:bg-primary hover:text-white transition-colors duration-100 rounded text-sm"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
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
          <button onClick={() => {}} className="flex items-center gap-2 py-3 text-black w-full">
            <Menu className="w-4 h-4" />
            <span className="font-medium">Danh mục sản phẩm</span>
          </button>
        </div>
      </nav>
    </>
  );
}

export default NavMenu;
