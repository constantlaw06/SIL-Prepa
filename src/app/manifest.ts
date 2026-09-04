import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Prépa Examen National de Licence - SIL",
    short_name: "Prépa SIL",
    description:
      "Quiz interactif de révision : Système Informatique et Logiciel, tronc commun et spécialité.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f1115",
    theme_color: "#1d6fff",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
