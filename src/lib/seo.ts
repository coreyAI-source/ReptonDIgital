import { business } from "@/config/business";
import { CONTACT_EMAIL, SITE_URL } from "@/lib/env";

/** Organisation structured data. Contains only facts the business has confirmed. */
export function buildStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: business.name,
    url: SITE_URL,
    description: business.description,
    telephone: business.phoneInternational,
    ...(CONTACT_EMAIL ? { email: CONTACT_EMAIL } : {}),
    areaServed: {
      "@type": "City",
      name: "Perth",
      containedInPlace: { "@type": "State", name: "Western Australia" },
    },
    serviceType: ["Website design", "AI automation", "Custom software development"],
  };
}
