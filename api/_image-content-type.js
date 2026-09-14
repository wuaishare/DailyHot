const startsWithBytes = (buffer, signature) =>
  buffer.length >= signature.length &&
  signature.every((byte, index) => buffer[index] === byte);

const asciiAt = (buffer, start, value) =>
  buffer.length >= start + value.length &&
  value.split("").every(
    (character, index) => buffer[start + index] === character.charCodeAt(0),
  );

export const resolveProxiedImageContentType = (
  upstreamContentType = "",
  body = Buffer.alloc(0),
) => {
  const declared = String(upstreamContentType)
    .split(";", 1)[0]
    .trim()
    .toLowerCase();
  if (declared.startsWith("image/")) {
    return declared === "image/jpg" ? "image/jpeg" : declared;
  }

  const buffer = Buffer.isBuffer(body) ? body : Buffer.from(body);
  if (startsWithBytes(buffer, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (
    startsWithBytes(buffer, [
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ])
  ) {
    return "image/png";
  }
  if (asciiAt(buffer, 0, "GIF87a") || asciiAt(buffer, 0, "GIF89a")) {
    return "image/gif";
  }
  if (asciiAt(buffer, 0, "RIFF") && asciiAt(buffer, 8, "WEBP")) {
    return "image/webp";
  }
  if (
    asciiAt(buffer, 4, "ftyp") &&
    (asciiAt(buffer, 8, "avif") || asciiAt(buffer, 8, "avis"))
  ) {
    return "image/avif";
  }
  return "";
};
