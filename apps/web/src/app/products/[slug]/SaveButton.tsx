"use client";

import { useState, useEffect } from "react";
import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getToken, apiToggleWishlist, apiCheckWishlist } from "@/lib/auth";
import { useToast } from "@/components/ui/toaster";
import { useRouter } from "next/navigation";

interface SaveButtonProps {
  productId: string;
}

export function SaveButton({ productId }: SaveButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsLoggedIn(false);
      setLoading(false);
      return;
    }

    setIsLoggedIn(true);
    apiCheckWishlist(token, productId)
      .then((res) => setIsSaved(res.isSaved))
      .catch(() => {
        // silently fail — don't block the UI
      })
      .finally(() => setLoading(false));
  }, [productId]);

  const handleToggle = async () => {
    const token = getToken();
    if (!token) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save products for later.",
        variant: "destructive",
      });
      router.push("/auth/login");
      return;
    }

    setToggling(true);
    try {
      const res = await apiToggleWishlist(token, productId);
      setIsSaved(res.saved);
      toast({
        title: res.saved ? "Saved for later ❤️" : "Removed from saves",
        description: res.saved
          ? "View saved products in your profile."
          : "Product removed from your saved list.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update saved items. Please try again.",
        variant: "destructive",
      });
    } finally {
      setToggling(false);
    }
  };

  // While we're checking auth status, show a minimal placeholder
  if (loading) {
    return (
      <Button variant="outline" size="lg" className="h-12 rounded-xl min-w-[160px]" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  return (
    <Button
      size="lg"
      variant={isSaved ? "default" : "outline"}
      className="h-12 rounded-xl min-w-[160px] transition-all duration-200"
      onClick={handleToggle}
      disabled={toggling}
      title={!isLoggedIn ? "Sign in to save products" : undefined}
    >
      {toggling ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Saving...
        </>
      ) : (
        <>
          <Heart
            className={`mr-2 h-5 w-5 transition-all duration-200 ${isSaved ? "fill-current" : ""}`}
          />
          {isSaved ? "Saved" : "Save for Later"}
        </>
      )}
    </Button>
  );
}
