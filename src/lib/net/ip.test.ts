import { describe, expect, it } from "vitest";
import { isPublicAddress } from "./ip";

describe("isPublicAddress", () => {
  it.each([
    "8.8.8.8",
    "1.1.1.1",
    "104.16.0.1",
    "2606:4700::1111",
    "64:ff9b::12a1:d818", // 18.161.216.24 via NAT64/DNS64
    "64:ff9b::18.161.216.24",
  ])("allows public %s", (ip) => {
    expect(isPublicAddress(ip)).toBe(true);
  });

  it.each([
    "127.0.0.1",
    "10.1.2.3",
    "172.16.0.1",
    "172.31.255.255",
    "192.168.1.1",
    "169.254.169.254",
    "100.64.0.1",
    "0.0.0.0",
    "224.0.0.1",
    "::1",
    "::",
    "fd00::1",
    "fe80::1",
    "::ffff:127.0.0.1",
    "::ffff:10.0.0.1",
    "64:ff9b::7f00:1", // 127.0.0.1 via NAT64
    "64:ff9b::a00:1", // 10.0.0.1 via NAT64
    "64:ff9b::192.168.1.1", // 192.168.1.1 via NAT64
    "64:ff9b::a9fe:a9fe", // 169.254.169.254 (metadata) via NAT64
    "64:ff9b:1::1", // local-use translation prefix
    "2001:db8::1", // documentation prefix
  ])("blocks private %s", (ip) => {
    expect(isPublicAddress(ip)).toBe(false);
  });

  it("treats non-IP strings as not public", () => {
    expect(isPublicAddress("localhost")).toBe(false);
  });

  it("does not block 172.32.x (outside 172.16/12)", () => {
    expect(isPublicAddress("172.32.0.1")).toBe(true);
  });
});

