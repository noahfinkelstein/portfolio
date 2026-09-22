import type { Metadata } from "next";
import Link from "next/link";
import Page from "@/components/Page";

export const metadata: Metadata = {
  title: "Page not found",
  description: "That address does not exist on noahfinkelstein.com.",
};

export default function NotFound() {
  return (
    <Page title="Page not found" current="">
      <p className="prose">
        That address does not exist. Try the <Link href="/">home page</Link>.
      </p>
    </Page>
  );
}
