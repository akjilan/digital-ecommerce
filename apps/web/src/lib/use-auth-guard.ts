import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";

/**
 * useAuthGuard
 *
 * @param requireAuth  true  → user MUST be logged in  (private route)
 *                     false → user MUST be logged out (public/auth route)
 * @param redirectTo   where to send the user if the condition is NOT met
 *
 * Returns `checking: true` while the guard is deciding, so the caller can
 * render a spinner instead of briefly flashing the wrong page.
 */
export function useAuthGuard(requireAuth: boolean, redirectTo: string) {
    const router = useRouter();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const hasToken = Boolean(getToken());

        if (requireAuth && !hasToken) {
            // Private route — not logged in → send to login
            router.replace(redirectTo);
        } else if (!requireAuth && hasToken) {
            // Public/auth route — already logged in → send home (or wherever)
            router.replace(redirectTo);
        } else {
            // Condition satisfied — let the page render
            setChecking(false);
        }
    }, [requireAuth, redirectTo, router]);

    return { checking };
}
