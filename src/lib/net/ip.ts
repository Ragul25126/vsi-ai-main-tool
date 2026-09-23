import { isIPv4, isIPv6 } from "node:net";

function ipv4ToInt(ip: string): number {
  return ip.split(".").reduce((acc, part) => (acc << 8) + Number(part), 0) >>> 0;
}

const V4_BLOCKED: Array<[string, number]> = [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
];

function inV4Range(ip: string, base: string, bits: number): boolean {
  const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
  return (ipv4ToInt(ip) & mask) === (ipv4ToInt(base) & mask);
}

function extractNat64Ipv4(ip: string): string | null {
  const v = ip.toLowerCase();
  const prefixMatch = v.match(/^64:ff9b:(?:0:0:0:0:|:)(.+)$/);
  if (!prefixMatch) return null;
  const suffix = prefixMatch[1];

  if (isIPv4(suffix)) {
    return suffix;
  }

  const hexParts = suffix.split(":");
  if (hexParts.length === 2 && hexParts.every((p) => /^[0-9a-f]{1,4}$/.test(p))) {
    const high = parseInt(hexParts[0], 16);
    const low = parseInt(hexParts[1], 16);
    const b0 = (high >> 8) & 0xff;
    const b1 = high & 0xff;
    const b2 = (low >> 8) & 0xff;
    const b3 = low & 0xff;
    return `${b0}.${b1}.${b2}.${b3}`;
  }

  if (hexParts.length === 1 && /^[0-9a-f]{1,4}$/.test(hexParts[0])) {
    const low = parseInt(hexParts[0], 16);
    const b2 = (low >> 8) & 0xff;
    const b3 = low & 0xff;
    return `0.0.${b2}.${b3}`;
  }

  return null;
}

/** True only for addresses on the public internet. */
export function isPublicAddress(ip: string): boolean {
  if (isIPv4(ip)) {
    return !V4_BLOCKED.some(([base, bits]) => inV4Range(ip, base, bits));
  }
  if (isIPv6(ip)) {
    const v = ip.toLowerCase();
    if (v === "::" || v === "::1") return false;
    const mapped = v.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPublicAddress(mapped[1]);
    const nat64 = extractNat64Ipv4(v);
    if (nat64) return isPublicAddress(nat64);
    const first = parseInt(v.split(":")[0] || "0", 16);
    if ((first & 0xfe00) === 0xfc00) return false; // fc00::/7 unique local
    if ((first & 0xffc0) === 0xfe80) return false; // fe80::/10 link local
    if ((first & 0xff00) === 0xff00) return false; // ff00::/8 multicast
    if (v.startsWith("64:ff9b:") || v.startsWith("2001:db8:")) return false;
    return true;
  }
  return false;
}

