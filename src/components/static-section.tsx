import { RichText } from "@/components/rich-text";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Page de contenu statique. Le titre est déjà porté par la barre supérieure,
 * on ne le répète pas ici : seule l'accroche introduit le contenu.
 */
export function StaticSection({
  intro,
  html,
}: {
  intro: string;
  html: string;
}) {
  return (
    <section className="space-y-4">
      <p className="text-sm text-muted-foreground">{intro}</p>
      <Card>
        <CardContent>
          <RichText html={html} />
        </CardContent>
      </Card>
    </section>
  );
}
