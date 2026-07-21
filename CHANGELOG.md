# Changelog

## [1.2.0] - 2026-07-21

### Added
- **Workflow y documentación del proyecto endurecidos:** Nuevas reglas permanentes en `AGENTS.md` (git flow estricto, política de migraciones, dependencias, arquitectura por capas, documentación viva, reporte de cierre obligatorio, principios generales)
- **Sección Alumnos en panel admin:** Nueva página `/admin/alumnos` con tabla responsive de todos los alumnos registrados, incluyendo datos físicos, número de reservas y fecha de registro. Nuevo endpoint `GET /api/admin/users` protegido para admin.

## [1.1.0] - 2026-06-22

### Fixed
- **SessionsManager modal consistency:** Replaced native `confirm()` with custom modal matching the rest of the app's pattern
- **User cancel HTTP method:** Changed DELETE to PATCH for consistent soft cancel (coherent with admin cancel behavior)
- **Math.max guards on weight/height:** Added `Math.max(0, ...)` guards on register and profile PATCH routes to prevent negative values
- **DeleteBookingButton error feedback:** Replaced silent error swallowing with user-facing error messages on delete failure
- **Phone input HTML5 validation:** Added `pattern="\d{9}"` on register phone input for immediate client-side feedback

## [1.0.0] - 2026-06-15

Initial production release.
