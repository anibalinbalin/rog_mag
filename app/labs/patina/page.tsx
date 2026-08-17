import type { Metadata } from "next";
import PatinaClient from "./PatinaClient";

export const metadata: Metadata = {
  title: "Patina — laboratorio de iluminación",
  robots: { index: false, follow: false },
};

export default function PatinaLabPage() {
  return <PatinaClient />;
}
