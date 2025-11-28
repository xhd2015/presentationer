export interface FocusLineConfig {
    line: number;
    textMatch?: string;
}

export function parseLineConfig(input: string): FocusLineConfig[] {
    const results: FocusLineConfig[] = [];
    if (!input.trim()) return results;

    const parts = input.split(/,(?![^{]*})/); // Split by comma, ignoring commas inside curly braces
    parts.forEach(part => {
        const trimmedPart = part.trim();

        // Check for text match pattern: 6{text} or 6{"text"}
        const match = trimmedPart.match(/^(\d+)\s*\{([^}]+)\}$/);

        if (match) {
            const line = parseInt(match[1], 10);
            let text = match[2];

            // If quoted, unquote it using JSON.parse to handle escapes
            if (text.startsWith('"') && text.endsWith('"')) {
                try {
                    text = JSON.parse(text);
                } catch (e) {
                    // Fallback if JSON parse fails (e.g. invalid escape), just strip quotes naively or keep as is
                    // Ideally we want strict JSON string syntax for quotes
                    console.warn('Failed to parse quoted string in config:', text, e);
                }
            }

            if (!isNaN(line)) {
                results.push({ line, textMatch: text });
            }
        } else {
            // Regular range or single number
            const range = trimmedPart.split('-');
            if (range.length === 2) {
                const start = parseInt(range[0], 10);
                const end = parseInt(range[1], 10);
                if (!isNaN(start) && !isNaN(end)) {
                    for (let i = start; i <= end; i++) {
                        results.push({ line: i });
                    }
                }
            } else {
                const num = parseInt(range[0], 10);
                if (!isNaN(num)) {
                    results.push({ line: num });
                }
            }
        }
    });
    return results;
}

export function processHtmlLines(html: string, focusedLines: FocusLineConfig[], isFocusMode: boolean): string {
    const lines = html.split(/\r\n|\r|\n/);

    const processedLines = lines.map((lineHtml: string, index: number) => {
        const lineNumber = index + 1;
        const config = focusedLines.find(f => f.line === lineNumber);
        const isFocused = !isFocusMode || focusedLines.length === 0 || !!config;

        const finalLineHtml = lineHtml || '&nbsp;'; // Maintain empty lines

        const style = isFocused
            ? 'opacity: 1; display: block; position: relative;'
            : 'opacity: 0.3; filter: blur(0.5px); display: block; position: relative;';

        // Add line number
        const lineNumberHtml = `<span style="display: inline-block; width: 30px; color: #666; text-align: right; margin-right: 15px; user-select: none;">${lineNumber}</span>`;

        return `<div class="line-${lineNumber}" style="${style}">${lineNumberHtml}${finalLineHtml}</div>`;
    });

    return processedLines.join('');
}

export function walkAndHighlight(root: Node, textMatch: string) {
    const walk = (node: Node) => {
        if (node.nodeType === 3) { // Text node
            const text = node.nodeValue;
            if (text && text.includes(textMatch)) {
                const span = document.createElement('span');
                const parts = text.split(textMatch);
                parts.forEach((part, i) => {
                    span.appendChild(document.createTextNode(part));
                    if (i < parts.length - 1) {
                        const mark = document.createElement('span');
                        mark.style.backgroundColor = '#2d5e38';
                        mark.style.color = '#fff';
                        mark.style.borderRadius = '2px';
                        mark.style.boxShadow = '0 0 0 1px #45a049';
                        mark.innerText = textMatch;
                        span.appendChild(mark);
                    }
                });
                node.parentNode?.replaceChild(span, node);
            }
        } else if (node.nodeType === 1) {
            Array.from(node.childNodes).forEach(walk);
        }
    };
    walk(root);
}
