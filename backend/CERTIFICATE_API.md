# Certificate Generation API

Dynamic PDF certificate generation for course completions. Integrated into the
existing E-Learning Platform backend.

## Architecture

Clean separation of concerns across the existing layered structure:

```
backend/
├── routes/
│   └── certificates.js              # Route definition + auth wiring
├── controllers/
│   └── certificateController.js     # HTTP layer — request/response, headers
├── services/
│   ├── certificateService.js        # Business logic — auth checks, DB access
│   └── certificatePdfService.js     # PDFKit rendering
├── middleware/
│   └── auth.js                      # Existing JWT `protect` middleware
├── config/
│   └── database.js                  # Existing pg Pool
└── scripts/
    └── initDatabase.js              # Now includes `certificates` table
```

- **routes** → HTTP method + path + middleware chain only.
- **controllers** → HTTP concerns (status codes, headers, streaming).
- **services/certificateService** → DB queries + completion verification.
- **services/certificatePdfService** → Pure PDFKit rendering, no DB knowledge.

## Endpoint

### `GET /api/certificates/:courseId`

Returns a downloadable PDF certificate for the authenticated student.

| Header | Value |
|---|---|
| `Authorization` | `Bearer <jwt>` |

#### Success (200)
- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename="certificate-<course>.pdf"`
- Body: binary PDF stream (A4 landscape)

#### Error responses

| Status | When |
|---|---|
| 400 | `courseId` is not a positive integer |
| 401 | Missing / invalid / expired JWT |
| 403 | Authenticated user is not enrolled, OR enrollment is not yet complete |
| 404 | Course does not exist |
| 500 | Server error during DB lookup or PDF generation |

Error body shape:
```json
{ "success": false, "message": "Course not found" }
```

## Database schema

A new `certificates` table tracks issued certificates. The schema reuses the
existing `users(id)` and `courses(id)` integer primary keys for FK consistency,
and stores a separate `certificate_uuid` for the public-facing certificate ID
that is printed on the PDF.

```sql
CREATE TABLE IF NOT EXISTS certificates (
  id                SERIAL PRIMARY KEY,
  certificate_uuid  UUID UNIQUE NOT NULL,
  user_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id         INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  completion_date   TIMESTAMPTZ NOT NULL,
  generated_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  file_path         TEXT,
  UNIQUE(user_id, course_id)
);
```

The `UNIQUE(user_id, course_id)` constraint means re-hitting the endpoint
returns the **same certificate UUID** every time — the certificate is stable
across downloads.

For reference, the related tables already in the system:

```sql
-- users
id SERIAL PRIMARY KEY, email VARCHAR(255), full_name VARCHAR(255),
password VARCHAR(255), role VARCHAR(20), created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ

-- courses
id SERIAL PRIMARY KEY, title TEXT, slug TEXT, description TEXT,
instructor_id INTEGER, ...

-- enrollments
id SERIAL PRIMARY KEY, student_id INTEGER, course_id INTEGER,
progress INTEGER, completed_at TIMESTAMPTZ, ...
```

A course is considered "completed" when `enrollments.completed_at IS NOT NULL`
OR `enrollments.progress >= 100`.

## Setup

1. Install new dependencies (already done by the integration step):
   ```bash
   npm install pdfkit uuid
   ```

2. Run the DB init script to create the `certificates` table:
   ```bash
   npm run db:init
   ```

3. Start the server:
   ```bash
   npm run dev
   ```

## Testing the endpoint

### cURL

```bash
# 1. Log in to get a JWT
curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"password123"}'

# 2. Download the certificate for course 1 to a local file
curl -X GET http://localhost:5000/api/certificates/1 \
  -H "Authorization: Bearer <JWT_FROM_STEP_1>" \
  -o certificate.pdf
```

If the response is JSON instead of a PDF, open `certificate.pdf` in a text
editor — that's the error body.

### Postman

The collection `postman_collection.json` ships with a **Certificates →
Download Certificate (PDF)** request. Use **Send and Download** instead of
**Send** so Postman saves the binary response to disk.

## What's on the certificate

A4 landscape, professional centered layout, double border (navy outer +
gold inner) with corner ornaments, plus:

- Header label: `E-LEARNING PLATFORM`
- Title: **CERTIFICATE OF COMPLETION**
- Student full name (from `users.full_name`)
- Course title (from `courses.title`)
- Completion date (from `enrollments.completed_at`)
- Authorized-signature line (decorative)
- Footer: `Certificate ID: <uuid>` — the verifiable UUID
