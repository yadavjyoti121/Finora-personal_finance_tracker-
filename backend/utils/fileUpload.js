import fs from "fs";
import path from "path";
import crypto from "crypto";

const uploadsRoot = path.resolve("uploads");
const profileUploadsRoot = path.join(uploadsRoot, "profiles");

const ensureDirectory = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const extractExtension = (mimeType = "") => {
  const extension = mimeType.split("/")[1];
  return extension === "jpeg" ? "jpg" : extension || "png";
};

export const saveBase64Image = ({ imageData, userId }) => {
  ensureDirectory(profileUploadsRoot);

  const matches = imageData.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);

  if (!matches) {
    throw new Error("Invalid image format. Please upload a valid image file.");
  }

  const mimeType = matches[1];
  const fileBuffer = Buffer.from(matches[2], "base64");
  const extension = extractExtension(mimeType);
  const fileName = `${userId}-${crypto.randomBytes(8).toString("hex")}.${extension}`;
  const filePath = path.join(profileUploadsRoot, fileName);

  fs.writeFileSync(filePath, fileBuffer);

  return `/uploads/profiles/${fileName}`;
};
