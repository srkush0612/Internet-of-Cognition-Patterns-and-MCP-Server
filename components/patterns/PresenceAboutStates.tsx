import { PRESENCE_STATE_CARDS } from "@/lib/presence-boundary";

export function PresenceAboutStates() {
  return (
    <div className="presence-states-grid">
      {PRESENCE_STATE_CARDS.map((card) => (
        <article key={card.id} className="presence-state-card">
          <div className="presence-state-card__header">
            <span
              className={`presence-state-card__dot presence-state-card__dot--${card.tone}`}
              aria-hidden
            />
            <h4 className="presence-state-card__title">{card.label}</h4>
          </div>
          <p className="presence-state-card__description">{card.description}</p>
        </article>
      ))}
    </div>
  );
}
