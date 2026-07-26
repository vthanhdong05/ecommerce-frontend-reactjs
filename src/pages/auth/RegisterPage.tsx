import { Eye, EyeOff } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { useAuth } from '../../hooks/useAuth';
import { usePageTitle } from '../../hooks';

interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  fullAddress: string;
  phone: string;
  agree: boolean;
}

const STORAGE_KEY = 'register_form_data';

const defaultFormData: RegisterData = {
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  fullAddress: '',
  phone: '',
  agree: false,
};

// Load từ sessionStorage để giữ data khi remount
const loadFormData = (): RegisterData => {
  try {
    const saved = window.sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...defaultFormData, ...JSON.parse(saved) };
    }
  } catch {
    // ignore
  }
  return defaultFormData;
};

export default function RegisterPage() {
  usePageTitle('Đăng ký');

  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuth();

  // State được lift lên và lưu vào sessionStorage để preserve qua remount
  const [formData, setFormData] = useState<RegisterData>(loadFormData);
  const [showPassword, setShowPassword] = useState(false);

  // Lưu formData vào sessionStorage mỗi khi thay đổi
  useEffect(() => {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  // Clear error khi unmount
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const handleChange = (field: keyof RegisterData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      return;
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        fullAddress: formData.fullAddress,
        phone: formData.phone || undefined,
      }).unwrap();
      // Clear sessionStorage khi đăng ký thành công
      window.sessionStorage.removeItem(STORAGE_KEY);
      navigate('/login');
    } catch {
      // Error được handle bởi Redux - formData vẫn được preserve
    }
  };

  const isFormValid =
    formData.email &&
    formData.password &&
    formData.confirmPassword &&
    formData.firstName &&
    formData.fullAddress &&
    formData.agree;

  return (
    <AuthLayout title="Đăng ký" subtitle="Tạo tài khoản VTDhub để bắt đầu mua sắm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="Email"
            className="w-full h-11 px-3 border border-gray-300 rounded text-sm
                       focus:outline-none focus:border-gray-500 focus:ring-0 focus:shadow-none transition-colors
                       autofill:shadow-[inset_0_0_0px_1000px_white]
                       [-webkit-autofill:shadow-[inset_0_0_0px_1000px_white]]"
            required
            disabled={isLoading}
          />
        </div>

        {/* First Name */}
        <div>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            placeholder="Họ và tên"
            className="w-full h-11 px-3 border border-gray-300 rounded text-sm
                       focus:outline-none focus:border-gray-500 focus:ring-0 focus:shadow-none transition-colors
                       autofill:shadow-[inset_0_0_0px_1000px_white]
                       [-webkit-autofill:shadow-[inset_0_0_0px_1000px_white]]"
            required
            disabled={isLoading}
          />
        </div>

        {/* Phone (optional) */}
        <div>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="Số điện thoại (không bắt buộc)"
            className="w-full h-11 px-3 border border-gray-300 rounded text-sm
                       focus:outline-none focus:border-gray-500 focus:ring-0 focus:shadow-none transition-colors
                       autofill:shadow-[inset_0_0_0px_1000px_white]
                       [-webkit-autofill:shadow-[inset_0_0_0px_1000px_white]]"
            disabled={isLoading}
          />
        </div>

        {/* Full Address */}
        <div>
          <input
            type="text"
            value={formData.fullAddress}
            onChange={(e) => handleChange('fullAddress', e.target.value)}
            placeholder="Địa chỉ đầy đủ"
            className="w-full h-11 px-3 border border-gray-300 rounded text-sm
                       focus:outline-none focus:border-gray-500 focus:ring-0 focus:shadow-none transition-colors
                       autofill:shadow-[inset_0_0_0px_1000px_white]
                       [-webkit-autofill:shadow-[inset_0_0_0px_1000px_white]]"
            required
            disabled={isLoading}
          />
        </div>

        {/* Password */}
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            placeholder="Mật khẩu"
            className="w-full h-11 px-3 pr-10 border border-gray-300 rounded text-sm
                       focus:outline-none focus:border-gray-500 focus:ring-0 focus:shadow-none transition-colors
                       autofill:shadow-[inset_0_0_0px_1000px_white]
                       [-webkit-autofill:shadow-[inset_0_0_0px_1000px_white]]"
            required
            minLength={6}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary cursor-pointer"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {/* Confirm Password */}
        <div>
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            placeholder="Nhập lại mật khẩu"
            className="w-full h-11 px-3 border border-gray-300 rounded text-sm
                       focus:outline-none focus:border-gray-500 focus:ring-0 focus:shadow-none transition-colors
                       autofill:shadow-[inset_0_0_0px_1000px_white]
                       [-webkit-autofill:shadow-[inset_0_0_0px_1000px_white]]"
            required
            minLength={6}
            disabled={isLoading}
          />
        </div>

        {/* Error message */}
        {error && <div className="text-sm text-red-500 px-3 py">{error}</div>}

        {/* Submit */}
        <button
          type="submit"
          className="w-full h-11 bg-primary hover:bg-orange-600 text-white font-semibold
                     uppercase rounded transition-colors duration-200 text-sm
                     disabled:bg-orange-400 disabled:cursor-not-allowed cursor-pointer
                     flex items-center justify-center gap-2"
          disabled={!isFormValid || isLoading}
        >
          {isLoading && (
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
        </button>

        {/* Terms */}
        <label className="flex items-start gap-2 cursor-pointer text-sm pt-2">
          <input
            type="checkbox"
            checked={formData.agree}
            onChange={(e) => handleChange('agree', e.target.checked)}
            className="w-4 h-4 mt-0.5 accent-primary cursor-pointer"
            disabled={isLoading}
          />
          <span className="text-gray-600">
            Tôi đồng ý với{' '}
            <Link to="/terms" className="text-primary hover:underline">
              Điều khoản dịch vụ
            </Link>{' '}
            &{' '}
            <Link to="/privacy" className="text-primary hover:underline">
              Chính sách bảo mật
            </Link>{' '}
            của VTDhub
          </span>
        </label>

        {/* Login link */}
        <div className="pt-6 text-center text-sm text-gray-600">
          Bạn đã có tài khoản?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Đăng nhập
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
