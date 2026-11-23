import { useCallback, useEffect, useState } from 'react';
import type { ApiState } from '../types';

export function useApi<T>(fetcher: () => Promise<T>): ApiState<T> {
    const [version, setVersion] = useState(0);
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const reload = useCallback(() => {
        setVersion((current) => current + 1);
    }, []);

    useEffect(() => {
        let active = true;

        setLoading(true);
        setError(null);

        fetcher()
            .then((result) => {
                if (!active) {
                    return;
                }

                setData(result);
                setLoading(false);
            })
            .catch((reason: unknown) => {
                if (!active) {
                    return;
                }

                const message = reason instanceof Error && reason.message.trim() !== ''
                    ? reason.message
                    : 'Data tidak dapat dimuat. Silakan coba lagi.';

                setError(message);
                setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [fetcher, version]);

    return { data, loading, error, reload };
}
