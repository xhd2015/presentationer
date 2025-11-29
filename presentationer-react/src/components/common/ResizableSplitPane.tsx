import React, { useState, useRef, useEffect } from 'react';

interface ResizableSplitPaneProps {
    left: React.ReactNode;
    right?: React.ReactNode;
    initialLeftWidthPercent?: number; // 0-100
    minLeftWidthPercent?: number;
    maxLeftWidthPercent?: number;
}

export const ResizableSplitPane: React.FC<ResizableSplitPaneProps> = ({
    left,
    right,
    initialLeftWidthPercent = 50,
    minLeftWidthPercent = 20,
    maxLeftWidthPercent = 80
}) => {
    const [leftWidthPercent, setLeftWidthPercent] = useState(initialLeftWidthPercent);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || !containerRef.current) return;

            const containerRect = containerRef.current.getBoundingClientRect();
            const newWidthPercent = ((e.clientX - containerRect.left) / containerRect.width) * 100;

            // Clamp
            const clampedWidth = Math.max(minLeftWidthPercent, Math.min(maxLeftWidthPercent, newWidthPercent));
            setLeftWidthPercent(clampedWidth);
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        } else {
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isDragging, minLeftWidthPercent, maxLeftWidthPercent]);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const showRight = !!right;

    return (
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }} ref={containerRef}>
            <div style={{
                width: showRight ? `${leftWidthPercent}%` : '100%',
                flex: showRight ? 'none' : 1,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {left}
            </div>

            {showRight && (
                <>
                    <div
                        onMouseDown={handleMouseDown}
                        style={{
                            width: '4px',
                            cursor: 'col-resize',
                            backgroundColor: isDragging ? '#646cff' : '#eee',
                            transition: 'background-color 0.2s',
                            flexShrink: 0,
                            zIndex: 10
                        }}
                    />
                    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        {right}
                    </div>
                </>
            )}
        </div>
    );
};

