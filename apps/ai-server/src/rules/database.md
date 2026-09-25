# Database Rules

- Follow the existing schema, migration, and repository conventions.
- Prefer explicit and readable queries over overly clever abstractions.
- Add database constraints when they represent real business invariants.
- Use transactions when multiple writes must succeed or fail together.
- Avoid N+1 queries and unnecessary repeated database calls.
- Be careful with read-after-write consistency when the system uses replicas.
- Keep schema changes backward-compatible when possible.
- Do not remove or rename columns without considering existing data and callers.
- Add indexes only when supported by actual query patterns.
- Avoid loading unnecessary columns or large result sets.
- Preserve existing pagination, ordering, and filtering behavior.
- Make migrations deterministic and safe to run repeatedly through the normal deployment process.