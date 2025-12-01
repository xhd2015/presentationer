import React from 'react';
import { FiEdit2, FiTrash, FiPlus } from 'react-icons/fi';
import { type ChartDataItem } from './types';
import { ColorPicker } from '../common/ColorPicker';

interface ChartDataItemListProps {
    data: ChartDataItem[];
    onEdit: (index: number) => void;
    onDelete: (index: number) => void;
    onAdd: () => void;
    onColorChange: (index: number, color: string) => void;
}

export const ChartDataItemList: React.FC<ChartDataItemListProps> = ({ data, onEdit, onDelete, onAdd, onColorChange }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {data.map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', padding: '10px', border: '1px solid #eee', borderRadius: '4px', backgroundColor: 'white' }}>
                    <div style={{ marginRight: '10px' }}>
                        <ColorPicker
                            color={item.color || '#000000'}
                            onChange={(c) => onColorChange(index, c)}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                        <div style={{ fontSize: '0.9em', color: '#666' }}>Value: {item.value}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        <button onClick={() => onEdit(index)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#666' }}><FiEdit2 /></button>
                        <button onClick={() => onDelete(index)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#d32f2f' }}><FiTrash /></button>
                    </div>
                </div>
            ))}
            <button
                onClick={onAdd}
                style={{
                    width: '100%', padding: '10px',
                    border: '1px dashed #ccc', borderRadius: '4px',
                    backgroundColor: 'transparent', color: '#666', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'
                }}
            >
                <FiPlus /> Add Data Item
            </button>
        </div>
    );
};

