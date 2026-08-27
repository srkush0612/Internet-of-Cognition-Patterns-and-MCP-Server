export type ExtractionResult = {
  found: string[];
  missing: string[];
  confidence: number;
};

export type FormFieldType =
  | "text"
  | "textarea"
  | "tags"
  | "enum"
  | "table"
  | "file"
  | "datetime";

export type FormTableColumn = {
  key: string;
  label: string;
  type?: "text" | "tags";
  placeholder?: string;
};

export type FormFieldDef = {
  name: string;
  type: FormFieldType;
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  autoFilled?: boolean;
  columns?: FormTableColumn[];
  rowTemplate?: Record<string, unknown>;
  accept?: string;
  validation?: (val: unknown) => string | null;
};

export type Scenario = {
  id: string;
  title: string;
  description: string;
  template: Record<string, unknown>;
};

export type RefinementMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: number;
};

export type RefinementParsed = {
  field: string;
  action: "add" | "remove" | "change";
  value: string;
};
