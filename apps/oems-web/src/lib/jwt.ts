const decodeBase64Url = (value: string): string => {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  return atob(paddedBase64);
};

export const parseJwtPayload = (token: string): Record<string, unknown> | null => {
  try {
    const jwtSegments = token.split(".");
    if (jwtSegments.length < 2) {
      return null;
    }

    const payloadJson = decodeBase64Url(jwtSegments[1]);
    return JSON.parse(payloadJson) as Record<string, unknown>;
  } catch {
    return null;
  }
};
