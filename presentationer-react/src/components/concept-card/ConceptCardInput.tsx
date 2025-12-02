import type { ConceptItem } from './types';

interface ConceptCardInputProps {
    items: ConceptItem[];
    onChange: (items: ConceptItem[]) => void;
}

export function ConceptCardInput({ items, onChange }: ConceptCardInputProps) {
    const handleAdd = () => {
        onChange([...items, { icon: '📝', title: 'New Concept', description: 'Description', color: 'blue' }]);
    };

    const handleDelete = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        onChange(newItems);
    };

    const handleChange = (index: number, field: keyof ConceptItem, value: string) => {
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
                        <span style={{ fontWeight: 'bold', color: '#555' }}>Concept {index + 1}</span>
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
                        <div style={{ flex: 0.5 }}>
                            <label style={{ display: 'block', fontSize: '0.8em', color: '#666', marginBottom: '2px' }}>Icon</label>
                            <input
                                type="text"
                                value={item.icon}
                                onChange={(e) => handleChange(index, 'icon', e.target.value)}
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
                + Add Concept
            </button>
        </div>
    );
}

