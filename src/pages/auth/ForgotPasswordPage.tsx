import { useState } from 'react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { ForgotPasswordForm } from '../../components/auth/ForgotPasswordForm';
import { axiosClient } from '../../api';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmitEmail = async (data: { email: string; redirectTo: string }) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axiosClient.post('/auth/forgot-password', data);
      if (response.data.errors && response.data.errors.length > 0) {
        setError(response.data.errors[0]);
      } else {
        setSuccess(
          'Đã gửi liên kết đặt lại mật khẩu đến email của bạn. Vui lòng kiểm tra hộp thư.'
        );
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Không thể gửi email. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Quên mật khẩu">
      <ForgotPasswordForm
        onSubmitEmail={handleSubmitEmail}
        isLoading={isLoading}
        error={error}
        success={success}
      />
    </AuthLayout>
  );
}
