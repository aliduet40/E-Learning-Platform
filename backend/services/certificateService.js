const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');

// Custom error so the controller can map them to clean HTTP responses
// without leaking SQL details.
class CertificateError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'CertificateError';
  }
}

/**
 * Validates that the user has completed the course, then returns the
 * persisted certificate record (creating one on first request).
 *
 * Returns: { certificateUuid, studentName, courseTitle, completionDate }
 *
 * Throws CertificateError with statusCode 400/404 for the relevant failure modes.
 */
async function getOrCreateCertificate(userId, rawCourseId) {
  const courseId = Number(rawCourseId);
  if (!Number.isInteger(courseId) || courseId <= 0) {
    throw new CertificateError('Invalid course ID', 400);
  }

  // Single round-trip: pull user, course, and enrollment status in one query.
  const lookup = await pool.query(
    `
      SELECT
        u.id            AS user_id,
        u.full_name     AS student_name,
        c.id            AS course_id,
        c.title         AS course_title,
        e.id            AS enrollment_id,
        e.completed_at  AS completion_date,
        e.progress      AS progress
      FROM users u
      CROSS JOIN courses c
      LEFT JOIN enrollments e
        ON e.student_id = u.id AND e.course_id = c.id
      WHERE u.id = $1 AND c.id = $2
    `,
    [userId, courseId]
  );

  if (lookup.rows.length === 0) {
    // Either user or course does not exist. The user is authenticated
    // (middleware enforces that), so it has to be the course.
    throw new CertificateError('Course not found', 404);
  }

  const row = lookup.rows[0];

  if (!row.enrollment_id) {
    throw new CertificateError('You are not enrolled in this course', 403);
  }

  // Treat the course as complete if the enrollment has a completed_at timestamp
  // OR progress is at 100%. This matches the platform's existing semantics.
  const isCompleted = Boolean(row.completion_date) || Number(row.progress) >= 100;
  if (!isCompleted) {
    throw new CertificateError(
      'You have not completed this course yet',
      403
    );
  }

  const completionDate = row.completion_date || new Date();

  // Return existing certificate if one was already issued.
  const existing = await pool.query(
    'SELECT certificate_uuid, completion_date FROM certificates WHERE user_id = $1 AND course_id = $2',
    [userId, courseId]
  );

  if (existing.rows.length > 0) {
    return {
      certificateUuid: existing.rows[0].certificate_uuid,
      studentName: row.student_name,
      courseTitle: row.course_title,
      completionDate: existing.rows[0].completion_date
    };
  }

  // First-time generation — persist the certificate record.
  const certificateUuid = uuidv4();
  await pool.query(
    `
      INSERT INTO certificates (certificate_uuid, user_id, course_id, completion_date)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, course_id) DO NOTHING
    `,
    [certificateUuid, userId, courseId, completionDate]
  );

  // Race-safe re-read: if a concurrent request inserted first, use that row's UUID.
  const final = await pool.query(
    'SELECT certificate_uuid, completion_date FROM certificates WHERE user_id = $1 AND course_id = $2',
    [userId, courseId]
  );

  return {
    certificateUuid: final.rows[0].certificate_uuid,
    studentName: row.student_name,
    courseTitle: row.course_title,
    completionDate: final.rows[0].completion_date
  };
}

module.exports = { getOrCreateCertificate, CertificateError };
