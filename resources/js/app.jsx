import { useEffect, useState } from 'react';
import Header from './components/Header.jsx';
import Dashboard from './components/Dashboard.jsx';
import StudentTable from './components/StudentTable.jsx';

export default function App({ siswa, initialPage }) {
    const [page, setPage] = useState(initialPage);

    useEffect(() => {
        const onPopState = () => {
            setPage(window.location.pathname === '/data-siswa' ? 'data-siswa' : 'dashboard');
        };

        window.addEventListener('popstate', onPopState);

        return () => window.removeEventListener('popstate', onPopState);
    }, []);

    const navigate = (next, path) => {
        setPage(next);
        window.history.pushState({}, '', path);
    };

    return (
        <>
            <Header page={page} onNavigate={navigate} />
            <main className="wrap main">
                {page === 'dashboard' ? (
                    <Dashboard siswa={siswa} />
                ) : (
                    <StudentTable siswa={siswa} />
                )}
            </main>
        </>
    );
}
