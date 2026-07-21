import { Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface LoginFormProps {
  onSubmit?: (email: string, password: string, remember: boolean) => void;
  error?: string | null;
  isLoading?: boolean;
}

export function LoginForm({ onSubmit, error, isLoading = false }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(email, password, remember);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email */}
      <div>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email/Số điện thoại/Tên đăng nhập"
          className="w-full h-11 px-3 border border-gray-300 rounded text-sm
                     focus:outline-none focus:border-gray-500 focus:ring-0
                     focus:shadow-none transition-colors
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
                     focus:outline-none focus:border-gray-500 focus:ring-0
                     focus:shadow-none transition-colors
                     autofill:shadow-[inset_0_0_0px_1000px_white]
                     [-webkit-autofill:shadow-[inset_0_0_0px_1000px_white]]"
          required
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary"
          aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
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
        disabled={!email || !password || isLoading}
      >
        {isLoading && (
          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        )}
        {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
      </button>

      {/* Remember & Forgot */}
      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="w-4 h-4 accent-primary cursor-pointer"
            disabled={isLoading}
          />
          <span className="text-gray-700">Duy trì đăng nhập</span>
        </label>
        <Link to="/forgot-password" className="text-primary hover:underline">
          Quên mật khẩu?
        </Link>
      </div>

      {/* Register link */}
      <div className="pt-6 text-center text-sm text-gray-600">
        Bạn mới biết đến VTDhub?{' '}
        <Link to="/register" className="text-primary font-medium hover:underline">
          Đăng ký
        </Link>
      </div>
    </form>
  );
}

export default LoginForm;
