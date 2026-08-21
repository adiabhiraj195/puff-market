import { useQuery } from "@tanstack/react-query";

export const SERVER_HEALTH_QUERY_KEY = ["serverHealth"];

/**
 * Query hook to check server status for Render cold-start.
 */
export function useServerHealth(options?: { enabled?: boolean }) {
  return useQuery<boolean, Error>({
    queryKey: SERVER_HEALTH_QUERY_KEY,
    queryFn: async () => {
      const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";
      const res = await fetch(`${serverUrl}/api/v1/health`, { method: "GET" }).catch(() => null);
      if (res && res.ok) {
        return true;
      }
      const ping = await fetch(`${serverUrl}/`, { method: "GET" }).catch(() => null);
      return !!(ping && ping.ok);
    },
    enabled: options?.enabled ?? false, // Default manual trigger
    retry: false,
  });
}
