/**
 * Wraps an async refresh so overlapping calls share one run.
 *
 * A call made while a run is in flight doesn't start a second request; it
 * schedules exactly one more run after the current one, so the final state
 * still reflects every change that triggered a call. A burst of N calls
 * therefore costs at most two requests instead of N.
 */
export function coalesce(run: () => Promise<void>): () => Promise<void> {
  let inFlight: Promise<void> | null = null;
  let again = false;

  return () => {
    if (inFlight) {
      again = true;
      return inFlight;
    }
    inFlight = (async () => {
      try {
        do {
          again = false;
          await run();
        } while (again);
      } finally {
        inFlight = null;
      }
    })();
    return inFlight;
  };
}
