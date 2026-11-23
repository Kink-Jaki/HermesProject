import { AuthProvider } from './context/AuthContext';
import AppRoutes from './pages/AppRoutes';
import { RouterProvider } from './router/RouterContext';

export default function App() {
    return (
        <AuthProvider>
            <RouterProvider>
                <AppRoutes />
            </RouterProvider>
        </AuthProvider>
    );
}
