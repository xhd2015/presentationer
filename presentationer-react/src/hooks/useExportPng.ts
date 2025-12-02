import { useCallback } from 'react';
import { toPng } from 'html-to-image';
import toast from 'react-hot-toast';

async function generatePng(element: HTMLElement, width?: number, height?: number) {
    // Inject style to hide scrollbars during export
    const styleEl = document.createElement('style');
    styleEl.innerHTML = '::-webkit-scrollbar { display: none !important; }';
    document.head.appendChild(styleEl);

    try {
        return await toPng(element, {
            cacheBust: true,
            width,
            height,
            canvasWidth: width,
            canvasHeight: height,
            style: {
                overflow: 'hidden',
            }
        });
    } finally {
        document.head.removeChild(styleEl);
    }
}

export function useExportPng(previewRef: React.RefObject<HTMLDivElement | null>, widthStr?: string, heightStr?: string) {
    const handleExportPng = useCallback(async () => {
        if (!previewRef.current) return;
        try {
            const width = widthStr ? parseInt(widthStr, 10) : undefined;
            const height = heightStr ? parseInt(heightStr, 10) : undefined;

            const dataUrl = await generatePng(previewRef.current, width, height);
            const link = document.createElement('a');
            link.download = 'code-snippet.png';
            link.href = dataUrl;
            link.click();
            toast.success('Exported successfully!');
        } catch (err) {
            console.error('Failed to export PNG', err);
            toast.error('Failed to export PNG');
        }
    }, [previewRef, widthStr, heightStr]);

    const handleCopyPng = useCallback(async () => {
        if (!previewRef.current) return;
        try {
            // const width = widthStr ? parseInt(widthStr, 10) : undefined;
            // const height = heightStr ? parseInt(heightStr, 10) : undefined;
            const dataUrl = await generatePng(previewRef.current);
            const blob = await (await fetch(dataUrl)).blob();
            await navigator.clipboard.write([
                new ClipboardItem({
                    [blob.type]: blob,
                }),
            ]);
            toast.success('Image copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy PNG', err);
            toast.error('Failed to copy image.');
        }
    }, [previewRef]);

    return { handleExportPng, handleCopyPng };
}
