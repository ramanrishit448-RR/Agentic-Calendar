export type ConnectionStatus = "connected" | "disconnected" | "pending";

export type ConnectionInfo = {
  label: string;
  status: ConnectionStatus;
};
