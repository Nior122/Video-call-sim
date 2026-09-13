// Centralized Persona Online/Offline and Last Seen status manager

export interface PersonaOnlineStatus {
  isOnline: boolean;
  statusText: string;
  lastSeenText: string;
}

// Preset default schedules / realistic statuses based on slug
const DEFAULT_STATUS_MAP: Record<string, { isOnline: boolean; lastSeenMinutes: number }> = {
  pinkchyu: { isOnline: true, lastSeenMinutes: 0 },
  bigtittygothegg: { isOnline: true, lastSeenMinutes: 0 },
};

function formatLastSeen(minutesAgo: number): string {
  if (minutesAgo <= 1) return "1m ago";
  if (minutesAgo < 60) return `${minutesAgo}m ago`;
  const hours = Math.floor(minutesAgo / 60);
  if (hours === 1) return "1h ago";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "yesterday" : `${days}d ago`;
}

// In-memory status store with fallback to localStorage
const statusListeners = new Set<(slug: string, status: PersonaOnlineStatus) => void>();

export function getPersonaOnlineStatus(slug?: string | null): PersonaOnlineStatus {
  if (!slug) {
    return { isOnline: true, statusText: "Online", lastSeenText: "Just now" };
  }

  const key = `persona_status_${slug.toLowerCase()}`;
  const stored = typeof window !== "undefined" ? localStorage.getItem(key) : null;

  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return {
        isOnline: parsed.isOnline,
        statusText: parsed.isOnline ? "Online" : `Last seen ${parsed.lastSeenText || "recently"}`,
        lastSeenText: parsed.lastSeenText || "recently",
      };
    } catch {
      // Fallback
    }
  }

  // Fallback to preset map or hash
  const preset = DEFAULT_STATUS_MAP[slug.toLowerCase()];
  if (preset) {
    return {
      isOnline: preset.isOnline,
      statusText: preset.isOnline ? "Online" : `Last seen ${formatLastSeen(preset.lastSeenMinutes)}`,
      lastSeenText: formatLastSeen(preset.lastSeenMinutes),
    };
  }

  // Deterministic fallback based on slug hash
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash << 5) - hash + slug.charCodeAt(i);
  }
  const isOnline = Math.abs(hash) % 2 === 0;
  const minutesAgo = (Math.abs(hash) % 180) + 5;

  return {
    isOnline,
    statusText: isOnline ? "Online" : `Last seen ${formatLastSeen(minutesAgo)}`,
    lastSeenText: formatLastSeen(minutesAgo),
  };
}

export function setPersonaOnlineStatus(
  slug: string,
  isOnline: boolean,
  lastSeenMinutes: number = 2
): PersonaOnlineStatus {
  const lastSeenText = isOnline ? "Just now" : formatLastSeen(lastSeenMinutes);
  const status: PersonaOnlineStatus = {
    isOnline,
    statusText: isOnline ? "Online" : `Last seen ${lastSeenText}`,
    lastSeenText,
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(
      `persona_status_${slug.toLowerCase()}`,
      JSON.stringify({ isOnline, lastSeenText })
    );
  }

  statusListeners.forEach((listener) => listener(slug.toLowerCase(), status));
  return status;
}

export function togglePersonaOnlineStatus(slug: string): PersonaOnlineStatus {
  const current = getPersonaOnlineStatus(slug);
  return setPersonaOnlineStatus(slug, !current.isOnline, current.isOnline ? 3 : 0);
}

export function subscribeToPersonaStatus(
  callback: (slug: string, status: PersonaOnlineStatus) => void
) {
  statusListeners.add(callback);
  return () => {
    statusListeners.delete(callback);
  };
}
