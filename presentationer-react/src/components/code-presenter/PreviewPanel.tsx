import React, { useEffect, useRef } from 'react';
import hljs from 'highlight.js/lib/core';
import go from 'highlight.js/lib/languages/go';
import 'highlight.js/styles/vs2015.css';
import { processHtmlLines, walkAndHighlight, type FocusLineConfig } from './focus';
import { PreviewContainer } from '../common/PreviewContainer';

hljs.registerLanguage('go', go);

interface PreviewPanelProps {
    code: string;
    isFocusMode: boolean;
    focusedLines: FocusLineConfig[];
    showHtml: boolean;
    onDimensionsChange: (width: number, height: number) => void;
    previewRef: React.RefObject<HTMLDivElement | null>;
    exportWidth?: string;
    exportHeight?: string;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
    code,
    isFocusMode,
    focusedLines,
    showHtml,
    onDimensionsChange,
    previewRef,
    exportWidth,
    exportHeight,
}) => {
    const codeContentRef = useRef<HTMLElement>(null);

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
            <PreviewContainer
                title="Preview:"
                onDimensionsChange={onDimensionsChange}
                containerRef={previewRef}
                exportWidth={exportWidth}
                exportHeight={exportHeight}
                style={{
                    backgroundColor: '#1e1e1e',
                }}
            >
                <pre style={{ margin: 0, fontSize: '14px', lineHeight: '1.5', minHeight: '100%' }}>
                    <code ref={codeContentRef} className="language-go" style={{
                        fontFamily: 'monospace', outline: 'none',
                        padding: '4px',
                        paddingLeft: "1px"
                    }}>
                        {code}
                    </code>
                </pre>
            </PreviewContainer>

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
