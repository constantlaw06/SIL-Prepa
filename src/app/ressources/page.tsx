import { StaticSection } from "@/components/static-section";
import { LIENS_HTML } from "@/data/content";

export const metadata = { title: "Ressources - Prépa SIL" };

export default function RessourcesPage() {
  return (
    <StaticSection
      intro="Quiz en ligne et documentations complémentaires, ainsi que les anciennes épreuves à refaire en conditions réelles."
      html={LIENS_HTML}
    />
  );
}
