import { Eye, EyeOff } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { useAuth } from '../../hooks/useAuth';
import { usePageTitle } from '../../hooks';

const STORAGE_KEY = 'login_form_data';

interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

const defaultFormData: LoginFormData = {
  email: '',
  password: '',
  remember: false,
};

const loadFormData = (): LoginFormData => {
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

export default function LoginPage() {
  usePageTitle('Đăng nhập');

  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth();

  // State được lift lên và lưu vào sessionStorage để preserve qua remount
  const [formData, setFormData] = useState<LoginFormData>(loadFormData);
  const [showPassword, setShowPassword] = useState(false);

  // Lưu formData vào sessionStorage mỗi khi thay đổi
  useEffect(() => {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  // Redirect nếu đã đăng nhập
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Clear error khi unmount
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password).unwrap();
      // Clear sessionStorage khi đăng nhập thành công
      window.sessionStorage.removeItem(STORAGE_KEY);
      navigate('/');
    } catch {
      // Error được handle bởi Redux - formData vẫn được preserve
    }
  };

  return (
    <AuthLayout title="Đăng nhập">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <input
            type="text"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary cursor-pointer"
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
          disabled={!formData.email || !formData.password || isLoading}
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
              checked={formData.remember}
              onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
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
    </AuthLayout>
  );
}
