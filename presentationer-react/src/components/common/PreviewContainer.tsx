import React, { useEffect, useRef } from 'react';
import { useExportPng } from '../../hooks/useExportPng';
import { Menu, type MenuItem } from './Menu';

export interface PreviewContainerProps {
    children: React.ReactNode;
    title?: React.ReactNode;
    onDimensionsChange?: (width: number, height: number) => void;
    containerRef?: React.RefObject<HTMLDivElement | null>;
    style?: React.CSSProperties;
    wrapperStyle?: React.CSSProperties;
    className?: string;
    onExportPng?: () => void;
    onCopyPng?: () => void;
    exportWidth?: string;
    exportHeight?: string;
}

export const PreviewContainer: React.FC<PreviewContainerProps> = ({
    children,
    title,
    onDimensionsChange,
    containerRef,
    style,
    wrapperStyle,
    className,
    onExportPng,
    onCopyPng,
    exportWidth,
    exportHeight,
}) => {
    const localRef = useRef<HTMLDivElement>(null);
    const ref = containerRef || localRef;

    const { handleExportPng: defaultExport, handleCopyPng: defaultCopy } = useExportPng(ref, exportWidth, exportHeight);

    const handleExport = onExportPng || defaultExport;
    const handleCopy = onCopyPng || defaultCopy;

    const menuItems: MenuItem[] = [];
    if (handleExport) {
        menuItems.push({ label: 'Export PNG', onClick: handleExport, hasSeparator: !!handleCopy });
    }
    if (handleCopy) {
        menuItems.push({ label: 'Copy as PNG', onClick: handleCopy });
    }

    useEffect(() => {
        if (!ref.current || !onDimensionsChange) return;

        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                onDimensionsChange(
                    Math.round(entry.contentRect.width),
                    Math.round(entry.contentRect.height)
                );
            }
        });

        observer.observe(ref.current);
        return () => observer.disconnect();
    }, [ref, onDimensionsChange]);

    return (
        <div
            className={className}
            style={{
                backgroundColor: '#f0f2f5',
                padding: '20px',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                resize: 'both',
                overflow: 'auto',
                ...wrapperStyle
            }}
        >
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                {title && (
                    typeof title === 'string' ? <strong>{title}</strong> : title
                )}

                {menuItems.length > 0 && <Menu items={menuItems} />}
            </div>

            <div
                ref={ref}
                style={{
                    width: '100%',
                    flex: 1,
                    overflow: 'auto',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    border: '1px solid #ddd',
                    maxWidth: '100%',
                    ...style,
                }}
            >
                {children}
            </div>
        </div>
    );
};
