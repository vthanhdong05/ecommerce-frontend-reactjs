import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes';
import { useAuthInit } from './hooks/useAuthInit';
import { ToastProvider } from './hooks/ToastProvider';

function App() {
  // Khởi tạo auth state từ localStorage khi app load
  useAuthInit();

  return (
    <BrowserRouter>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
