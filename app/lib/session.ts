const SESSION_ID_KEY = "li_session_id"

/**
 * Returns the persistent anonymous session ID stored in localStorage,
 * creating and persisting one if it doesn't exist yet.
 *
 * Used wherever the API requires an `X-Session-Id` header to track
 * a fan's identity without a login system.
 */
export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return ""
  let id = window.localStorage.getItem(SESSION_ID_KEY)
  if (!id) {
    id =
      crypto.randomUUID?.() ??
      `session-${Date.now()}-${Math.random().toString(36).slice(2)}`
    window.localStorage.setItem(SESSION_ID_KEY, id)
  }
  return id
}
