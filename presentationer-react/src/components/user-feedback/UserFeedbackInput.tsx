import React, { useState } from 'react';
import type { UserFeedbackItem } from './types';
import { UserFeedbackItemForm } from './UserFeedbackItemForm';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';

interface UserFeedbackInputProps {
    items: UserFeedbackItem[];
    onChange: (items: UserFeedbackItem[]) => void;
}

export const UserFeedbackInput: React.FC<UserFeedbackInputProps> = ({ items, onChange }) => {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [tempItem, setTempItem] = useState<UserFeedbackItem>({ quote: '', author: '' });

    const handleAdd = () => {
        setEditingIndex(-1);
        setTempItem({ quote: '', author: '' });
    };

    const handleEdit = (index: number) => {
        setEditingIndex(index);
        setTempItem({ ...items[index] });
    };

    const handleDelete = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        onChange(newItems);
        if (editingIndex === index) {
            setEditingIndex(null);
        }
    };

    const handleSave = (item: UserFeedbackItem) => {
        const newItems = [...items];
        if (editingIndex === -1) {
            newItems.push(item);
        } else if (editingIndex !== null) {
            newItems[editingIndex] = item;
        }
        onChange(newItems);
        setEditingIndex(null);
    };

    const handleCancel = () => {
        setEditingIndex(null);
    };

    if (editingIndex !== null) {
        return (
            <UserFeedbackItemForm
                initialData={tempItem}
                onSave={handleSave}
                onCancel={handleCancel}
                isNew={editingIndex === -1}
            />
        );
    }

    return (
        <div>
            {items.map((item, index) => (
                <div key={index} style={{ border: '1px solid #eee', padding: '10px', marginBottom: '10px', borderRadius: '4px', background: '#fff', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <div style={{ fontStyle: 'italic', color: '#555' }}>"{item.quote}"</div>
                    <div style={{ fontSize: '0.8em', color: '#888', textAlign: 'right' }}>— {item.author}</div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '5px', justifyContent: 'flex-end' }}>
                        <button onClick={() => handleEdit(index)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#646cff', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FiEdit2 /> Edit
                        </button>
                        <button onClick={() => handleDelete(index)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff4d4f', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FiTrash2 /> Delete
                        </button>
                    </div>
                </div>
            ))}
            <button onClick={handleAdd} style={{ width: '100%', padding: '10px', backgroundColor: '#f0f0f0', border: '1px dashed #ccc', borderRadius: '4px', cursor: 'pointer', color: '#666', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
                <FiPlus /> Add Feedback
            </button>
        </div>
    );
};

