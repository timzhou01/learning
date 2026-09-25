# Backend Rules

- Follow the existing backend module structure and naming conventions.
- Keep controller, service, repository, and domain responsibilities separated when the project already uses these layers.
- Keep business logic out of controllers.
- Keep database access inside repository or data-access layers.
- Reuse existing services, repositories, middleware, and utilities before creating new abstractions.
- Validate external input at system boundaries.
- Return consistent error shapes and status codes.
- Avoid hiding business logic inside generic helpers.
- Keep functions focused and easy to test.
- Preserve existing transaction and error-handling behavior.
- Avoid introducing new dependencies unless there is a clear need.
- Add or update tests when the affected backend module has test coverage.