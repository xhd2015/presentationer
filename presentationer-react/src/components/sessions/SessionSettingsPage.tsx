import React from 'react';
import { useParams } from 'react-router-dom';
import { SessionSettings } from './SessionSettings';

export const SessionSettingsPage: React.FC = () => {
    const { sessionName } = useParams();
    return sessionName ? <SessionSettings sessionName={sessionName} /> : null;
};

