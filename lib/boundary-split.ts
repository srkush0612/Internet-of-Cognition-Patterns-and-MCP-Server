export type BoundaryAgentPane = {
  label: string;
  steps: string[];
  cannotSee: string;
};

export type BoundarySplitData = {
  left: BoundaryAgentPane;
  right: BoundaryAgentPane;
  outcome: {
    label: string;
    text: string;
  };
};
