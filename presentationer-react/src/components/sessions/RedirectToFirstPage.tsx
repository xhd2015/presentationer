import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionDetailContext } from '../../context/SessionDetailContext';

export const RedirectToFirstPage: React.FC = () => {
    const { pages, loading, sessionName } = useSessionDetailContext();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && pages.length > 0) {
            navigate(`/sessions/${sessionName}/pages/${encodeURIComponent(pages[0].title)}`, { replace: true });
        }
    }, [loading, pages, sessionName, navigate]);

    if (loading) return <div style={{ padding: '20px', color: '#888' }}>Loading session...</div>;
    if (pages.length === 0) return <div style={{ padding: '20px', color: '#888' }}>No pages in this session. Create one to start.</div>;
    return null;
};

