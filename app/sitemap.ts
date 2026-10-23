import type { MetadataRoute } from "next";
import { getUnionSlugs } from "@/lib/union";

export const dynamic = "force-static";

const baseUrl = "https://fackforbund.github.io";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${baseUrl}/` },
    ...getUnionSlugs().map((slug) => ({
      url: `${baseUrl}/${slug}`,
    })),
  ];
}
