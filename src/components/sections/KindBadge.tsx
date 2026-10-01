/* ---------------------------------------------------------------------------
   KindBadge — the small pill that says where a feed item comes from:
   "Blog", "LinkedIn" (with the "in" mark) or the press outlet. Uses the tag
   palette: LinkedIn blue (--tag-1), blog purple (--tag-2), press orange
   (--tag-4). All three pass 4.5:1 in every theme.

   Props:
     kind   FeedItem["kind"]
     label  text to show
     icon?  24×24 SVG path for a leading mark (the page passes LinkedIn's,
            resolved on the server from src/lib/icons.ts)
   --------------------------------------------------------------------------- */

import type { FeedKind } from "@/lib/feed";
import styles from "./KindBadge.module.css";

export default function KindBadge({
  kind,
  label,
  icon,
  className,
}: {
  kind: FeedKind;
  label: string;
  icon?: string;
  className?: string;
}) {
  return (
    <span className={[styles.badge, styles[kind], className].filter(Boolean).join(" ")}>
      {icon ? (
        <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d={icon} fill="currentColor" />
        </svg>
      ) : null}
      {label}
    </span>
  );
}
