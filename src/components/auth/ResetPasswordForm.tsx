import { useState, type FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ResetPasswordFormProps {
  onSubmit?: (password: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  success?: string | null;
}

export function ResetPasswordForm({
  onSubmit,
  isLoading = false,
  error,
  success,
}: ResetPasswordFormProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return;
    }
    if (onSubmit) {
      await onSubmit(password);
    }
  };

  const isPasswordValid = password.length >= 8 && password === confirmPassword;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-gray-600 mb-4">Nhập mật khẩu mới cho tài khoản của bạn.</p>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu mới (ít nhất 8 ký tự)"
            className="w-full h-11 px-3 pr-10 border border-gray-300 rounded text-sm
                       focus:outline-none focus:border-gray-500 focus:ring-0 focus:shadow-none transition-colors
                       autofill:shadow-[inset_0_0_0px_1000px_white]
                       [-webkit-autofill:shadow-[inset_0_0_0px_1000px_white]]"
            required
            minLength={8}
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
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Xác nhận mật khẩu mới
        </label>
        <input
          type={showPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Nhập lại mật khẩu mới"
          className="w-full h-11 px-3 border border-gray-300 rounded text-sm
                     focus:outline-none focus:border-gray-500 focus:ring-0 focus:shadow-none transition-colors
                     autofill:shadow-[inset_0_0_0px_1000px_white]
                     [-webkit-autofill:shadow-[inset_0_0_0px_1000px_white]]"
          required
          minLength={8}
          disabled={isLoading}
        />
        {confirmPassword && password !== confirmPassword && (
          <p className="text-xs text-red-500 mt-1">Mật khẩu không khớp</p>
        )}
      </div>

      {/* Error message */}
      {error && <div className="text-sm text-red-500 px-3 py">{error}</div>}

      {/* Success message */}
      {success && <div className="text-sm text-green-600 px-3 py">{success}</div>}

      {/* Submit */}
      <button
        type="submit"
        className="w-full h-11 bg-primary hover:bg-orange-600 text-white font-semibold
                   uppercase rounded transition-colors duration-200 text-sm
                   disabled:bg-orange-400 disabled:cursor-not-allowed cursor-pointer
                   flex items-center justify-center gap-2"
        disabled={!isPasswordValid || isLoading}
      >
        {isLoading && (
          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        )}
        {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
      </button>

      {/* Back to login */}
      <div className="pt-4 text-center text-sm text-gray-600">
        <Link to="/login" className="text-primary font-medium hover:underline">
          Quay lại đăng nhập
        </Link>
      </div>
    </form>
  );
}

export default ResetPasswordForm;
