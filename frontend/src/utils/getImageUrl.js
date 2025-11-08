// Works in both dev (Vite/Electron) and production
// Now supports Base64 images sent directly from the backend

export default function getImageUrl(path) {
  if (!path) {
    // Optional: placeholder image as Base64 string
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAA..."; 
  }
  // If path is already a URL or Base64 string, just return it
  return path;
}
