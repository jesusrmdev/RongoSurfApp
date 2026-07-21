# Changelog

## [1.2.0] - 2026-07-21

### Added
- **Hardened project workflow and documentation:** New permanent rules in `AGENTS.md` (strict git flow, migration policy, dependency policy, layered architecture, living documentation, mandatory closing report, general principles)
- **Students section in admin panel:** New `/admin/alumnos` page with responsive table of all registered users, including physical data, booking count, and registration date. New endpoint `GET /api/admin/users` (admin-only).
- **Persistent booking counter per student:** New `totalBookings` field on User model. Incremented on booking creation, decremented on cancel (before session), not decremented on past booking deletion. Migration with backfill from existing data.

## [1.1.0] - 2026-06-22

### Fixed
- **SessionsManager modal consistency:** Replaced native `confirm()` with custom modal matching the rest of the app's pattern
- **User cancel HTTP method:** Changed DELETE to PATCH for consistent soft cancel (coherent with admin cancel behavior)
- **Math.max guards on weight/height:** Added `Math.max(0, ...)` guards on register and profile PATCH routes to prevent negative values
- **DeleteBookingButton error feedback:** Replaced silent error swallowing with user-facing error messages on delete failure
- **Phone input HTML5 validation:** Added `pattern="\d{9}"` on register phone input for immediate client-side feedback

## [1.0.0] - 2026-06-15

Initial production release.
