import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://prismiqai.vercel.app", lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: "https://prismiqai.vercel.app/upgrade", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  ];
}
