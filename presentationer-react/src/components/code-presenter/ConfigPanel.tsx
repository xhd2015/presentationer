import React from 'react';
import { MdEdit, MdCheck } from 'react-icons/md';

export interface ConfigItem {
    id: string;
    name: string;
    lines: string;
    isEditing?: boolean;
}

interface ConfigPanelProps {
    exportWidth: string;
    setExportWidth: (width: string) => void;
    exportHeight: string;
    setExportHeight: (height: string) => void;

    configList: ConfigItem[];
    setConfigList: (configs: ConfigItem[]) => void;
    selectedConfigId: string | null;
    setSelectedConfigId: (id: string | null) => void;

    onExportPng?: () => void;
    onCopyPng?: () => void;
    showHtml: boolean;
    setShowHtml: (show: boolean) => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
    exportWidth,
    setExportWidth,
    exportHeight,
    setExportHeight,
    configList,
    setConfigList,
    selectedConfigId,
    setSelectedConfigId,
    onExportPng,
    onCopyPng,
    showHtml,
    setShowHtml,
}) => {
    const [nameEditingId, setNameEditingId] = React.useState<string | null>(null);

    const handleAddConfig = () => {
        const newConfig: ConfigItem = {
            id: Date.now().toString(),
            name: `Config ${configList.length + 1}`,
            lines: '',
            isEditing: true,
        };
        setConfigList([...configList, newConfig]);
        setSelectedConfigId(newConfig.id);
    };

    const handleNameEditToggle = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (nameEditingId === id) {
            setNameEditingId(null);
        } else {
            setNameEditingId(id);
        }
    };

    const handleRemoveConfig = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newConfigs = configList.filter(c => c.id !== id);
        setConfigList(newConfigs);
        if (selectedConfigId === id) {
            setSelectedConfigId(newConfigs.length > 0 ? newConfigs[0].id : null);
        }
    };

    const handleUpdateConfig = (id: string, field: keyof ConfigItem, value: any) => {
        setConfigList(configList.map(c =>
            c.id === id ? { ...c, [field]: value } : c
        ));
    };

    const toggleEdit = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const config = configList.find(c => c.id === id);
        if (config) {
            handleUpdateConfig(id, 'isEditing', !config.isEditing);
        }
    };

    return (
        <>
            <div style={{ border: '1px solid #eee', padding: '10px', borderRadius: '4px' }}>
                <strong>Config:</strong>

                <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                    <label>
                        Width (px):
                        <input
                            type="number"
                            value={exportWidth}
                            onChange={(e) => setExportWidth(e.target.value)}
                            placeholder="Auto"
                            style={{ marginLeft: '5px', width: '80px', padding: '4px' }}
                        />
                    </label>
                    <label>
                        Height (px):
                        <input
                            type="number"
                            value={exportHeight}
                            onChange={(e) => setExportHeight(e.target.value)}
                            placeholder="Auto"
                            style={{ marginLeft: '5px', width: '80px', padding: '4px' }}
                        />
                    </label>
                </div>

                <div style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <strong>Configurations</strong>
                        <button onClick={handleAddConfig} style={{ padding: '4px 8px', cursor: 'pointer', fontSize: '12px' }}>
                            + Add Config
                        </button>
                    </div>

                    {configList.length === 0 ? (
                        <div style={{ color: '#888', fontSize: '14px' }}>No configurations added.</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {configList.map(config => (
                                <div
                                    key={config.id}
                                    onClick={() => setSelectedConfigId(config.id)}
                                    style={{
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        padding: '10px',
                                        backgroundColor: selectedConfigId === config.id ? '#eef' : '#f9f9f9',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: config.isEditing ? '10px' : '0' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                                            {nameEditingId === config.id ? (
                                                <input
                                                    type="text"
                                                    value={config.name}
                                                    onChange={(e) => handleUpdateConfig(config.id, 'name', e.target.value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    onBlur={() => setNameEditingId(null)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') setNameEditingId(null);
                                                    }}
                                                    autoFocus
                                                    style={{ padding: '2px 4px', fontSize: '14px' }}
                                                />
                                            ) : (
                                                <span style={{ fontWeight: selectedConfigId === config.id ? 'bold' : 'normal' }}>
                                                    {config.name}
                                                </span>
                                            )}

                                            <button
                                                onClick={(e) => handleNameEditToggle(config.id, e)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', color: '#666' }}
                                                title={nameEditingId === config.id ? "Save Name" : "Edit Name"}
                                            >
                                                {nameEditingId === config.id ? <MdCheck /> : <MdEdit />}
                                            </button>

                                            {config.lines && !config.isEditing && <span style={{ fontSize: '12px', color: '#666' }}>({config.lines})</span>}
                                        </div>

                                        <div>
                                            <button
                                                onClick={(e) => toggleEdit(config.id, e)}
                                                style={{ marginRight: '5px', fontSize: '12px', padding: '2px 6px', cursor: 'pointer' }}
                                            >
                                                {config.isEditing ? 'Done' : 'Edit Details'}
                                            </button>
                                            <button
                                                onClick={(e) => handleRemoveConfig(config.id, e)}
                                                style={{ color: 'red', fontSize: '12px', padding: '2px 6px', cursor: 'pointer', border: '1px solid #faa', background: '#fff0f0' }}
                                            >
                                                Del
                                            </button>
                                        </div>
                                    </div>

                                    {config.isEditing && (
                                        <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '5px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '12px', marginBottom: '2px' }}>Lines (e.g. 1-3, 5):</label>
                                                <input
                                                    type="text"
                                                    value={config.lines}
                                                    onChange={(e) => handleUpdateConfig(config.id, 'lines', e.target.value)}
                                                    placeholder="1-3, 6"
                                                    style={{ width: '100%', padding: '4px', boxSizing: 'border-box' }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
                {onExportPng && (
                    <button onClick={onExportPng} style={{ padding: '8px 16px', cursor: 'pointer' }}>
                        Export to PNG
                    </button>
                )}
                {onCopyPng && (
                    <button onClick={onCopyPng} style={{ padding: '8px 16px', cursor: 'pointer' }}>
                        Copy PNG
                    </button>
                )}
                <button onClick={() => setShowHtml(!showHtml)} style={{ padding: '8px 16px', cursor: 'pointer' }}>
                    {showHtml ? 'Hide HTML' : 'Show HTML Output'}
                </button>
            </div>
        </>
    );
};
