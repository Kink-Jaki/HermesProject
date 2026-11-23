import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import { isRecord } from '../lib/guards';
import type { NavigateOptions, RouterState } from '../types';

interface RouterContextValue extends RouterState {
    navigate: (to: string, options?: NavigateOptions) => void;
}

interface LinkProps {
    to: string;
    children: ReactNode;
    className?: string;
    title?: string;
    replace?: boolean;
    state?: Record<string, unknown>;
    onClick?: () => void;
}

const RouterContext = createContext<RouterContextValue | null>(null);

function normalizePath(path: string): string {
    const withSlash = path.startsWith('/') ? path : `/${path}`;
    const withoutTrailing = withSlash.replace(/\/+$/, '');

    return withoutTrailing === '' ? '/' : withoutTrailing;
}

function readLocation(): RouterState {
    const state = isRecord(window.history.state) ? window.history.state : {};

    return {
        pathname: normalizePath(window.location.pathname),
        search: window.location.search,
        state,
    };
}

export function matchPath(pattern: string, pathname: string): Record<string, string> | null {
    const patternParts = normalizePath(pattern).split('/').filter(Boolean);
    const pathParts = normalizePath(pathname).split('/').filter(Boolean);

    if (patternParts.length !== pathParts.length) {
        return null;
    }

    const params: Record<string, string> = {};

    for (let index = 0; index < patternParts.length; index += 1) {
        const patternPart = patternParts[index];
        const pathPart = pathParts[index];

        if (patternPart.startsWith(':')) {
            try {
                params[patternPart.slice(1)] = decodeURIComponent(pathPart);
            } catch {
                params[patternPart.slice(1)] = pathPart;
            }
            continue;
        }

        if (patternPart !== pathPart) {
            return null;
        }
    }

    return params;
}

export function RouterProvider({ children }: { children: ReactNode }) {
    const [location, setLocation] = useState<RouterState>(readLocation);

    useEffect(() => {
        const handlePopState = () => setLocation(readLocation());

        window.addEventListener('popstate', handlePopState);

        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const navigate = useCallback((to: string, options: NavigateOptions = {}) => {
        const [pathPart, queryPart] = to.split('?');
        const url = `${normalizePath(pathPart)}${queryPart ? `?${queryPart}` : ''}`;
        const state = options.state ?? {};

        if (options.replace) {
            window.history.replaceState(state, '', url);
        } else {
            window.history.pushState(state, '', url);
        }

        setLocation(readLocation());
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, []);

    const value = useMemo<RouterContextValue>(
        () => ({ ...location, navigate }),
        [location, navigate],
    );

    return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter(): RouterContextValue {
    const context = useContext(RouterContext);

    if (!context) {
        throw new Error('useRouter harus dipakai di dalam RouterProvider.');
    }

    return context;
}

export function Link({ to, children, className, title, replace, state, onClick }: LinkProps) {
    const { navigate } = useRouter();

    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
            return;
        }

        event.preventDefault();
        onClick?.();
        navigate(to, { replace, state });
    };

    return (
        <a href={to} className={className} title={title} onClick={handleClick}>
            {children}
        </a>
    );
}
