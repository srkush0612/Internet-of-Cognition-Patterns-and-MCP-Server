import Link from "next/link";

type Crumb = { label: string; href?: string };

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && (
              <span className="breadcrumb__sep" aria-hidden>
                /
              </span>
            )}
            {item.href ? (
              <Link href={item.href} className="breadcrumb__link">
                {item.label}
              </Link>
            ) : (
              <span className="breadcrumb__current">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
