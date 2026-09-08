# Offline behavior

Focal persons can opt in during sign-in or choose Prepare offline access on their home screen. Saving or sending a report also prepares the required account-scoped local state. Work is stored in IndexedDB under the workspace and user ID; it is not counted as a submitted report until a server receipt is returned.

The application caches only non-personal HTML, styles, JavaScript and the manifest. It never caches protected API responses, exports, sessions, or evidence. After online preparation, the browser can restart offline, reopen a saved draft, edit it, and explicitly queue it. First-ever offline sign-in is unsupported. Administrative decisions require the server.

Queued payloads retain a stable client ID across retries. Each image has a stable upload identifier; a successful canonical upload can be reused after a lost response. The report is committed only after selected evidence is ready. The database stores an actor-scoped payload hash and returns the same logical result for identical retries. Changed payloads conflict. Browser locks coordinate tabs; database idempotency is the final guard.

The app tries explicitly queued entries when opened online or connectivity returns. Retryable failures can be retried manually. It does not promise background sending while closed or an automatic exponential-backoff scheduler. Authentication, permission, and content conflicts are shown separately; blocked drafts are preserved. Making a copy creates a new local identifier.

Signing out warns about unsent drafts and clears that account's local drafts after confirmation. Session expiration preserves drafts for the same account; another login cannot list or send them. Clearing site storage or browser eviction can destroy unsent work. Persistent storage is requested where supported, not guaranteed. IndexedDB is not application-encrypted, and offline revocation cannot remotely wipe a disconnected device.

Executed evidence: the production-browser suite closes Chromium, reopens the same profile without a network, recovers and edits a saved draft, queues it, reconnects, and verifies that sending finishes. A physical Android/iPhone test remains pending.
