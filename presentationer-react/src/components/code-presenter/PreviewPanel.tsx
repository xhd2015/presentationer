import React, { useEffect, useRef } from 'react';
import hljs from 'highlight.js/lib/core';
import go from 'highlight.js/lib/languages/go';
import 'highlight.js/styles/vs2015.css';
import { processHtmlLines, walkAndHighlight, type FocusLineConfig } from './focus';

hljs.registerLanguage('go', go);

interface PreviewPanelProps {
    code: string;
    isFocusMode: boolean;
    focusedLines: FocusLineConfig[];
    showHtml: boolean;
    onDimensionsChange: (width: number, height: number) => void;
    previewRef: React.RefObject<HTMLDivElement>;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
    code,
    isFocusMode,
    focusedLines,
    showHtml,
    onDimensionsChange,
    previewRef,
}) => {
    const codeContentRef = useRef<HTMLElement>(null);

    // Handle resize observer to update dimensions
    useEffect(() => {
        if (!previewRef.current) return;

        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                onDimensionsChange(
                    Math.round(entry.contentRect.width),
                    Math.round(entry.contentRect.height)
                );
            }
        });

        observer.observe(previewRef.current);
        return () => observer.disconnect();
    }, [previewRef, onDimensionsChange]);

    // Apply highlighting and focus effects
    useEffect(() => {
        if (codeContentRef.current) {
            const el = codeContentRef.current;
            // Reset content to code to clear previous highlights
            el.textContent = code;
            delete el.dataset.highlighted;

            // 1. Syntax highlight
            hljs.highlightElement(el);

            // 2. Apply line focus and text highlighting logic
            const html = el.innerHTML;
            el.innerHTML = processHtmlLines(html, focusedLines, isFocusMode);

            // 3. Post-process for text highlighting using DOM

            // 3. Post-process for text highlighting using DOM
            if (isFocusMode) {
                focusedLines.forEach((config: FocusLineConfig) => {
                    if (config.textMatch) {
                        const lineEl = el.querySelector(`.line-${config.line}`);
                        if (lineEl) {
                            walkAndHighlight(lineEl, config.textMatch);
                        }
                    }
                });
            }
        }
    }, [code, isFocusMode, focusedLines]);

    return (
        <div>
            <strong>Preview:</strong>
            <div
                ref={previewRef}
                style={{
                    marginTop: '10px',
                    borderRadius: '8px',
                    overflow: 'auto',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    resize: 'both',
                    maxWidth: '100%',
                    border: '1px solid #ddd',
                    backgroundColor: '#1e1e1e', // Match highlight.js theme bg
                }}
            >
                <pre style={{ margin: 0, /* padding: '10px', */ fontSize: '14px', lineHeight: '1.5', minHeight: '100%' }}>
                    <code ref={codeContentRef} className="language-go" style={{
                        fontFamily: 'monospace', outline: 'none',
                        padding: '4px',
                        paddingLeft: "1px"
                    }}>
                        {code}
                    </code>
                </pre>
            </div>

            {showHtml && (
                <div style={{ marginTop: '20px' }}>
                    <strong>HTML Output:</strong>
                    <pre
                        style={{
                            background: '#f4f4f4',
                            padding: '10px',
                            borderRadius: '4px',
                            overflow: 'auto',
                            maxHeight: '200px',
                            fontSize: '12px',
                        }}
                    >
                        {previewRef.current?.innerHTML}
                    </pre>
                </div>
            )}
        </div>
    );
};
