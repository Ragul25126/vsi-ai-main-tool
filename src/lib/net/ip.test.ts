import { describe, expect, it } from "vitest";
import { isPublicAddress } from "./ip";

describe("isPublicAddress", () => {
  it.each(["8.8.8.8", "1.1.1.1", "104.16.0.1", "2606:4700::1111"])("allows public %s", (ip) => {
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
