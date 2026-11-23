import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from '../../router/RouterContext';
import FullPageLoader from '../ui/FullPageLoader';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
    const { status } = useAuth();
    const { navigate, pathname, search } = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            navigate('/login', {
                replace: true,
                state: { from: `${pathname}${search}` },
            });
        }
    }, [status, navigate, pathname, search]);

    if (status === 'loading') {
        return <FullPageLoader />;
    }

    if (status !== 'authenticated') {
        return null;
    }

    return <>{children}</>;
}
