import React, { useState, useEffect } from 'react';
import { ConfigEditor } from '../common/ConfigEditor';
import { type ChartDataItem } from './types';
import { ChartDataItemForm } from './ChartDataItemForm';
import { ChartDataItemList } from './ChartDataItemList';

interface ChartDataInputProps {
    value: string; // JSON string
    onChange: (value: string) => void;
}

export const ChartDataInput: React.FC<ChartDataInputProps> = ({ value, onChange }) => {
    const [data, setData] = useState<ChartDataItem[]>([]);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    // Form State
    const [editForm, setEditForm] = useState<ChartDataItem>({
        name: '',
        value: 0,
        color: '#8884d8' // Default color
    });

    useEffect(() => {
        try {
            const parsed = JSON.parse(value || '[]');
            if (Array.isArray(parsed)) {
                setData(parsed);
            }
        } catch (e) {
            // Ignore parsing errors
        }
    }, [value]);

    const updateData = (newData: ChartDataItem[]) => {
        setData(newData);
        onChange(JSON.stringify(newData, null, 2));
    };

    const handleDelete = (index: number) => {
        const newData = [...data];
        newData.splice(index, 1);
        updateData(newData);
        if (editingIndex === index) {
            setEditingIndex(null);
        }
    };

    const handleEdit = (index: number) => {
        setEditingIndex(index);
        setEditForm({ ...data[index] });
    };

    const handleAdd = () => {
        setEditingIndex(-1); // -1 for new
        setEditForm({
            name: '',
            value: 0,
            color: `#${Math.floor(Math.random() * 16777215).toString(16)}` // Random color
        });
    };

    const handleSave = (item: ChartDataItem) => {
        const newData = [...data];
        if (editingIndex === -1) {
            newData.push(item);
        } else if (editingIndex !== null) {
            newData[editingIndex] = item;
        }
        updateData(newData);
        setEditingIndex(null);
    };

    const handleColorChange = (index: number, color: string) => {
        const newData = [...data];
        newData[index] = { ...newData[index], color };
        updateData(newData);
    };

    const handleCancel = () => {
        setEditingIndex(null);
    };

    return (
        <ConfigEditor
            value={value}
            onChange={onChange}
            validateJson={(json) => {
                if (!Array.isArray(json)) return "Current content is not a valid array.";
                return null;
            }}
            onModeChange={(mode) => {
                if (mode === 'normal') {
                    setEditingIndex(null);
                }
            }}
            renderUI={() => (
                <div style={{ padding: '10px' }}>
                    {editingIndex !== null ? (
                        <ChartDataItemForm
                            initialData={editForm}
                            onSave={handleSave}
                            onCancel={handleCancel}
                            isNew={editingIndex === -1}
                        />
                    ) : (
                        <ChartDataItemList
                            data={data}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onAdd={handleAdd}
                            onColorChange={handleColorChange}
                        />
                    )}
                </div>
            )}
        />
    );
};
