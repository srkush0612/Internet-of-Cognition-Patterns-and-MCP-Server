const ROWS = [
  { name: "Presence Boundary", stage: "Modeled", quotes: "1", updated: "Jun 9" },
  { name: "Decision Ledger", stage: "Grounded", quotes: "2", updated: "Jun 8" },
  { name: "Signal-to-Intent Handshake", stage: "Planned", quotes: "0", updated: "-" },
];

export function GalleryTableRow() {
  return (
    <div className="gallery-table-sample">
      {ROWS.map((row) => (
        <div key={row.name} className="gallery-table-row">
          <span className="gallery-table-row__primary">{row.name}</span>
          <span className="gallery-table-row__muted">{row.stage}</span>
          <span className="gallery-table-row__muted">{row.quotes} quotes</span>
          <span className="gallery-table-row__muted">{row.updated}</span>
        </div>
      ))}
    </div>
  );
}
