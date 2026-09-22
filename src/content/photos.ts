/* ---------------------------------------------------------------------------
   PHOTOS — the grid on /photos.

   To add one: drop the file in photos-source/, then run `npm run photos`.
   That rotates it right way up, shrinks it, writes it to public/images/photos/,
   and prints the block to paste below.

   The page shows the photos alone, no captions. `alt` is still required: it
   is what screen readers and image search see, not visible text.
   --------------------------------------------------------------------------- */

export type Photo = {
  src: string;
  width: number;   // real pixel size, so the page reserves the right space
  height: number;
  alt: string;
};

export const photos: Photo[] = [
  {
    src: "/images/photos/bruno.jpg",
    width: 1350,
    height: 1800,
    alt: "Noah standing with Bruno the Bear on the Main Green at Brown",
  },
  {
    src: "/images/photos/turkey.jpg",
    width: 1350,
    height: 1800,
    alt: "Noah on a Providence sidewalk with a wild turkey behind him",
  },
  {
    src: "/images/photos/snow_couch.jpg",
    width: 1350,
    height: 1800,
    alt: "Noah sitting on a couch carved out of snow in front of a sculpture",
  },
  {
    src: "/images/photos/interview.jpg",
    width: 1278,
    height: 589,
    alt: "Noah being interviewed on camera by WPRI Channel 12",
  },
  {
    src: "/images/photos/public_garden.jpg",
    width: 1800,
    height: 1350,
    alt: "Noah and two friends by the lagoon in the Boston Public Garden",
  },
  {
    src: "/images/photos/hiking.jpg",
    width: 1350,
    height: 1800,
    alt: "Noah and his father at the summit of a mountain in New Hampshire",
  },
  {
    src: "/images/photos/kayak.jpg",
    width: 1800,
    height: 1350,
    alt: "Noah in a life vest beside a kayak on a tidal flat",
  },
  {
    src: "/images/photos/camp.jpg",
    width: 1054,
    height: 1800,
    alt: "Noah in an Albemarle Acres staff shirt inside the camp building",
  },
  {
    src: "/images/photos/farm.jpg",
    width: 1800,
    height: 1350,
    alt: "Noah at a picnic table with two full plates of food",
  },
  {
    src: "/images/photos/newgrad.jpg",
    width: 1010,
    height: 1800,
    alt: "Noah in cap and gown holding a program at his high school graduation",
  },
];
