# Testing Rules

- Follow the existing testing framework and test organization.
- Prefer testing observable behavior over internal implementation details.
- Add tests for new behavior when the affected module already has test coverage.
- Update existing tests when behavior intentionally changes.
- Cover important success, failure, and edge cases.
- Keep tests deterministic and independent from execution order.
- Avoid unnecessary network, filesystem, or database dependencies in unit tests.
- Reuse existing test helpers, fixtures, and factories.
- Keep mocks focused and avoid mocking the behavior being tested.
- Verify validation and error-handling paths for external input.
- Do not weaken existing tests only to make a new implementation pass.
- Run the relevant test, lint, type-check, and build commands before finishing when available.