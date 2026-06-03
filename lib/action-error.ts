// Shared catch-handler for result-returning Server Actions (posts.ts, quotes.ts).
// Re-throws nothing: maps a thrown error to the failure branch of ActionResult,
// preserving the existing "Unauthorized" passthrough and console logging.
// `logLabel` defaults to `message`; pass it when the log prefix differs from the
// user-facing message (e.g. quote image uploads).
export function handleActionError(
  error: unknown,
  message: string,
  logLabel: string = message,
): { success: false; error: string } {
  if (error instanceof Error && error.message === "Unauthorized") {
    return { success: false, error: "Unauthorized" }
  }
  console.error(`${logLabel}:`, error)
  return { success: false, error: message }
}
