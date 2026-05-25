const cloudinary = require("cloudinary").v2;
const fs = require("fs/promises");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Uploads a local file to Cloudinary, then removes the local temp file.
// Returns { url, public_id } or throws.
async function uploadAvatarToCloudinary(localFilePath) {
  if (!localFilePath) throw new Error("No file path provided");

  try {
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder: "elearning/avatars",
      resource_type: "image",
      transformation: [
        { width: 512, height: 512, crop: "fill", gravity: "face" },
        { fetch_format: "auto", quality: "auto" },
      ],
    });
    return { url: result.secure_url, public_id: result.public_id };
  } finally {
    // Always remove the local temp file, even if upload failed.
    try {
      await fs.unlink(localFilePath);
    } catch (err) {
      if (err.code !== "ENOENT") {
        console.warn(
          "Failed to remove temp avatar file:",
          localFilePath,
          err.message,
        );
      }
    }
  }
}

async function deleteAvatarFromCloudinary(publicId) {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch (err) {
    console.warn("Cloudinary destroy failed for", publicId, err.message);
  }
}

module.exports = {
  cloudinary,
  uploadAvatarToCloudinary,
  deleteAvatarFromCloudinary,
};
