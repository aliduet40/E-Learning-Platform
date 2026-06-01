import api from './axiosInstance';

// Fetch the PDF as a binary Blob. `responseType: 'blob'` is critical here —
// without it axios tries to JSON-decode the bytes and corrupts the file.
export const downloadCertificate = (courseId) =>
    api.get(`/certificates/${courseId}`, { responseType: 'blob' });

/**
 * Triggers a browser download of the certificate PDF for the given course.
 * Returns nothing on success; throws on failure so callers can surface an error.
 *
 * If the backend responds with a JSON error (e.g. 403 not completed),
 * axios will give us a Blob of type application/json. We parse it so the
 * UI can show a useful message instead of "[object Blob]".
 */
export async function downloadCertificateFile(courseId, suggestedFilename = 'certificate.pdf') {
    let response;
    try {
        response = await downloadCertificate(courseId);
    } catch (err) {
        // axios puts the body in err.response.data — it's a Blob too on error.
        const blob = err?.response?.data;
        if (blob && typeof blob.text === 'function') {
            const text = await blob.text();
            try {
                const parsed = JSON.parse(text);
                throw new Error(parsed.message || 'Failed to download certificate');
            } catch (jsonErr) {
                if (jsonErr instanceof Error && jsonErr.message !== 'Failed to download certificate') {
                    throw jsonErr;
                }
                throw new Error('Failed to download certificate');
            }
        }
        throw new Error(err?.message || 'Failed to download certificate');
    }

    const filename = extractFilename(response.headers?.['content-disposition']) || suggestedFilename;
    const blob = new Blob([response.data], { type: 'application/pdf' });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    // Revoke on next tick so the click has time to fire.
    setTimeout(() => URL.revokeObjectURL(url), 0);
}

function extractFilename(contentDisposition) {
    if (!contentDisposition) return null;
    const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(contentDisposition);
    return match ? decodeURIComponent(match[1]) : null;
}
