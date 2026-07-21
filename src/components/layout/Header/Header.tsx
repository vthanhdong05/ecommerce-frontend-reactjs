import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { CartBadge } from './CartBadge';
import { Logo } from './Logo';
import { NavMenu } from './NavMenu';
import { SearchBar } from './SearchBar';
import { TopBar } from './TopBar';
import { UserMenu } from './UserMenu';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      {/* Top Bar */}
      <TopBar />

      {/* Main Header: Logo, Search, User, Cart */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14 gap-4">
            {/* Logo */}
            <Logo className="h-10 shrink-0" />

            {/* Search Bar - Desktop */}
            <div className="hidden md:block flex-1 max-w-xl">
              <SearchBar />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3 md:gap-4">
              <UserMenu />
              <CartBadge />

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-700 hover:text-primary transition-colors"
                aria-label="Menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Search Bar - Mobile */}
          <div className="md:hidden pb-3">
            <SearchBar />
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <NavMenu />
    </header>
  );
}

export default Header;
