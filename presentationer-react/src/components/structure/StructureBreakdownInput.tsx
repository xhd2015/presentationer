import React from 'react';
import type { StructureItem } from './StructureBreakdownPreview';

interface StructureBreakdownInputProps {
    items: StructureItem[];
    onChange: (items: StructureItem[]) => void;
}

export const StructureBreakdownInput: React.FC<StructureBreakdownInputProps> = ({ items, onChange }) => {
    const handleAdd = () => {
        onChange([...items, { title: 'New Item', description: '', content: '', color: 'blue' }]);
    };

    const handleDelete = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        onChange(newItems);
    };

    const handleChange = (index: number, field: keyof StructureItem, value: string) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        onChange(newItems);
    };

    return (
        <div>
            {items.map((item, index) => (
                <div key={index} style={{
                    marginBottom: '15px',
                    padding: '10px',
                    border: '1px solid #eee',
                    borderRadius: '4px',
                    backgroundColor: '#fcfcfc'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 'bold', color: '#555' }}>Item {index + 1}</span>
                        <button
                            onClick={() => handleDelete(index)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'red',
                                cursor: 'pointer',
                                fontSize: '0.9em'
                            }}
                        >
                            Remove
                        </button>
                    </div>

                    <div style={{ marginBottom: '8px' }}>
                        <label style={{ display: 'block', fontSize: '0.8em', color: '#666', marginBottom: '2px' }}>Title</label>
                        <input
                            type="text"
                            value={item.title}
                            onChange={(e) => handleChange(index, 'title', e.target.value)}
                            style={{ width: '100%', padding: '4px', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ marginBottom: '8px', display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.8em', color: '#666', marginBottom: '2px' }}>Color</label>
                            <select
                                value={item.color || 'blue'}
                                onChange={(e) => handleChange(index, 'color', e.target.value)}
                                style={{ width: '100%', padding: '4px', boxSizing: 'border-box' }}
                            >
                                <option value="blue">Blue</option>
                                <option value="green">Green</option>
                                <option value="purple">Purple</option>
                                <option value="red">Red</option>
                                <option value="yellow">Yellow</option>
                                <option value="orange">Orange</option>
                                <option value="gray">Gray</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ marginBottom: '8px' }}>
                        <label style={{ display: 'block', fontSize: '0.8em', color: '#666', marginBottom: '2px' }}>Description</label>
                        <textarea
                            value={item.description || ''}
                            onChange={(e) => handleChange(index, 'description', e.target.value)}
                            style={{ width: '100%', padding: '4px', boxSizing: 'border-box', minHeight: '40px', resize: 'vertical' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8em', color: '#666', marginBottom: '2px' }}>Content / Code</label>
                        <textarea
                            value={item.content || ''}
                            onChange={(e) => handleChange(index, 'content', e.target.value)}
                            style={{ width: '100%', padding: '4px', boxSizing: 'border-box', minHeight: '60px', fontFamily: 'monospace', resize: 'vertical' }}
                        />
                    </div>
                </div>
            ))}
            <button
                onClick={handleAdd}
                style={{
                    width: '100%',
                    padding: '8px',
                    backgroundColor: '#f0f0f0',
                    border: '1px dashed #ccc',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    color: '#555'
                }}
            >
                + Add Item
            </button>
        </div>
    );
};

