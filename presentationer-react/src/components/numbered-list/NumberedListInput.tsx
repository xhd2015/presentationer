import type { NumberedItem } from './types';

interface NumberedListInputProps {
    items: NumberedItem[];
    onChange: (items: NumberedItem[]) => void;
}

export function NumberedListInput({ items, onChange }: NumberedListInputProps) {
    const handleAdd = () => {
        const nextNum = (items.length + 1).toString().padStart(2, '0');
        onChange([...items, { number: nextNum, title: 'New Item', description: 'Description', color: 'blue' }]);
    };

    const handleDelete = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        onChange(newItems);
    };

    const handleChange = (index: number, field: keyof NumberedItem, value: string) => {
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

                    <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.8em', color: '#666', marginBottom: '2px' }}>Number</label>
                            <input
                                type="text"
                                value={item.number}
                                onChange={(e) => handleChange(index, 'number', e.target.value)}
                                style={{ width: '100%', padding: '4px', boxSizing: 'border-box' }}
                            />
                        </div>
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
                        <label style={{ display: 'block', fontSize: '0.8em', color: '#666', marginBottom: '2px' }}>Title</label>
                        <input
                            type="text"
                            value={item.title}
                            onChange={(e) => handleChange(index, 'title', e.target.value)}
                            style={{ width: '100%', padding: '4px', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ marginBottom: '8px' }}>
                        <label style={{ display: 'block', fontSize: '0.8em', color: '#666', marginBottom: '2px' }}>Description</label>
                        <textarea
                            value={item.description}
                            onChange={(e) => handleChange(index, 'description', e.target.value)}
                            style={{ width: '100%', padding: '4px', boxSizing: 'border-box', minHeight: '60px', resize: 'vertical' }}
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
}
