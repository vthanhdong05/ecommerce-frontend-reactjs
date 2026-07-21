import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

interface ForgotPasswordFormProps {
  onSubmitEmail?: (data: { email: string; redirectTo: string }) => Promise<void>;
  onSubmitReset?: (password: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  success?: string | null;
  isResetMode?: boolean;
}

export function ForgotPasswordForm({
  onSubmitEmail,
  isLoading = false,
  error,
  success,
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (onSubmitEmail) {
      // redirectTo sẽ là URL của trang reset password
      const redirectTo = `${window.location.origin}/reset-password`;
      await onSubmitEmail({ email, redirectTo });
    }
  };

  const isEmailValid = email.includes('@');

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-gray-600 mb-4">
        Nhập địa chỉ email của bạn. Chúng tôi sẽ gửi cho bạn một liên kết để đặt lại mật khẩu.
      </p>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Nhập email của bạn"
          className="w-full h-11 px-3 border border-gray-300 rounded text-sm
                     focus:outline-none focus:border-gray-500 focus:ring-0 focus:shadow-none transition-colors
                     autofill:shadow-[inset_0_0_0px_1000px_white]
                     [-webkit-autofill:shadow-[inset_0_0_0px_1000px_white]]"
          required
          disabled={isLoading}
        />
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
        disabled={!isEmailValid || isLoading}
      >
        {isLoading && (
          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        )}
        {isLoading ? 'Đang gửi...' : 'Gửi liên kết'}
      </button>

      {/* Back to login */}
      <div className="pt-4 text-center text-sm text-gray-600">
        Nhớ mật khẩu?{' '}
        <Link to="/login" className="text-primary font-medium hover:underline">
          Đăng nhập
        </Link>
      </div>
    </form>
  );
}

export default ForgotPasswordForm;
