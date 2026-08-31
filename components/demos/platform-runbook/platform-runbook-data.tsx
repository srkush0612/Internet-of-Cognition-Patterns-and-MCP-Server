export const PLATFORM_SPACES = [
  { id: "platform-runbook", label: "Platform runbook", active: true },
  { id: "network-changes", label: "Network changes", active: false },
  { id: "customer-sites", label: "Customer sites", active: false },
] as const;

export const PLATFORM_MEMORY_NAV = [
  { id: "committed", label: "Committed beliefs", badge: null, active: false },
  { id: "pending", label: "Pending review", badge: 4, active: true },
  { id: "private", label: "Private to me", badge: null, active: false },
] as const;

export const PLATFORM_RUNBOOK_SECTIONS = [
  {
    heading: "Default deploy target",
    paragraphs: [
      <>
        Platform engineering is{" "}
        <mark className="platform-runbook__highlight">
          standardizing all new service deploys on the us-east-1 EKS cluster
        </mark>
        . Existing services may remain on legacy clusters until migrated during
        their next major release.
      </>,
      <>
        Change requests should reference the cluster name in the deployment
        manifest. The deploy review checklist now includes a cluster validation
        step before merge.
      </>,
    ],
  },
  {
    heading: "Network firmware cadence",
    paragraphs: [
      <>
        The{" "}
        <mark className="platform-runbook__highlight">
          Q3 router firmware target is IOS-XE 17.9.2
        </mark>{" "}
        for edge routers in production. Staging environments may lag by one
        minor version during validation windows.
      </>,
      <>
        Maintenance windows for core routing changes remain after 10pm ET to
        minimize customer impact. Coordinate with the network operations channel
        before scheduling.
      </>,
    ],
  },
] as const;
