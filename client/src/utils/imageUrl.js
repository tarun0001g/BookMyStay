// Adds responsive delivery settings to Cloudinary image URLs.
export function imageUrl(url, width) {
  if (!url || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) {
    return url;
  }

  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
}
