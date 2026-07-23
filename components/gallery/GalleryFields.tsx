import { GalleryInput } from "./GalleryInput";
import { GallerySelect } from "./GallerySelect";
import { GalleryField } from "./GalleryField";
import { GalleryTextarea } from "./GalleryTextarea";
import { GalleryToggle } from "./GalleryToggle";

const NATIVE_SELECT_OPTIONS = [
  { value: "", label: "Choose a pattern…" },
  { value: "presence-boundary", label: "01 · Presence Boundary" },
  { value: "decision-ledger", label: "13 · Decision Ledger" },
  { value: "certainty-boundary", label: "16 · Certainty Boundary" },
];

export function GalleryFields() {
  return (
    <div className="gallery-fields">
      <section className="gallery-fields__group">
        <h4 className="gallery-fields__group-title">Text &amp; search</h4>
        <div className="gallery-fields__grid">
          <GalleryInput id="field-text" label="Text" type="text" placeholder="Device name" />
          <GalleryInput
            id="field-email"
            label="Email"
            type="email"
            placeholder="operator@example.com"
          />
          <GalleryInput
            id="field-password"
            label="Password"
            type="password"
            placeholder="••••••••"
          />
          <GalleryInput
            id="field-search"
            label="Search"
            type="search"
            placeholder="Search patterns…"
          />
          <GalleryInput
            id="field-tel"
            label="Telephone"
            type="tel"
            placeholder="+1 555 0100"
          />
          <GalleryInput
            id="field-url"
            label="URL"
            type="url"
            placeholder="https://example.com/runbook"
          />
          <GalleryInput
            id="field-number"
            label="Number"
            type="number"
            placeholder="0"
            min={0}
            max={100}
            step={1}
            defaultValue="42"
          />
          <GalleryTextarea
            id="field-textarea"
            label="Textarea"
            placeholder="Notes, assumptions, open questions…"
          />
        </div>
      </section>

      <section className="gallery-fields__group">
        <h4 className="gallery-fields__group-title">Date &amp; time</h4>
        <div className="gallery-fields__grid">
          <GalleryInput id="field-date" label="Date" type="date" />
          <GalleryInput id="field-time" label="Time" type="time" />
          <GalleryInput
            id="field-datetime-local"
            label="Datetime local"
            type="datetime-local"
          />
          <GalleryInput id="field-month" label="Month" type="month" />
          <GalleryInput id="field-week" label="Week" type="week" />
        </div>
      </section>

      <section className="gallery-fields__group">
        <h4 className="gallery-fields__group-title">Choice &amp; select</h4>
        <div className="gallery-fields__grid">
          <GalleryField label="Select (native)" typeLabel="select" htmlFor="field-select">
            <select
              id="field-select"
              className="gallery-input__field gallery-surface-raised"
              defaultValue=""
            >
              {NATIVE_SELECT_OPTIONS.map((option) => (
                <option key={option.value || "empty"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </GalleryField>

          <GalleryField
            label="Select multiple"
            typeLabel="select[multiple]"
            htmlFor="field-select-multiple"
          >
            <select
              id="field-select-multiple"
              className="gallery-input__field gallery-input__field--multiselect gallery-surface-raised"
              multiple
              defaultValue={["grounded", "modeled"]}
            >
              <option value="hypothesis">Hypothesis</option>
              <option value="grounded">Grounded</option>
              <option value="modeled">Modeled</option>
              <option value="planned">Planned</option>
            </select>
          </GalleryField>

          <GallerySelect />

          <GalleryField label="Checkbox" typeLabel="checkbox" htmlFor="field-checkbox">
            <label className="gallery-choice">
              <input
                id="field-checkbox"
                className="gallery-choice__input"
                type="checkbox"
                defaultChecked
              />
              <span>Require human confirmation before deploy</span>
            </label>
          </GalleryField>

          <GalleryField label="Radio group" typeLabel="radio">
            <fieldset className="gallery-choice-group">
              <legend className="sr-only">Autonomy level</legend>
              <label className="gallery-choice">
                <input
                  className="gallery-choice__input"
                  type="radio"
                  name="gallery-autonomy"
                  value="read-only"
                  defaultChecked
                />
                <span>Read-only</span>
              </label>
              <label className="gallery-choice">
                <input
                  className="gallery-choice__input"
                  type="radio"
                  name="gallery-autonomy"
                  value="confirm"
                />
                <span>Confirm before act</span>
              </label>
              <label className="gallery-choice">
                <input
                  className="gallery-choice__input"
                  type="radio"
                  name="gallery-autonomy"
                  value="autonomous"
                />
                <span>Autonomous</span>
              </label>
            </fieldset>
          </GalleryField>

          <GalleryField label="Toggle switch" typeLabel="switch">
            <GalleryToggle label="Live agent sync" />
          </GalleryField>
        </div>
      </section>

      <section className="gallery-fields__group">
        <h4 className="gallery-fields__group-title">Files, range &amp; color</h4>
        <div className="gallery-fields__grid">
          <GalleryField label="File" typeLabel="file" htmlFor="field-file">
            <input
              id="field-file"
              className="gallery-input__field gallery-input__field--file gallery-surface-raised"
              type="file"
              accept=".pdf,.csv,.json"
            />
          </GalleryField>

          <GalleryField
            label="Range"
            typeLabel="range"
            hint="Confidence threshold"
            htmlFor="field-range"
          >
            <input
              id="field-range"
              className="gallery-input__field gallery-input__field--range"
              type="range"
              min={0}
              max={100}
              defaultValue={72}
            />
          </GalleryField>

          <GalleryField label="Color" typeLabel="color" htmlFor="field-color">
            <input
              id="field-color"
              className="gallery-input__field gallery-input__field--color"
              type="color"
              defaultValue="#3B6EA5"
            />
          </GalleryField>
        </div>
      </section>
    </div>
  );
}
