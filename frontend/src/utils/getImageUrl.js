// utils/getImageUrl.js

// Correct centralized mobile backend URL (lowercase)
const BASE_URL = "https://mobile-application-2.onrender.com";

export default function getImageUrl(path) {
  if (!path) {
    return "https://placehold.co/150x150?text=No+Image";
  }

  // If path is already a full URL or Base64 string
  if (path.startsWith("http") || path.startsWith("data:image")) {
    return path;
  }

  // Convert "/uploads/file.jpg" → "https://mobile-application-2.onrender.com/uploads/file.jpg"
  return `${BASE_URL}${path}`;
}
