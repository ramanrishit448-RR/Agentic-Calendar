"use client";

import { useSession } from "@descope/nextjs-sdk/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "../ui/skeleton";

export function RedirectIfAuthenticated({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isSessionLoading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isSessionLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isSessionLoading, router]);

  if (isSessionLoading || isAuthenticated) {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return children;
}
