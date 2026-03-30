const cloudinary = require("../config/cloudinary");

async function uploadToCloudinary(fileBuffer, originalName) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: "resumes",
        public_id: `${Date.now()}-${originalName}`
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(fileBuffer);
  });
}

module.exports = { uploadToCloudinary };