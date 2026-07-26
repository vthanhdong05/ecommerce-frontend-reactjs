import { Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface RegisterFormProps {
  onSubmit?: (data: RegisterData) => void;
  error?: string | null;
  isLoading?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  fullAddress: string;
  phone?: string;
  agree: boolean;
}

export function RegisterForm({ onSubmit, error, isLoading = false }: RegisterFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({ email, password, confirmPassword, firstName, fullAddress, phone, agree });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email */}
      <div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
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
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
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
          value={fullAddress}
          onChange={(e) => setFullAddress(e.target.value)}
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
        disabled={
          !email ||
          !password ||
          !confirmPassword ||
          !firstName ||
          !fullAddress ||
          !agree ||
          isLoading
        }
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
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
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
  );
}

export default RegisterForm;
