/* ---------------------------------------------------------------------------
   PRESS: interviews and articles about my work. Shown in the "Press" section
   of the CV (/cv), newest first; the section is left out while this list is
   empty.

   Adding one is one block:

     {
       outlet: "WPRI 12",                          // who published it
       title: "What the piece was called",
       date: "2026-05-01",                         // ISO date, YYYY-MM-DD
       url: "https://the-outlet.com/the-piece",
       note: "One sentence on what it covered.",   // optional
     },

   Only real, published items.
   (Pending: the WPRI Channel 12 interview. Add it once the title, date and
   link are confirmed.)
   --------------------------------------------------------------------------- */

export type PressItem = { outlet: string; title: string; date: string; url: string; note?: string };

export const press: PressItem[] = [];
