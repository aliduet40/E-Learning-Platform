const PDFKit = require('pdfkit');

// Builds the PDF certificate and streams it to the given writable stream
// (usually the Express `res`). All layout numbers assume A4 landscape.
//
// A4 landscape: 842pt wide x 595pt tall.
const PAGE_WIDTH = 842;
const PAGE_HEIGHT = 595;

const COLORS = {
  outerBorder: '#1a365d',
  innerBorder: '#c8a45c',
  title: '#1a365d',
  body: '#2d3748',
  accent: '#c8a45c',
  muted: '#718096'
};

function drawBorders(doc) {
  // Outer thick border
  doc
    .lineWidth(6)
    .strokeColor(COLORS.outerBorder)
    .rect(20, 20, PAGE_WIDTH - 40, PAGE_HEIGHT - 40)
    .stroke();

  // Inner gold border
  doc
    .lineWidth(1.5)
    .strokeColor(COLORS.innerBorder)
    .rect(36, 36, PAGE_WIDTH - 72, PAGE_HEIGHT - 72)
    .stroke();

  // Decorative corner ornaments — small squares in each corner of the inner border.
  const cornerSize = 10;
  const offsets = [
    [36, 36],
    [PAGE_WIDTH - 36 - cornerSize, 36],
    [36, PAGE_HEIGHT - 36 - cornerSize],
    [PAGE_WIDTH - 36 - cornerSize, PAGE_HEIGHT - 36 - cornerSize]
  ];
  offsets.forEach(([x, y]) => {
    doc.save()
      .fillColor(COLORS.innerBorder)
      .rect(x, y, cornerSize, cornerSize)
      .fill()
      .restore();
  });
}

function drawCenteredText(doc, text, y, options) {
  doc.text(text, 0, y, { align: 'center', width: PAGE_WIDTH, ...options });
}

/**
 * Generates the certificate PDF and pipes it to `outStream`.
 * @param {object} data
 * @param {string} data.studentName
 * @param {string} data.courseTitle
 * @param {Date}   data.completionDate
 * @param {string} data.certificateUuid
 * @param {NodeJS.WritableStream} outStream
 */
function generateCertificatePdf(data, outStream) {
  const { studentName, courseTitle, completionDate, certificateUuid } = data;

  const doc = new PDFKit({
    size: 'A4',
    layout: 'landscape',
    margin: 0,
    info: {
      Title: `Certificate of Completion - ${courseTitle}`,
      Author: 'E-Learning Platform',
      Subject: 'Course Completion Certificate',
      Keywords: 'certificate, completion, e-learning'
    }
  });

  doc.pipe(outStream);

  drawBorders(doc);

  // Header label
  doc.font('Helvetica').fontSize(14).fillColor(COLORS.muted);
  drawCenteredText(doc, 'E-LEARNING PLATFORM', 80, { characterSpacing: 4 });

  // Main title
  doc.font('Helvetica-Bold').fontSize(40).fillColor(COLORS.title);
  drawCenteredText(doc, 'CERTIFICATE OF COMPLETION', 115, { characterSpacing: 2 });

  // Underline accent
  const accentY = 175;
  doc
    .moveTo(PAGE_WIDTH / 2 - 60, accentY)
    .lineTo(PAGE_WIDTH / 2 + 60, accentY)
    .lineWidth(2)
    .strokeColor(COLORS.accent)
    .stroke();

  // Intro line
  doc.font('Helvetica').fontSize(16).fillColor(COLORS.body);
  drawCenteredText(doc, 'This is to certify that', 200);

  // Student name (the hero element)
  doc.font('Helvetica-Bold').fontSize(34).fillColor(COLORS.title);
  drawCenteredText(doc, studentName, 235);

  // Body line
  doc.font('Helvetica').fontSize(16).fillColor(COLORS.body);
  drawCenteredText(doc, 'has successfully completed the course', 295);

  // Course title
  doc.font('Helvetica-Oblique').fontSize(22).fillColor(COLORS.accent);
  drawCenteredText(doc, `"${courseTitle}"`, 325);

  // Completion date
  const formattedDate = new Date(completionDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  doc.font('Helvetica').fontSize(14).fillColor(COLORS.body);
  drawCenteredText(doc, `Completed on ${formattedDate}`, 380);

  // Signature line + label (decorative)
  const sigY = 470;
  const sigCenterX = PAGE_WIDTH / 2;
  doc
    .moveTo(sigCenterX - 90, sigY)
    .lineTo(sigCenterX + 90, sigY)
    .lineWidth(1)
    .strokeColor(COLORS.body)
    .stroke();
  doc.font('Helvetica').fontSize(11).fillColor(COLORS.muted);
  drawCenteredText(doc, 'Authorized Signature', sigY + 6);

  // Footer: certificate ID
  doc.font('Helvetica').fontSize(10).fillColor(COLORS.muted);
  drawCenteredText(doc, `Certificate ID: ${certificateUuid}`, PAGE_HEIGHT - 65);
  drawCenteredText(
    doc,
    'Verify this certificate by quoting the Certificate ID above.',
    PAGE_HEIGHT - 50
  );

  doc.end();
}

module.exports = { generateCertificatePdf };
