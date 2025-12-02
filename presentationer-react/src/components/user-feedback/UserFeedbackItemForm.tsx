import React, { useState, useEffect } from 'react';
import { FiCheck, FiX } from 'react-icons/fi';
import type { UserFeedbackItem } from './types';

interface UserFeedbackItemFormProps {
    initialData: UserFeedbackItem;
    onSave: (item: UserFeedbackItem) => void;
    onCancel: () => void;
    isNew: boolean;
}

export const UserFeedbackItemForm: React.FC<UserFeedbackItemFormProps> = ({
    initialData,
    onSave,
    onCancel,
    isNew
}) => {
    const [form, setForm] = useState<UserFeedbackItem>(initialData);

    useEffect(() => {
        setForm(initialData);
    }, [initialData]);

    const handleSave = () => {
        onSave(form);
    };

    return (
        <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fafafa' }}>
            <h4 style={{ marginTop: 0 }}>{isNew ? 'Add Feedback' : 'Edit Feedback'}</h4>
            <div style={{ display: 'grid', gap: '10px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em' }}>Quote</label>
                    <textarea
                        value={form.quote}
                        onChange={e => setForm({ ...form, quote: e.target.value })}
                        style={{ width: '100%', minHeight: '80px', padding: '5px' }}
                        autoFocus
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em' }}>Author</label>
                    <input
                        type="text"
                        value={form.author}
                        onChange={e => setForm({ ...form, author: e.target.value })}
                        style={{ width: '100%', padding: '5px' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button onClick={handleSave} style={{ flex: 1, padding: '8px', backgroundColor: '#646cff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
                        <FiCheck /> Save
                    </button>
                    <button onClick={onCancel} style={{ flex: 1, padding: '8px', backgroundColor: '#ccc', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
                        <FiX /> Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

