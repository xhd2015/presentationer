export const PageKind = {
    Code: 'code',
    ChatThread: 'chat_thread',
    Chart: 'chart',
} as const;

export type PageKind = typeof PageKind[keyof typeof PageKind];

export interface Page {
    id: string;
    title: string;
    kind: PageKind;
    content: any;
}

export interface Session {
    name: string;
    lastModified: string;
    pages?: Page[];
}

export async function listSessions(signal?: AbortSignal): Promise<Session[]> {
    const res = await fetch('/api/sessions/list', { signal });
    if (!res.ok) throw new Error('Failed to fetch sessions');
    return res.json();
}

export async function createSession(name: string, pages: Page[]): Promise<void> {
    const res = await fetch('/api/sessions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, pages }),
    });
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
    }
}

export async function updateSession(name: string, pages: Page[]): Promise<void> {
    const res = await fetch('/api/sessions/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, pages }),
    });
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
    }
}

export async function renameSession(oldName: string, newName: string): Promise<void> {
    const res = await fetch('/api/sessions/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ old: oldName, new: newName }),
    });
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
    }
}

export async function deleteSession(name: string): Promise<void> {
    const res = await fetch(`/api/sessions/delete?name=${encodeURIComponent(name)}`, {
        method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to delete session');
}

export async function getSession(name: string): Promise<Session> {
    const res = await fetch(`/api/sessions/get?name=${encodeURIComponent(name)}`);
    if (!res.ok) throw new Error('Failed to load session');
    return res.json();
}

export async function createPage(sessionName: string, page: Page): Promise<void> {
    const res = await fetch(`/api/sessions/page/create?session=${encodeURIComponent(sessionName)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(page),
    });
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
    }
}

export async function updatePage(sessionName: string, page: Page): Promise<void> {
    const res = await fetch(`/api/sessions/page/update?session=${encodeURIComponent(sessionName)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(page),
    });
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
    }
}

export async function deletePage(sessionName: string, pageId: string): Promise<void> {
    const res = await fetch(`/api/sessions/page/delete?session=${encodeURIComponent(sessionName)}&id=${encodeURIComponent(pageId)}`, {
        method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to delete page');
}

// Avatar APIs
export async function uploadAvatar(sessionName: string, avatarName: string, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`/api/sessions/avatar/upload?session=${encodeURIComponent(sessionName)}&name=${encodeURIComponent(avatarName)}`, {
        method: 'POST',
        body: formData,
    });
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
    }
}

export async function listAvatars(sessionName: string): Promise<string[]> {
    const res = await fetch(`/api/sessions/avatar/list?session=${encodeURIComponent(sessionName)}`);
    if (!res.ok) throw new Error('Failed to list avatars');
    return res.json();
}

export async function deleteAvatar(sessionName: string, avatarName: string): Promise<void> {
    const res = await fetch(`/api/sessions/avatar/delete?session=${encodeURIComponent(sessionName)}&name=${encodeURIComponent(avatarName)}`, {
        method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete avatar');
}

export async function renameAvatar(sessionName: string, oldName: string, newName: string): Promise<void> {
    const res = await fetch(`/api/sessions/avatar/rename?session=${encodeURIComponent(sessionName)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ old: oldName, new: newName }),
    });
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
    }
}

export function getAvatarUrl(sessionName: string, avatarName: string): string {
    return `/api/sessions/avatar/get?session=${encodeURIComponent(sessionName)}&name=${encodeURIComponent(avatarName)}`;
}
