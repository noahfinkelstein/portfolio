/* ---------------------------------------------------------------------------
   The inline <head> script (see src/app/layout.tsx). It runs before the first
   paint, so the page never flashes the wrong theme:

     html[data-theme]   the saved theme (localStorage "theme"), else the default

   Plain ES5 and self-contained on purpose: it is a string, not a module.
   Kept out of theme.tsx because that file is "use client", and a string
   exported from a client module reaches a server component as a reference,
   not as text.
   --------------------------------------------------------------------------- */

import { themes, defaultTheme } from "@/content/site";

export const THEME_STORAGE_KEY = "theme";

const ids = JSON.stringify(themes.map((t) => t.id));

export const themeInitScript = `(function(){var d=document.documentElement,t=${JSON.stringify(
  defaultTheme,
)};try{var s=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(${ids}.indexOf(s)>-1)t=s}catch(e){}d.setAttribute("data-theme",t)})();`;
