import { StaticSection } from "@/components/static-section";
import { FICHES_HTML } from "@/data/content";

export const metadata = { title: "Fiches express - Prépa SIL" };

export default function FichesPage() {
  return (
    <StaticSection
      intro="Les points à mémoriser par coeur, thème par thème. Relis-les avant chaque série de quiz."
      html={FICHES_HTML}
    />
  );
}
