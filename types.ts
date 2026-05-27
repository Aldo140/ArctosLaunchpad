/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Project {
  id: string;
  name: string;
  type: string;
  /** Hostname or path for display (e.g. calgarywatch.ca) */
  url: string;
  /** Full URL for outbound links (optional — falls back to https:// + url) */
  href?: string;
  description: string;
  /** Desktop screenshot (landscape) */
  image: string;
  /** Mobile screenshot (portrait) — shown as secondary visual */
  imageMobile?: string;
  /** True when only mobile screenshots exist (no desktop recording) */
  mobileOnly?: boolean;
  tags?: string[];
  /** Larger tiles in the work bento */
  featured?: boolean;
}

export type ViewState = 'home' | 'services' | 'contact';
