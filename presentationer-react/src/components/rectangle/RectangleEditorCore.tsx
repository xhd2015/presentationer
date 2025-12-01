import React from 'react';
import { ConfigEditor } from '../common/ConfigEditor';

export interface RectangleEditorCoreProps {
    jsonInput: string;
    onChange: (json: string) => void;
    error?: string | null;
}

const helpText = (
    <div>
        <h3 style={{ marginTop: 0 }}>Rectangle Configuration</h3>
        <p>Define the visual style of the rectangle.</p>
        <ul style={{ paddingLeft: '20px' }}>
            <li><b>text</b>: Main label.</li>
            <li><b>subtext</b>: Secondary label.</li>
            <li><b>color</b>: Base color (hex or name like 'red', 'blue').</li>
            <li><b>backgroundColor</b>: Fill color.</li>
            <li><b>width/height</b>: Dimensions (number).</li>
            <li><b>items</b>: Array of sub-items to render vertically.</li>
        </ul>
        <p>Example:</p>
        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>{`{
  "text": "Service A",
  "color": "blue",
  "subtext": "v1.0",
  "animate": true,
  "items": [
    { "type": "icon", "value": "🚀" },
    { "type": "text", "value": "Running", "color": "green" }
  ]
}`}</pre>
    </div>
);

const schema = {
    type: "object",
    properties: {
        text: { type: "string", description: "Main text content" },
        subtext: { type: "string", description: "Secondary text below main text" },
        color: { type: "string", description: "Base color (used for border and text if not overridden)" },
        backgroundColor: { type: "string", description: "Background color" },
        borderColor: { type: "string", description: "Border color" },
        textColor: { type: "string", description: "Text color" },
        icon: { type: "string", description: "Icon string (emoji or text)" },
        width: { type: "number", description: "Width in pixels" },
        height: { type: "number", description: "Height in pixels" },
        animate: { type: "boolean", description: "Enable pulse animation" },
        items: {
            type: "array",
            description: "List of items to display inside",
            items: {
                type: "object",
                properties: {
                    type: { type: "string", enum: ["text", "icon"] },
                    value: { type: "string" },
                    color: { type: "string" },
                    size: { type: "string" },
                    bold: { type: "boolean" }
                },
                required: ["value"]
            }
        }
    },
    required: ["text"] // Actually text might be optional if items are present, but good for default hint
};

export const RectangleEditorCore: React.FC<RectangleEditorCoreProps> = ({ jsonInput, onChange, error }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>Rectangle Configuration</div>
            <ConfigEditor
                value={jsonInput}
                onChange={onChange}
                validateJson={(json) => {
                    if (typeof json !== 'object' || json === null || Array.isArray(json)) return "Must be an object";
                    return null;
                }}
                renderUI={() => (
                    <div style={{ padding: '20px', color: '#666' }}>
                        UI Editor coming soon. Please use JSON mode.
                    </div>
                )}
                schema={schema}
                helpText={helpText}
            />
            {error && <div style={{ color: 'red', marginTop: '5px' }}>{error}</div>}
        </div>
    );
};
