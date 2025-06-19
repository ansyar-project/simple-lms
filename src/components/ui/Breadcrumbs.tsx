import Link from "next/link";
import React from "react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumbs navigation with semantic HTML and JSON-LD structured data for SEO.
 */
const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className }) => {
  // JSON-LD structured data for breadcrumbs
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.label,
      item: item.href
        ? `${
            process.env.NEXT_PUBLIC_SITE_URL ||
            "https://simple-lms.ansyar-world.top"
          }${item.href}`
        : undefined,
    })),
  };

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center">
            {item.href && idx !== items.length - 1 ? (
              <Link
                href={item.href}
                className="hover:underline focus:underline"
              >
                {item.label}
              </Link>
            ) : (
              <span
                aria-current="page"
                className="font-semibold text-blue-700 dark:text-blue-300"
              >
                {item.label}
              </span>
            )}
            {idx < items.length - 1 && (
              <span className="mx-2 text-gray-400" aria-hidden="true">
                /
              </span>
            )}
          </li>
        ))}
      </ol>
      {/* JSON-LD structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </nav>
  );
};

export default Breadcrumbs;
