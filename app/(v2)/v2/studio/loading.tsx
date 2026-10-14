export default function StudioLoading() {
  return <main className="v2-studio-route-skeleton" role="status" aria-label="Loading Studio onboarding">
    <div className="v2-studio-route-skeleton__content" aria-hidden="true">
      <span>Preparing Studio</span>
      <i className="v2-workspace__bone v2-workspace__bone--eyebrow" />
      <i className="v2-workspace__bone v2-workspace__bone--heading" />
      <i className="v2-workspace__bone v2-workspace__bone--subhead" />
      <div>{[0, 1, 2, 3].map((index) => <i key={index} className="v2-workspace__bone" />)}</div>
    </div>
  </main>;
}
