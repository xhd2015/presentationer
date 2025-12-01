import React, { useState, useEffect } from 'react';
import { FiCheck, FiX } from 'react-icons/fi';
import { type ChartDataItem } from './types';
import { ColorPicker } from '../common/ColorPicker';

interface ChartDataItemFormProps {
    initialData: ChartDataItem;
    onSave: (item: ChartDataItem) => void;
    onCancel: () => void;
    isNew: boolean;
}

export const ChartDataItemForm: React.FC<ChartDataItemFormProps> = ({ initialData, onSave, onCancel, isNew }) => {
    const [editForm, setEditForm] = useState<ChartDataItem>(initialData);

    useEffect(() => {
        setEditForm(initialData);
    }, [initialData]);

    const handleSave = () => {
        onSave({
            ...editForm,
            value: Number(editForm.value)
        });
    };

    return (
        <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fafafa' }}>
            <h4 style={{ marginTop: 0 }}>{isNew ? 'Add Data Item' : 'Edit Data Item'}</h4>
            <div style={{ display: 'grid', gap: '10px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em' }}>Name (Label)</label>
                    <input
                        type="text"
                        value={editForm.name}
                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                        style={{ width: '100%', padding: '5px' }}
                        placeholder="e.g. Category A"
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em' }}>Value</label>
                    <input
                        type="number"
                        value={editForm.value}
                        onChange={e => setEditForm({ ...editForm, value: Number(e.target.value) })}
                        style={{ width: '100%', padding: '5px' }}
                        placeholder="0"
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em' }}>Color</label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <ColorPicker
                            color={editForm.color || '#000000'}
                            onChange={c => setEditForm({ ...editForm, color: c })}
                        />
                        <span style={{ fontFamily: 'monospace' }}>{editForm.color}</span>
                    </div>
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

