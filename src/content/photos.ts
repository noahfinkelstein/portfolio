/* ---------------------------------------------------------------------------
   PHOTOS — the grid on /photos.

   To add one: drop the file in photos-source/, then run `npm run photos`.
   That rotates it right way up, shrinks it, writes it to public/images/photos/,
   and prints the block to paste below.

   Captions carry this page, so write a real one — a photo with no caption is
   just decoration.
   --------------------------------------------------------------------------- */

export type Photo = {
  src: string;
  width: number;   // real pixel size, so the page reserves the right space
  height: number;
  alt: string;
  caption: string;
};

export const photos: Photo[] = [
  {
    src: "/images/photos/bruno.jpg",
    width: 1350,
    height: 1800,
    alt: "Noah standing with Bruno the Bear on the Main Green at Brown",
    caption:
      "Meeting Bruno on the Main Green during A Day on College Hill, before I had decided to come to Brown.",
  },
  {
    src: "/images/photos/turkey.jpg",
    width: 1350,
    height: 1800,
    alt: "Noah on a Providence sidewalk with a wild turkey behind him",
    caption:
      "Providence has wild turkeys, and they have the right of way. This one held it for a while.",
  },
  {
    src: "/images/photos/snow_couch.jpg",
    width: 1350,
    height: 1800,
    alt: "Noah sitting on a couch carved out of snow in front of a sculpture",
    caption:
      "A couch someone shoveled out of the snow on the Quiet Green, in front of the Henry Moore.",
  },
  {
    src: "/images/photos/interview.jpg",
    width: 1278,
    height: 589,
    alt: "Noah being interviewed on camera by WPRI Channel 12",
    caption: "Getting stopped by WPRI Channel 12 on the way across campus.",
  },
  {
    src: "/images/photos/public_garden.jpg",
    width: 1800,
    height: 1350,
    alt: "Noah and two friends by the lagoon in the Boston Public Garden",
    caption: "The Public Garden with friends from home, back in Boston for a weekend.",
  },
  {
    src: "/images/photos/hiking.jpg",
    width: 1350,
    height: 1800,
    alt: "Noah and his father at the summit of a mountain in New Hampshire",
    caption: "At the top with my dad. We try to get a hike in every summer.",
  },
  {
    src: "/images/photos/kayak.jpg",
    width: 1800,
    height: 1350,
    alt: "Noah in a life vest beside a kayak on a tidal flat",
    caption: "Kayaking on the Cape with my mom, at low tide.",
  },
  {
    src: "/images/photos/camp.jpg",
    width: 1054,
    height: 1800,
    alt: "Noah in an Albemarle Acres staff shirt inside the camp building",
    caption:
      "Albemarle Acres, where I spent three summers teaching music, drama, and creative writing.",
  },
  {
    src: "/images/photos/farm.jpg",
    width: 1800,
    height: 1350,
    alt: "Noah at a picnic table with two full plates of food",
    caption: "Dinner at a farm on the Cape, the same week as the kayaking. I was not going back for thirds.",
  },
  {
    src: "/images/photos/newgrad.jpg",
    width: 1010,
    height: 1800,
    alt: "Noah in cap and gown holding a program at his high school graduation",
    caption: "Graduating from Newton North, June 2024.",
  },
];
