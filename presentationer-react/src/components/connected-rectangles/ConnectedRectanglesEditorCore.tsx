import React from 'react';
import { ConfigEditor } from '../common/ConfigEditor';

export interface ConnectedRectanglesEditorCoreProps {
    jsonInput: string;
    onChange: (json: string) => void;
    error?: string | null;
}

const helpText = (
    <div>
        <h3 style={{ marginTop: 0 }}>Connected Rectangles Config</h3>
        <p>Define a flow of connected nodes.</p>
        <ul style={{ paddingLeft: '20px' }}>
            <li><b>layout</b>: 'row' or 'column' (default 'row').</li>
            <li><b>gap</b>: Spacing between nodes in pixels.</li>
            <li><b>nodes</b>: Array of node objects.
                <ul style={{ paddingLeft: '20px', marginTop: '5px' }}>
                    <li><b>id</b>: Unique identifier.</li>
                    <li><b>text</b>: Main label.</li>
                    <li><b>subtext</b>: Secondary label.</li>
                    <li><b>color</b>: 'red', 'blue', 'yellow', or hex.</li>
                    <li><b>icon</b>: Emoji or text icon.</li>
                    <li><b>isPulse</b>: Boolean to enable pulse animation.</li>
                </ul>
            </li>
            <li><b>edges</b>: Array of connections (visualized as arrows between nodes).
                <ul style={{ paddingLeft: '20px', marginTop: '5px' }}>
                    <li><b>from</b>: Source node ID.</li>
                    <li><b>to</b>: Target node ID.</li>
                    <li><b>label</b>: Text on the arrow.</li>
                </ul>
            </li>
        </ul>
        <p>Example:</p>
        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>{`{
  "layout": "row",
  "gap": 40,
  "nodes": [
    { "id": "1", "text": "Start", "color": "blue", "icon": "🚀" },
    { "id": "2", "text": "Process", "color": "yellow", "isPulse": true },
    { "id": "3", "text": "End", "color": "red" }
  ],
  "edges": [
    { "from": "1", "to": "2", "label": "init" },
    { "from": "2", "to": "3" }
  ]
}`}</pre>
    </div>
);

const schema = {
    type: "object",
    properties: {
        layout: { type: "string", enum: ["row", "column"], description: "Layout direction" },
        gap: { type: "number", description: "Gap between nodes in pixels" },
        nodes: {
            type: "array",
            description: "List of nodes",
            items: {
                type: "object",
                properties: {
                    id: { type: "string" },
                    text: { type: "string" },
                    subtext: { type: "string" },
                    icon: { type: "string" },
                    color: { type: "string" },
                    isPulse: { type: "boolean" }
                },
                required: ["id", "text"]
            }
        },
        edges: {
            type: "array",
            description: "List of edges (connections)",
            items: {
                type: "object",
                properties: {
                    from: { type: "string" },
                    to: { type: "string" },
                    label: { type: "string" }
                },
                required: ["from", "to"]
            }
        }
    },
    required: ["nodes"]
};

export const ConnectedRectanglesEditorCore: React.FC<ConnectedRectanglesEditorCoreProps> = ({ jsonInput, onChange, error }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>Connected Rectangles Config</div>
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
