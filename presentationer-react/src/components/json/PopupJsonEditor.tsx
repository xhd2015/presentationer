import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FiMaximize2, FiX } from 'react-icons/fi';
import { JSONEditor } from './JSONEditor';

interface PopupJsonEditorProps {
    value: string;
    onChange: (value: string) => void;
    readOnly?: boolean;
    height?: string | number;
    schema?: any;
}

export const PopupJsonEditor: React.FC<PopupJsonEditorProps> = (props) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const handleExpand = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    const handleFocus = () => setIsFocused(true);
    const handleBlur = (e: React.FocusEvent) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsFocused(false);
        }
    };

    // Wrapper for inline editor
    const InlineEditor = (
        <div
            style={{ position: 'relative', height: props.height || '100%', width: '100%' }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onMouseEnter={() => setIsFocused(true)} // Also show on hover for better UX
            onMouseLeave={() => setIsFocused(false)}
        >
            <JSONEditor {...props} />
            {isFocused && (
                <button
                    onClick={handleExpand}
                    style={{
                        position: 'absolute',
                        top: '5px',
                        right: '20px', // Avoid scrollbar
                        zIndex: 10,
                        background: 'rgba(255,255,255,0.9)',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#333'
                    }}
                    title="Expand Editor"
                >
                    <FiMaximize2 />
                </button>
            )}
        </div>
    );

    // Popup
    const Popup = isOpen ? createPortal(
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{
                width: '80vw', height: '80vh',
                background: 'white', display: 'flex', flexDirection: 'column',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)', borderRadius: '8px', overflow: 'hidden'
            }}>
                {/* Title Bar */}
                <div style={{
                    height: '40px', background: '#000', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0 15px'
                }}>
                    <span style={{ fontWeight: 'bold', fontSize: '14px' }}>JSON Editor</span>
                    <button
                        onClick={handleClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            padding: '5px',
                            borderRadius: '4px'
                        }}
                    >
                        <FiX size={20} />
                    </button>
                </div>
                {/* Editor Content */}
                <div style={{ flex: 1 }}>
                    <JSONEditor {...props} height="100%" />
                </div>
            </div>
        </div>,
        document.body
    ) : null;

    return (
        <>
            {InlineEditor}
            {Popup}
        </>
    );
};

