import React, { useState, useEffect } from 'react';
import { FiTrash, FiEdit2, FiUpload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { listAvatars, uploadAvatar, deleteAvatar, renameAvatar, getAvatarUrl } from '../../api/session';

interface SessionSettingsProps {
    sessionName: string;
}

export const SessionSettings: React.FC<SessionSettingsProps> = ({ sessionName }) => {
    const [avatars, setAvatars] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [renameTarget, setRenameTarget] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState('');

    useEffect(() => {
        if (sessionName) {
            loadAvatars();
        }
    }, [sessionName]);

    const loadAvatars = async () => {
        setLoading(true);
        try {
            const list = await listAvatars(sessionName);
            setAvatars(list || []);
        } catch (e) {
            toast.error('Failed to load avatars');
            setAvatars([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const toastId = toast.loading('Uploading...');
        try {
            await uploadAvatar(sessionName, file.name, file);
            toast.success('Uploaded', { id: toastId });
            loadAvatars();
        } catch (e: any) {
            toast.error(e.message || 'Upload failed', { id: toastId });
        }
        // Reset input
        e.target.value = '';
    };

    const handleDelete = async (name: string) => {
        if (!confirm(`Delete avatar ${name}?`)) return;
        try {
            await deleteAvatar(sessionName, name);
            toast.success('Deleted');
            loadAvatars();
        } catch (e) {
            toast.error('Delete failed');
        }
    };

    const startRename = (name: string) => {
        setRenameTarget(name);
        setRenameValue(name);
    };

    const handleRename = async () => {
        if (!renameTarget || !renameValue || renameTarget === renameValue) {
            setRenameTarget(null);
            return;
        }

        try {
            await renameAvatar(sessionName, renameTarget, renameValue);
            toast.success('Renamed');
            setRenameTarget(null);
            loadAvatars();
        } catch (e: any) {
            toast.error(e.message || 'Rename failed');
        }
    };

    return (
        <div style={{ padding: '20px', height: '100%', overflowY: 'auto', backgroundColor: '#fff' }}>
            <div style={{ marginBottom: '15px' }}>
                <h3 style={{ margin: 0 }}>Session Settings: {sessionName}</h3>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 10px 0' }}>Avatars</h4>

                <div style={{ marginBottom: '10px' }}>
                    <label style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '6px 12px',
                        backgroundColor: '#f0f0f0',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.9em'
                    }}>
                        <FiUpload /> Upload Avatar
                        <input type="file" style={{ display: 'none' }} onChange={handleUpload} accept="image/*" />
                    </label>
                </div>

                {loading ? <div>Loading...</div> : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
                        {avatars && avatars.map(name => (
                            <div key={name} style={{ border: '1px solid #eee', borderRadius: '4px', padding: '5px', textAlign: 'center' }}>
                                <div style={{ height: '80px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '5px', backgroundColor: '#f9f9f9' }}>
                                    <img
                                        src={getAvatarUrl(sessionName, name)}
                                        alt={name}
                                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                    />
                                </div>

                                {renameTarget === name ? (
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <input
                                            type="text"
                                            value={renameValue}
                                            onChange={(e) => setRenameValue(e.target.value)}
                                            style={{ width: '100%', padding: '2px', fontSize: '0.8em' }}
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleRename();
                                                if (e.key === 'Escape') setRenameTarget(null);
                                            }}
                                            onBlur={handleRename}
                                        />
                                    </div>
                                ) : (
                                    <div style={{ fontSize: '0.8em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '5px' }} title={name}>
                                        {name}
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                    <button
                                        onClick={() => startRename(name)}
                                        title="Rename"
                                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#666' }}
                                    >
                                        <FiEdit2 size={12} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(name)}
                                        title="Delete"
                                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#d32f2f' }}
                                    >
                                        <FiTrash size={12} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {(!avatars || avatars.length === 0) && <div style={{ color: '#888', gridColumn: '1/-1', textAlign: 'center', padding: '20px' }}>No avatars uploaded</div>}
                    </div>
                )}
            </div>
        </div>
    );
};

