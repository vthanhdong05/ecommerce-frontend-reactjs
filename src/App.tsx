import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes';
import { useAuthInit } from './hooks/useAuthInit';

function App() {
  // Khởi tạo auth state từ localStorage khi app load
  useAuthInit();

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
