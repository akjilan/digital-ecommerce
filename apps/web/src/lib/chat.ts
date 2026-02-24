const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    createdAt: string;
}

async function apiFetch<T>(
    path: string,
    options: RequestInit = {},
    token?: string | null,
): Promise<T> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${BASE}${path}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message ?? "Request failed");
    return data as T;
}

/**
 * Send a chat message to the AI.
 * Token is optional — guests can still chat (no DB persistence).
 */
export async function apiSendMessage(
    message: string,
    token?: string | null,
): Promise<{ reply: string }> {
    return apiFetch<{ reply: string }>(
        "/chat/message",
        { method: "POST", body: JSON.stringify({ message }) },
        token,
    );
}

/**
 * Fetch the last 20 chat messages for the authenticated user.
 */
export async function apiGetChatHistory(token: string): Promise<ChatMessage[]> {
    return apiFetch<ChatMessage[]>("/chat/history", {}, token);
}
