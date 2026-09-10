/**
 * NEXT_PUBLIC_SITE_URL must include a protocol (http:// or https://) for metadataBase.
 * Misconfigured values like "localhost:3000" would throw and break the root layout.
 */
export function getSiteUrlForMetadata(): URL {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || 'https://robotixinstitute.co.zm').trim();
  try {
    const u = new URL(raw);
    return u;
  } catch {
    const withProto = raw.startsWith('http://') || raw.startsWith('https://')
      ? raw
      : `http://${raw}`;
    try {
      return new URL(withProto);
    } catch {
      return new URL('https://robotixinstitute.co.zm');
    }
  }
}
