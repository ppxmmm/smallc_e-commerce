/**
 * Prefer stored full name; otherwise derive a friendly name from the email local part.
 * e.g. test@gmail.com → "Test", john.doe@example.com → "John Doe"
 */
export function getDisplayName({ name, email } = {}) {
  const trimmed = typeof name === "string" ? name.trim() : "";
  if (trimmed) {
    return trimmed;
  }

  if (typeof email !== "string" || !email.includes("@")) {
    return "";
  }

  const local = email.split("@")[0] ?? "";

  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function getInitials(name) {
  const parts = typeof name === "string" ? name.trim().split(/\s+/).filter(Boolean) : [];

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return "?";
}
