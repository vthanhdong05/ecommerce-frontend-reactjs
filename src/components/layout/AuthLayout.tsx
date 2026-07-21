import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  error?: string | null;
  isLoading?: boolean;
}

export function AuthLayout({ children, title, subtitle, error, isLoading }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-primary flex">
      {/* Left side - Brand */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 bg-primary items-center justify-center p-8">
        <div className="text-center text-white max-w-md">
          <Link to="/" className="inline-flex items-center gap-3 mb-8">
            <img src={logo} alt="VTDhub" className="h-16 w-auto object-contain" />
            <span className="font-bold text-4xl">VTDhub</span>
          </Link>
          <p className="text-xl lg:text-2xl leading-relaxed">
            Nền tảng thương mại điện tử
            <br />
            <span className="text-white/90">yêu thích của bạn</span>
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <Link to="/" className="lg:hidden flex items-center justify-center gap-2 mb-6">
            <img src={logo} alt="VTDhub" className="h-10 w-auto object-contain" />
            <span className="font-bold text-2xl text-primary">VTDhub</span>
          </Link>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Loading overlay */}
          {isLoading && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-600 flex items-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              Đang xử lý...
            </div>
          )}

          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            {subtitle && <p className="mt-2 text-sm text-gray-500">{subtitle}</p>}
          </div>

          {children}

          {/* Footer link */}
          <div className="mt-8 text-center text-sm text-gray-600">
            <p>
              Bằng việc {title.toLowerCase()}, bạn đồng ý với{' '}
              <Link to="/terms" className="text-primary hover:underline">
                Điều khoản
              </Link>{' '}
              &{' '}
              <Link to="/privacy" className="text-primary hover:underline">
                Chính sách bảo mật
              </Link>{' '}
              của VTDhub
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
