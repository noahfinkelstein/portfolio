/* ---------------------------------------------------------------------------
   PHOTOS  —  "/photos"
   Data lives in src/content/photos.ts.
   --------------------------------------------------------------------------- */

import type { Metadata } from "next";
import Image from "next/image";
import Page from "@/components/Page";
import { photos } from "@/content/photos";

export const metadata: Metadata = {
  title: "Photos",
  description:
    "Photographs from Providence, Brown University, Boston, Cape Cod, and the " +
    "New Hampshire mountains — Noah Finkelstein.",
};

export default function PhotosPage() {
  return (
    <Page title="Photos" current="/photos">
      <div className="photos">
        {photos.map((photo) => (
          <figure key={photo.src} className="photo">
            <Image
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              sizes="(max-width: 40rem) calc(100vw - 3rem), 20rem"
            />
          </figure>
        ))}
      </div>
    </Page>
  );
}
