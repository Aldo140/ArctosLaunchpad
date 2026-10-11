/**
 * The Meta (Facebook/Instagram) ads pixel ID. It is public by design, so it
 * lives in a NEXT_PUBLIC_ variable. Empty means the pixel is off everywhere.
 * Kept out of the "use client" component so server pages can read it too.
 */
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() ?? "";
