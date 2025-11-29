import React, { useState, useEffect, useRef } from 'react';
import { FiEdit2 } from 'react-icons/fi';

interface InlineEditProps {
    value: string;
    onSave: (newValue: string) => void;
    multiline?: boolean;
    placeholder?: string;
    className?: string;
    style?: React.CSSProperties;
    inputStyle?: React.CSSProperties;
    readOnly?: boolean;
}

export const InlineEdit: React.FC<InlineEditProps> = ({
    value,
    onSave,
    multiline = false,
    placeholder,
    className,
    style,
    inputStyle,
    readOnly = false
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);
    const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            // Move cursor to end
            const len = inputRef.current.value.length;
            inputRef.current.setSelectionRange(len, len);
        }
    }, [isEditing]);

    const handleStart = () => {
        if (readOnly) return;
        setEditValue(value);
        setIsEditing(true);
    };

    const handleSave = () => {
        onSave(editValue);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditValue(value);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            handleCancel();
        } else if (e.key === 'Enter') {
            if (!multiline || e.ctrlKey || e.metaKey) {
                e.preventDefault(); // Prevent newline if not multiline or using modifier
                handleSave();
            }
        }
    };

    if (isEditing) {
        return (
            <div className={className} style={style}>
                {multiline ? (
                    <textarea
                        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        style={{
                            width: '100%',
                            minHeight: '60px',
                            padding: '5px',
                            fontFamily: 'inherit',
                            boxSizing: 'border-box',
                            ...inputStyle
                        }}
                    />
                ) : (
                    <input
                        ref={inputRef as React.RefObject<HTMLInputElement>}
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        style={{
                            width: '100%',
                            padding: '5px',
                            fontFamily: 'inherit',
                            boxSizing: 'border-box',
                            ...inputStyle
                        }}
                    />
                )}
                <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                    <button
                        onClick={handleSave}
                        style={{
                            padding: '2px 8px',
                            backgroundColor: '#646cff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.8em'
                        }}
                    >
                        Save
                    </button>
                    <button
                        onClick={handleCancel}
                        style={{
                            padding: '2px 8px',
                            backgroundColor: '#ccc',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.8em'
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={className} style={{ display: 'flex', alignItems: 'center', gap: '5px', ...style }}>
            <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{value || placeholder}</span>
            {!readOnly && (
                <button
                    onClick={handleStart}
                    style={{
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        color: '#bbb',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center'
                    }}
                    title="Edit"
                >
                    <FiEdit2 size={12} />
                </button>
            )}
        </div>
    );
};

