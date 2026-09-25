# Security Rules

- Follow the project's existing authentication and authorization patterns.
- Never trust client-provided identity, role, permission, or ownership data.
- Enforce authorization on the server for protected operations.
- Validate and sanitize external input at system boundaries.
- Avoid exposing secrets, tokens, credentials, or sensitive internal data.
- Do not log passwords, access tokens, session tokens, or sensitive personal data.
- Use existing security middleware and shared permission utilities when available.
- Apply least-privilege access when reading or modifying protected resources.
- Treat file uploads, redirects, URLs, and user-generated content as untrusted input.
- Preserve existing CSRF, CORS, session, and cookie security behavior.
- Avoid constructing SQL, shell commands, or executable code from untrusted input.
- Return only the data required by the caller.
- Consider audit logging for sensitive or privileged operations when the project already supports it.