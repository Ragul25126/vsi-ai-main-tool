export interface ClientItem {
  id: string;
  name: string;
  brand_name: string;
  website: string;
  service_type: "seo" | "geo" | "seo_geo";
  country: string;
  industry: string;
  default_location?: string;
  keywords: number;
  winRate: number;
  tasks: number;
  created_at?: string;
}

const CUSTOM_CLIENTS_KEY = "searchintel_custom_clients";

export function getCustomClients(): ClientItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CUSTOM_CLIENTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ClientItem[];
  } catch (err) {
    console.error("Failed to parse custom clients from localStorage:", err);
    return [];
  }
}

export function saveCustomClient(client: ClientItem, keywords: any[] = []): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getCustomClients();
    // Prepend or replace if ID exists
    const filtered = existing.filter((c) => c.id !== client.id);
    const updated = [client, ...filtered];
    localStorage.setItem(CUSTOM_CLIENTS_KEY, JSON.stringify(updated));

    if (keywords.length > 0) {
      localStorage.setItem(`searchintel_keywords_${client.id}`, JSON.stringify(keywords));
    }

    // Trigger storage event for live reactive updates across components
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("clients_updated"));
  } catch (err) {
    console.error("Failed to save custom client to localStorage:", err);
  }
}

export function getAllClients(defaultClients: ClientItem[] = []): ClientItem[] {
  const custom = getCustomClients();
  const customIds = new Set(custom.map((c) => c.id));
  const filteredDefault = defaultClients.filter((c) => !customIds.has(c.id));
  return [...custom, ...filteredDefault];
}
