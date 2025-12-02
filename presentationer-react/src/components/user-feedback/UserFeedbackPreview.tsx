import React from 'react';
import type { UserFeedbackItem } from './types';

interface UserFeedbackPreviewProps {
    items: UserFeedbackItem[];
    fontSizeMultiplier?: number;
}

export const UserFeedbackPreview: React.FC<UserFeedbackPreviewProps> = ({ items, fontSizeMultiplier = 1 }) => {
    return (
        <div style={{ width: '100%', margin: '0 auto', fontFamily: 'sans-serif', boxSizing: 'border-box', fontSize: `${fontSizeMultiplier}em` }}>
            {items.map((item, idx) => (
                <div key={idx} style={{}}>
                    <blockquote style={{
                        borderLeft: '1px solid #3ab9d5',
                        paddingLeft: '1em',
                        color: '#555',
                        fontSize: '1.1em',
                        // fontStyle: 'italic',
                        borderRadius: '0.25em',
                        margin: '0 0 0 0',
                        backgroundColor: '#f5f5f5',
                        padding: '0.5em'
                    }}>
                        <p style={{ margin: 0 }}>"{item.quote}"</p>
                        <div className="text-right text-sm opacity-70 mt-2" style={{
                            textAlign: 'right',
                            fontSize: '0.875em',
                            opacity: 0.7,
                            marginTop: '0.5em',
                            fontStyle: 'normal',
                            color: '#666',
                            lineHeight: '1.25em'
                        }}>
                            — {item.author}
                        </div>
                    </blockquote>
                    {idx < items.length - 1 && <br />}
                </div>
            ))}
        </div>
    );
};
