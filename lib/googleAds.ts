/**
 * Google Ads tag. Both values are public by design (they ship in the page),
 * so they live in NEXT_PUBLIC_ variables. Empty ID means the tag is off.
 *  - ID: "AW-123456789" from Google Ads > Goals > Conversions > the tag setup.
 *  - LEAD_LABEL: the part after the slash in the lead conversion's send_to.
 */
export const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim() ?? "";
export const GOOGLE_ADS_LEAD_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL?.trim() ?? "";
