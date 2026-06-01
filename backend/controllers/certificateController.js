const {
  getOrCreateCertificate,
  CertificateError
} = require('../services/certificateService');
const { generateCertificatePdf } = require('../services/certificatePdfService');

// Sanitize the course title for use inside a Content-Disposition filename.
// Strips control chars + double quotes; keeps spaces, dashes, parentheses.
function safeFilenamePart(input) {
  return String(input).replace(/[^\w\s\-().]/g, '_').trim() || 'certificate';
}

/**
 * GET /api/certificates/:courseId
 *
 * Auth: required (req.user populated by `protect` middleware).
 * Streams a PDF certificate for the authenticated student.
 */
exports.downloadCertificate = async (req, res) => {
  const userId = req.user.id;
  const { courseId } = req.params;

  let certificate;
  try {
    certificate = await getOrCreateCertificate(userId, courseId);
  } catch (err) {
    if (err instanceof CertificateError) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message
      });
    }
    console.error('Certificate lookup failed:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to prepare certificate'
    });
  }

  const filename = `certificate-${safeFilenamePart(certificate.courseTitle)}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Cache-Control', 'no-store');

  // Stream PDF directly to the response. If something blows up mid-stream
  // we can't send a JSON error any more (headers are already out), so just
  // log and close the connection.
  res.on('error', (err) => {
    console.error('Response stream error during certificate download:', err);
  });

  try {
    generateCertificatePdf(certificate, res);
  } catch (err) {
    console.error('PDF generation failed:', err);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate certificate PDF'
      });
    }
    res.end();
  }
};
