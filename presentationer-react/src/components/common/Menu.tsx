import React, { useState } from 'react';
import { MdMoreVert } from 'react-icons/md';

export interface MenuItem {
    label: string;
    onClick: () => void;
    hasSeparator?: boolean;
}

interface MenuProps {
    items: MenuItem[];
    icon?: React.ReactNode;
}

export const Menu: React.FC<MenuProps> = ({ items, icon }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                title="Options"
            >
                {icon || <MdMoreVert size={20} />}
            </button>

            {isOpen && (
                <>
                    <div
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 }}
                        onClick={() => setIsOpen(false)}
                    />
                    <div style={{
                        position: 'absolute', right: 0, top: '100%',
                        backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '4px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)', zIndex: 101,
                        minWidth: '150px', display: 'flex', flexDirection: 'column',
                        overflow: 'hidden'
                    }}>
                        {items.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => { item.onClick(); setIsOpen(false); }}
                                style={{
                                    padding: '8px 12px',
                                    textAlign: 'left',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    borderBottom: item.hasSeparator ? '1px solid #eee' : 'none'
                                }}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

