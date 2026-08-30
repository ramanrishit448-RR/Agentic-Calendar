"use client";

import ChatPanel from "@/components/dashboard/chat-panel";
import ConnectionsPanel from "@/components/dashboard/connection-panel";
import { Button } from "@/components/ui/button";
import { useDescope, useSession, useUser } from "@descope/nextjs-sdk/client";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const styles = {
  loadingShell:
    "app-shell-bg flex h-svh items-center justify-center text-sm text-muted-foreground",
  shell: "app-shell-bg",
  userLabel: "mb-2 truncate px-1 text-sm text-muted-foreground",
  logoutBtn:
    "w-full justify-start gap-2 text-muted-foreground hover:text-foreground",
  logoutIcon: "size-4",
} as const;

function DashboardPage() {
  const sdk = useDescope();
  const router = useRouter();
  const { isAuthenticated, sessionToken } = useSession();
  const { user, isUserLoading } = useUser();
  const [loggingOut, setLoggingout] = useState(false);

  const label = user?.email || user?.name || "Signed in User";

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingout(true);

    try {
      await sdk.logout();
      router.replace("/sign-in");
      router.refresh();
    } catch {
      setLoggingout(false);
    }
  }

  if (!isAuthenticated || !sessionToken) {
    return <div className={styles.loadingShell}>Checking session...</div>;
  }

  return (
    <div className={styles.shell}>
      <ChatPanel
        sessionToken={sessionToken}
        connections={<ConnectionsPanel sessionToken={sessionToken} />}
        footer={
          <>
            <div className={styles.userLabel}>
              {isUserLoading ? "Loading..." : label}
            </div>
            <Button
              variant="ghost"
              className={styles.logoutBtn}
              disabled={loggingOut}
              onClick={() => handleLogout()}
            >
              <LogOut className={styles.logoutIcon} />
              {loggingOut ? "Logging out..." : "Log out"}
            </Button>
          </>
        }
      />
    </div>
  );
}

export default DashboardPage;
