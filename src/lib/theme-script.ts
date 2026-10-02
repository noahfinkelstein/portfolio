/* ---------------------------------------------------------------------------
   The inline <head> script (see src/app/layout.tsx). It runs before the first
   paint, so the page never flashes the wrong theme:

     html[data-theme]   the saved theme (localStorage "theme") if it is one of
                        the ids in `themes`; otherwise night when the system
                        prefers a dark colour scheme; otherwise paper
     html[data-js]      present whenever scripts run (the theme button is
                        hidden without it, since it could not do anything)

   Plain ES5 and self-contained on purpose: it is a string, not a module.
   Kept out of theme.tsx because that file is "use client", and a string
   exported from a client module reaches a server component as a reference,
   not as text.
   --------------------------------------------------------------------------- */

import { darkTheme, defaultTheme, themes } from "@/content/site";

export const THEME_STORAGE_KEY = "theme";

const ids = JSON.stringify(themes.map((t) => t.id));
const key = JSON.stringify(THEME_STORAGE_KEY);

export const themeInitScript =
  `(function(){var d=document.documentElement,t=${JSON.stringify(defaultTheme)},s=null;` +
  `d.setAttribute("data-js","");` +
  `try{s=localStorage.getItem(${key})}catch(e){}` +
  `if(${ids}.indexOf(s)>-1)t=s;` +
  `else try{if(window.matchMedia("(prefers-color-scheme: dark)").matches)t=${JSON.stringify(darkTheme)}}catch(e){}` +
  `d.setAttribute("data-theme",t)})();`;
