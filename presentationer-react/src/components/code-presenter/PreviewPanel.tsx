import React, { useEffect, useRef } from 'react';
import hljs from 'highlight.js/lib/core';
import go from 'highlight.js/lib/languages/go';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import csharp from 'highlight.js/lib/languages/csharp';
import rust from 'highlight.js/lib/languages/rust';
import sql from 'highlight.js/lib/languages/sql';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import markdown from 'highlight.js/lib/languages/markdown';
import yaml from 'highlight.js/lib/languages/yaml';

import 'highlight.js/styles/vs2015.css';
import { processHtmlLines, walkAndHighlight, type FocusLineConfig } from './focus';

hljs.registerLanguage('go', go);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('json', json);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('python', python);
hljs.registerLanguage('java', java);
hljs.registerLanguage('c', c);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('csharp', csharp);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('html', xml); // html is xml
hljs.registerLanguage('css', css);
hljs.registerLanguage('markdown', markdown);
hljs.registerLanguage('yaml', yaml);

interface PreviewPanelProps {
    code: string;
    language?: string;
    isFocusMode: boolean;
    focusedLines: FocusLineConfig[];
    showHtml?: boolean;
    onDimensionsChange?: (width: number, height: number) => void;
    previewRef?: React.RefObject<HTMLDivElement>;
    exportWidth?: string;
    exportHeight?: string;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
    code,
    language,
    isFocusMode,
    focusedLines,
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
            // Ensure class is set for language
            el.className = `language-${language || 'go'}`;
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
    }, [code, language, isFocusMode, focusedLines]);

    return (
        <pre style={{ margin: 0, fontSize: '14px', lineHeight: '1.5', minHeight: '100%' }}>
            <code ref={codeContentRef} className={`language-${language || 'go'}`} style={{
                fontFamily: 'monospace', outline: 'none',
                padding: '4px',
                paddingLeft: "1px"
            }}>
                {code}
            </code>
        </pre>
    );
};
