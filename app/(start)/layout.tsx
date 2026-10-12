import "../v2.css";

/**
 * The version picker has no site header: picking a version is how you get one.
 */
export default function StartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="v2 flex flex-1 flex-col">{children}</div>;
}
