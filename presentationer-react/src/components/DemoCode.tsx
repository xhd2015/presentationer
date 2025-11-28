import React, { useEffect, useRef } from 'react';
import hljs from 'highlight.js/lib/core';
import go from 'highlight.js/lib/languages/go';
import 'highlight.js/styles/vs2015.css'; // or any other style

hljs.registerLanguage('go', go);

const DemoCode: React.FC = () => {
    const code = `package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}`;

    const highlightText = "Hello";
    const codeRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (codeRef.current) {
            // Basic highlight
            delete codeRef.current.dataset.highlighted;
            hljs.highlightElement(codeRef.current);

            // Manual text highlighting post-process
            // This is hacky but common with hljs if you need specific text highlight on top of syntax
            // Since hljs works on innerHTML, we can try to replace text
            if (highlightText) {
                // Need to be careful not to break HTML tags.
                // A safer way is to walk the text nodes.

                const walk = (node: Node) => {
                    if (node.nodeType === 3) { // Text node
                        const text = node.nodeValue;
                        if (text && text.includes(highlightText)) {
                            const span = document.createElement('span');
                            // Replace all occurrences
                            const parts = text.split(highlightText);
                            parts.forEach((part, i) => {
                                span.appendChild(document.createTextNode(part));
                                if (i < parts.length - 1) {
                                    const mark = document.createElement('span');
                                    mark.style.backgroundColor = 'yellow';
                                    mark.style.color = 'black';
                                    mark.style.fontWeight = 'bold';
                                    mark.innerText = highlightText;
                                    span.appendChild(mark);
                                }
                            });
                            node.parentNode?.replaceChild(span, node);
                        }
                    } else if (node.nodeType === 1) { // Element node
                        // Don't recurse into our own highlights if we re-run (though we reset above)
                        // And don't break syntax highlighting spans
                        Array.from(node.childNodes).forEach(walk);
                    }
                };

                // We walk after syntax highlighting is done
                walk(codeRef.current);
            }
        }
    }, [code, highlightText]);

    return (
        <div style={{ padding: '20px', backgroundColor: '#1e1e1e', color: '#dcdcdc' }}>
            <h2>Highlight Demo (using highlight.js)</h2>
            <p>Trying to highlight "{highlightText}" inside the string.</p>
            <pre style={{ margin: 0 }}>
                <code ref={codeRef} className="language-go" style={{ fontFamily: 'monospace' }}>
                    {code}
                </code>
            </pre>
        </div>
    );
};

export default DemoCode;
