import { describe, expect, it, vi } from "vitest";
import { coalesce } from "./coalesce";

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((r) => (resolve = r));
  return { promise, resolve };
}

describe("coalesce", () => {
  it("runs once for a single call", async () => {
    const run = vi.fn(async () => {});
    await coalesce(run)();
    expect(run).toHaveBeenCalledTimes(1);
  });

  it("turns a burst of calls during a run into one follow-up run", async () => {
    const gates = [deferred(), deferred()];
    let n = 0;
    const run = vi.fn(() => gates[n++].promise);
    const refresh = coalesce(run);

    const first = refresh();
    refresh();
    refresh();
    refresh();
    expect(run).toHaveBeenCalledTimes(1);

    gates[0].resolve();
    await Promise.resolve();
    await Promise.resolve();
    expect(run).toHaveBeenCalledTimes(2);

    gates[1].resolve();
    await first;
    expect(run).toHaveBeenCalledTimes(2);
  });

  it("starts fresh after the previous run settles", async () => {
    const run = vi.fn(async () => {});
    const refresh = coalesce(run);
    await refresh();
    await refresh();
    expect(run).toHaveBeenCalledTimes(2);
  });

  it("recovers after a failed run", async () => {
    const run = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValue(undefined);
    const refresh = coalesce(run);
    await expect(refresh()).rejects.toThrow("offline");
    await refresh();
    expect(run).toHaveBeenCalledTimes(2);
  });
});
