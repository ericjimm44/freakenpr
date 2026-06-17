import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Adventure Dad",
    short_name: "Adventure Dad",
    description: "Create family memories on purpose through mission-based adventures.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FBF6EC",
    theme_color: "#2F5D45",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
