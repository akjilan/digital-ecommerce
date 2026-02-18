// ─── Types ───────────────────────────────────────────────────────────────────

export interface User {
    id: string;
    name: string;
    email: string;
    role: "user" | "admin";
}

export interface AuthState {
    user: User | null;
    token: string | null;
}

// ─── Storage keys ────────────────────────────────────────────────────────────

const TOKEN_KEY = "ec_token";
const USER_KEY = "ec_user";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isBrowser() {
    return typeof window !== "undefined";
}

export function getToken(): string | null {
    if (!isBrowser()) return null;
    return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): User | null {
    if (!isBrowser()) return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as User;
    } catch {
        return null;
    }
}

export function setAuth(user: User, token: string) {
    if (!isBrowser()) return;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    // Dispatch event so other components can react
    window.dispatchEvent(new Event("auth-change"));
}

export function clearAuth() {
    if (!isBrowser()) return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.dispatchEvent(new Event("auth-change"));
}

// ─── API calls ───────────────────────────────────────────────────────────────

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

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
    const data = (await res.json()) as T & { message?: string };
    if (!res.ok) {
        throw new Error((data as { message?: string }).message ?? "Request failed");
    }
    return data;
}

export interface AuthResponse {
    user: User;
    accessToken: string;
}

export async function apiRegister(name: string, email: string, password: string): Promise<AuthResponse> {
    return apiFetch<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
    });
}

export async function apiLogin(email: string, password: string): Promise<AuthResponse> {
    return apiFetch<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });
}

export async function apiMe(token: string): Promise<{ user: User }> {
    return apiFetch<{ user: User }>("/auth/me", {}, token);
}

export async function apiUpdateProfile(
    token: string,
    data: { name?: string; password?: string },
): Promise<{ user: User }> {
    return apiFetch<{ user: User }>("/users/me", { method: "PATCH", body: JSON.stringify(data) }, token);
}
