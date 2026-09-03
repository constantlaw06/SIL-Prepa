import { StaticSection } from "@/components/static-section";
import { METHOD_HTML } from "@/data/content";

export const metadata = { title: "Méthode - Prépa SIL" };

export default function MethodePage() {
  return (
    <StaticSection
      intro="Comment travailler chaque type d'épreuve, gérer le temps et corriger tes erreurs."
      html={METHOD_HTML}
    />
  );
}
