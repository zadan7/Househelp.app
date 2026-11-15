const CLOUDINARY_CLOUD_NAME = "phlt9mqk";
const CLOUDINARY_UPLOAD_PRESET = "ml_default";

export const uploadToCloudinary = async (imageUri,name) => {
  try {
    const formData = new FormData();

    formData.append("file", {
      uri: imageUri,
      type: "image/jpeg",
      name: name,
    });

    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Upload failed");
    }

    return data.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};