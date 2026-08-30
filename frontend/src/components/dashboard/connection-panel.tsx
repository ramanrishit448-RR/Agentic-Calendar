"use client";

import { ConnectionInfo } from "@/lib/types";
import { useCallback, useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";
import { CalendarDays, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import {
  connectCalendar,
  fetchCalendarConnection,
  refreshCalendarConnection,
} from "@/lib/connections";

const styles = {
  root: "space-y-1.5",
  title: "px-0.5 text-sm font-semibold text-sidebar-foreground",
  error: "text-xs text-destructive",
  skeleton: "h-11 w-full rounded-xl",
  row: "flex items-center gap-2 rounded-xl bg-sidebar-accent/50 px-2 py-2",
  iconBox: "flex size-8 shrink-0 items-center justify-center rounded-lg",
  iconBoxConnected: "bg-primary text-primary-foreground",
  iconBoxDisconnected: "bg-card text-muted-foreground ring-1 ring-border",
  icon: "size-4",
  meta: "min-w-0 flex-1",
  label: "truncate text-sm font-semibold leading-tight",
  status: "mt-0.5 text-xs font-medium",
  statusConnected: "text-primary",
  statusDisconnected: "text-muted-foreground",
  actionBtn: "h-8 shrink-0 px-2.5",
  refreshBtn: "shrink-0",
  refreshIcon: "size-3.5",
} as const;

function statusLabel(status: ConnectionInfo["status"]) {
  if (status === "connected") return "Connected";
  if (status === "pending") return "Pending";

  return "Not Connected";
}

function ConnectionsPanel({ sessionToken }: { sessionToken: string }) {
  const [connection, setConnection] = useState<ConnectionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const handleLoadCalendarConnection = useCallback(async () => {
    setLoading(true);

    try {
      setConnection(await fetchCalendarConnection(sessionToken));
    } catch {
      console.log("failed to load calendar connection");
    } finally {
      setLoading(false);
    }
  }, [sessionToken]);

  useEffect(() => {
    handleLoadCalendarConnection();
  }, [handleLoadCalendarConnection]);

  async function handleCalendarConnect() {
    setBusy(true);
    try {
      await connectCalendar(sessionToken);
    } catch {
      console.log("failed to connect");
    }
  }

  async function handleCalendarRefresh() {
    setBusy(true);

    try {
      await refreshCalendarConnection(sessionToken);
      await handleLoadCalendarConnection();
    } catch {
      console.log("failed to refresh");
    } finally {
      setBusy(false);
    }
  }

  const connected = connection?.status === "connected";

  return (
    <div className={styles.root}>
      <p className={styles.title}>Connections</p>

      {loading || !connection ? (
        <Skeleton className={styles.skeleton} />
      ) : (
        <div className={styles.row}>
          <div
            className={cn(
              styles.iconBox,
              connected ? styles.iconBoxConnected : styles.iconBoxDisconnected,
            )}
          >
            <CalendarDays className={styles.icon} />
          </div>
          <div className={styles.meta}>
            <p className={styles.label}>{connection.label}</p>

            <p
              className={cn(
                styles.status,
                connected ? styles.statusConnected : styles.statusDisconnected,
              )}
            >
              {statusLabel(connection.status)}
            </p>
          </div>
          <Button
            size="sm"
            variant={connected ? "ghost" : "default"}
            className={styles.actionBtn}
            disabled={busy}
            onClick={() => handleCalendarConnect()}
          >
            {connected ? "Reconnect" : "Connect"}
          </Button>

          <Button
            size="icon-sm"
            variant={"ghost"}
            className={styles.refreshBtn}
            disabled={busy}
            onClick={() => handleCalendarRefresh()}
          >
            <RefreshCcw className={styles.refreshIcon} />
          </Button>
        </div>
      )}
    </div>
  );
}

export default ConnectionsPanel;
