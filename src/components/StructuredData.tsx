import React from "react";

/**
 * Injects JSON-LD structured data into the <head> for SEO.
 * @param schema - The JSON-LD schema object
 */
interface StructuredDataProps {
  schema: Record<string, unknown>;
}

const StructuredData: React.FC<StructuredDataProps> = ({ schema }) => {
  const key = typeof schema["@type"] === "string" ? schema["@type"] : undefined;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      key={key}
    />
  );
};

export default StructuredData;
