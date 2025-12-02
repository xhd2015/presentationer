import React from 'react';
import { useParams } from 'react-router-dom';
import { useSessionDetailContext } from '../../context/SessionDetailContext';
import { PageEditor } from './PageEditor';

export const PageDetail: React.FC = () => {
    const { pages, updatePageContent, sessionName } = useSessionDetailContext();
    const { pageTitle } = useParams();

    const decodedPageTitle = pageTitle ? decodeURIComponent(pageTitle) : undefined;
    const selectedPage = pages.find(p => p.title === decodedPageTitle);

    if (!selectedPage) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#888' }}>
                Page not found
            </div>
        );
    }

    return (
        <PageEditor
            key={selectedPage.id}
            sessionName={sessionName}
            page={selectedPage}
            onPageUpdate={updatePageContent}
        />
    );
};
