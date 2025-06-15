/**
 * Generate a random avatar URL using DiceBear API with fun-emoji style
 */
export function generateRandomAvatarUrl(): string {
  const randomSeed = Math.random().toString(36).substring(2, 15);
  return `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${randomSeed}`;
}

/**
 * Generate initials from a full name, falling back to email if name is empty
 */
export function generateInitials(
  fullName: string,
  fallbackEmail: string
): string {
  const trimmedName = fullName?.trim();

  if (trimmedName) {
    return trimmedName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }

  return fallbackEmail[0].toUpperCase();
}

/**
 * Validate and sanitize profile data for submission
 */
export function sanitizeProfileData(data: {
  full_name: string;
  avatar_url: string;
}) {
  return {
    full_name: data.full_name.trim(),
    avatar_url: data.avatar_url.trim(),
  };
}

/**
 * Validate if an avatar URL is in a valid format
 */
export function isValidAvatarUrl(url: string): boolean {
  if (!url.trim()) {
    return true; // Empty URL is valid (optional field)
  }

  try {
    const parsedUrl = new URL(url);
    return (
      (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") &&
      parsedUrl.hostname.length > 0
    );
  } catch {
    return false;
  }
}
