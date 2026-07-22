import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { axiosClient } from '../../api';
import { usePageTitle } from '../../hooks';
import { ResetPasswordForm } from '../../components/auth/ResetPasswordForm';
import { AuthLayout } from '../../components/layout/AuthLayout';

export default function ResetPasswordPage() {
  usePageTitle('Đặt lại mật khẩu');

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Lấy token từ URL query param
  const token = searchParams.get('token');

  // Nếu không có token, redirect về forgot password
  useEffect(() => {
    if (!token) {
      navigate('/forgot-password');
    }
  }, [token, navigate]);

  const handleSubmit = async (password: string) => {
    if (!token) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axiosClient.post('/auth/reset-password', {
        token,
        password,
      });
      if (response.data.errors && response.data.errors.length > 0) {
        setError(response.data.errors[0]);
      } else {
        setSuccess('Đặt lại mật khẩu thành công!');
        // Redirect về login sau 2 giây
        window.setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(
        e.response?.data?.message || 'Không thể đặt lại mật khẩu. Liên kết có thể đã hết hạn.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return null;
  }

  return (
    <AuthLayout title="Đặt lại mật khẩu">
      <ResetPasswordForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
        success={success}
      />
    </AuthLayout>
  );
}
