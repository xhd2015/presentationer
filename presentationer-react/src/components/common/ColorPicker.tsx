import React, { useState } from 'react';
import { SketchPicker, type ColorResult } from 'react-color';
import { FiRefreshCw } from 'react-icons/fi';

interface ColorPickerProps {
    color: string;
    onChange: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange }) => {
    const [displayColorPicker, setDisplayColorPicker] = useState(false);

    const handleClick = () => {
        setDisplayColorPicker(!displayColorPicker);
    };

    const handleClose = () => {
        setDisplayColorPicker(false);
    };

    const handleChange = (color: ColorResult) => {
        onChange(color.hex);
    };

    const handleRandom = (e: React.MouseEvent) => {
        console.log('handleRandom', e);
        e.stopPropagation();
        const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        onChange(randomColor);
    };

    const popover: React.CSSProperties = {
        position: 'absolute',
        zIndex: 2,
        left: 0,
        top: 'calc(100% + 5px)',
    };

    const cover: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    };

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            <div
                style={{
                    padding: '5px',
                    background: '#fff',
                    borderRadius: '1px',
                    boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
                    display: 'inline-block',
                    cursor: 'pointer',
                }}
                onClick={handleClick}
            >
                <div
                    style={{
                        width: '36px',
                        height: '14px',
                        borderRadius: '2px',
                        background: color,
                    }}
                />
            </div>
            {displayColorPicker ? (
                <div style={popover}>
                    <div style={cover} onClick={handleClose} />
                    <div style={{ position: 'relative', zIndex: 2, background: '#fff', borderRadius: '4px', boxShadow: 'rgba(0, 0, 0, 0.15) 0px 0px 0px 1px, rgba(0, 0, 0, 0.15) 0px 8px 16px' }}>
                        <SketchPicker
                            color={color}
                            onChange={handleChange}
                            styles={{ default: { picker: { boxShadow: 'none', borderRadius: '4px 4px 0 0' } } }}
                        />
                        <div style={{ padding: '8px', borderTop: '1px solid #eee', textAlign: 'center', fontFamily: 'monospace', fontSize: '12px', color: '#666', background: '#fafafa', userSelect: 'text' }}>
                            {color.toUpperCase()}
                        </div>
                        <div
                            onClick={handleRandom}
                            style={{
                                borderTop: '1px solid #eee',
                                padding: '10px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '5px',
                                color: '#555',
                                fontSize: '12px',
                                userSelect: 'none'
                            }}
                        >
                            <FiRefreshCw /> Random Color
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};
