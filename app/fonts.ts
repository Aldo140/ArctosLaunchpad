import { Newsreader, Archivo, IBM_Plex_Mono } from "next/font/google";

/**
 * Three voices, one per material.
 *
 * Newsreader is the paper voice — chapter titles, pull quotes, anything set on
 * the collage stages. Real optical sizing and a genuine italic, which the old
 * "Iowan Old Style, Palatino, Georgia" stack never delivered off macOS.
 *
 * Archivo is the instrument voice — navigation, body copy, buttons, interface.
 * It carries a width axis, so hierarchy can move through width rather than only
 * size, which keeps technical labels tight without shrinking them.
 *
 * Plex Mono is the annotation voice — folios, coordinates, specimen captions.
 */

export const display = Newsreader({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-newsreader",
  axes: ["opsz"],
  style: ["normal", "italic"],
});

export const ui = Archivo({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-archivo",
  axes: ["wdth"],
});

/* Plex Mono is the one family here that is not variable, so every weight in
   this array is another file preloaded on first paint. Measured across
   thirteen routes, 400 and 500 carry 825 elements between them and 600 carries
   seven — and no rule in the stylesheets actually pairs the mono family with
   600, so those seven inherit it from a parent rather than ask for it. It is
   dropped: they now render at 500, which at folio and caption sizes is not a
   difference anyone can see, and the site preloads one file fewer. */
export const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plex-mono",
  weight: ["400", "500"],
});

export const fontClass = `${display.variable} ${ui.variable} ${mono.variable}`;
