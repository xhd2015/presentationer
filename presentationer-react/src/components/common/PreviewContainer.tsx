import React, { useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
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
    onCopyHtml?: () => void;
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
    onCopyHtml,
    exportWidth,
    exportHeight,
}) => {
    const localRef = useRef<HTMLDivElement>(null);
    const ref = containerRef || localRef;

    const { handleExportPng: defaultExport, handleCopyPng: defaultCopy } = useExportPng(ref, exportWidth, exportHeight);

    const handleExport = onExportPng || defaultExport;
    const handleCopy = onCopyPng || defaultCopy;

    const handleCopyHtmlDefault = async () => {
        if (!ref.current) return;
        try {
            const html = ref.current.innerHTML;
            const text = ref.current.innerText;

            // Create a Blob for HTML content
            const blobHtml = new Blob([html], { type: 'text/html' });
            // Create a Blob for plain text fallback
            const blobText = new Blob([text], { type: 'text/plain' });

            const data = [new ClipboardItem({
                'text/html': blobHtml,
                'text/plain': blobText,
            })];

            await navigator.clipboard.write(data);
            toast.success('Copied HTML');
        } catch (e) {
            console.error('Failed to copy', e);
            toast.error('Failed to copy');
        }
    };

    const handleCopyHtml = onCopyHtml || handleCopyHtmlDefault;

    const menuItems: MenuItem[] = [];
    // Copy is likely frequent, put it first or with PNG options?
    // Usually "Copy" is common.
    // "Copy"
    // "Copy as PNG"
    // "Export PNG"
    menuItems.push({ label: 'Copy', onClick: handleCopyHtml, hasSeparator: !!handleCopy || !!handleExport });

    if (handleCopy) {
        menuItems.push({ label: 'Copy as PNG', onClick: handleCopy, hasSeparator: !!handleExport });
    }
    if (handleExport) {
        menuItems.push({ label: 'Export PNG', onClick: handleExport });
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
