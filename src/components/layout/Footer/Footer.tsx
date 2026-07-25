import { Link } from 'react-router-dom';
import { FooterContact } from './FooterContact';
import { FooterLinks } from './FooterLinks';
import { FooterNewsletter } from './FooterNewsletter';

interface FooterProps {
  className?: string;
}

export function Footer({ className = '' }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`bg-gray-200 text-gray-700 ${className}`}>
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Contact Info */}
          <FooterContact />

          {/* Column 2-4: Links & Newsletter */}
          <div className="lg:col-span-3">
            <FooterLinks className="mb-8" />
            <hr className="border-gray-300 mb-8" />
            <FooterNewsletter />
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-300">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-gray-500">
            <p>© {currentYear} ShopHub. Tất cả quyền được bảo lưu.</p>
            <div className="flex items-center gap-4">
              <Link to="/privacy" className="hover:text-gray-900 transition-colors">
                Chính sách bảo mật
              </Link>
              <Link to="/terms" className="hover:text-gray-900 transition-colors">
                Điều khoản sử dụng
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
