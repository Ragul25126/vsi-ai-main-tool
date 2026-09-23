import { describe, expect, it } from "vitest";
import { assertPublicUrl, UnsafeUrlError } from "./safe-fetch";

describe("assertPublicUrl", () => {
  it("allows primevideo.com", async () => {
    const url = await assertPublicUrl("https://primevideo.com");
    expect(url.hostname).toBe("primevideo.com");
  });

  it("blocks private hosts", async () => {
    await expect(assertPublicUrl("http://localhost:3000")).rejects.toThrow(UnsafeUrlError);
    await expect(assertPublicUrl("http://127.0.0.1")).rejects.toThrow(UnsafeUrlError);
    await expect(assertPublicUrl("http://169.254.169.254")).rejects.toThrow(UnsafeUrlError);
  });
});
