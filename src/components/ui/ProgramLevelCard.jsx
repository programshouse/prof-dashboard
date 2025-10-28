// ProgramLevelFormCard.jsx
import React, { useMemo, useState } from "react";

/* ========== Helpers ========== */
const normalizeFields = (fields = []) => {
  const map = {};
  for (const item of fields) {
    const k = item?.key;
    if (!k) continue;
    if (item?.type === "file") {
      const v = Array.isArray(item?.value) ? item.value[0] : item?.value ?? "";
      map[k] = v || "";
    } else {
      map[k] = item?.value ?? "";
    }
  }
  return {
    name_ar: map.name_ar || "",
    name_en: map.name_en || "",
    image_path_hint: map.image || "",
    description_en: map.description_en || "",
    description_ar: map.description_ar || "",
    order: map.order || "",
  };
};

/* ========== Reusable Field ========== */
const Field = ({ label, hint, children }) => (
  <div className="flex flex-col">
    <label className="mb-1 font-semibold">{label}</label>
    {children}
    {hint ? <div className="mt-1 text-xs text-gray-500">{hint}</div> : null}
  </div>
);

/* ========== File Picker (responsive) ========== */
function FilePicker({
  initialText = "",
  value,
  onChange,
  accept = "*",
  placeholder = "No file chosen",
  disabled,
}) {
  const [fileName, setFileName] = useState(value?.name || initialText || "");
  const inputId = useMemo(
    () => "file-input-" + Math.random().toString(36).slice(2),
    []
  );

  const handlePick = () =>
    !disabled && document.getElementById(inputId)?.click();
  const handleChange = (e) => {
    const f = e.target.files?.[0] || null;
    setFileName(f ? f.name : "");
    onChange?.(f);
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-2">
      <input
        id={inputId}
        type="file"
        className="hidden"
        onChange={handleChange}
        accept={accept}
        disabled={disabled}
      />
      <input
        readOnly
        value={fileName}
        placeholder={placeholder}
        className="h-11 w-full rounded-md border px-3 py-2"
      />
      <button
        type="button"
        onClick={handlePick}
        disabled={disabled}
        className={`h-11 w-full sm:w-auto sm:min-w-[180px] sm:px-6 rounded-md font-semibold text-white ${
          disabled
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-brand-600 hover:bg-brand-700"
        }`}
      >
        Choose File
      </button>
    </div>
  );
}

/* ========== Form Card ========== */
const ProgramLevelFormCard = ({ initialFields, onSubmit }) => {
  const normalized = useMemo(
    () => normalizeFields(initialFields),
    [initialFields]
  );

  const [form, setForm] = useState({
    name_ar: normalized.name_ar,
    name_en: normalized.name_en,
    description_en: normalized.description_en,
    description_ar: normalized.description_ar,
    order: normalized.order,
    image: null, // File
  });

  const setField = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const handleSave = (e) => {
    e?.preventDefault?.();
    const payload = {
      name_ar: (form.name_ar || "").trim(),
      name_en: (form.name_en || "").trim(),
      description_en: (form.description_en || "").trim(),
      description_ar: (form.description_ar || "").trim(),
      order: (form.order || "").toString().trim(),
      image: form.image, // File or null
    };
    onSubmit?.(payload);
  };

  const handleReset = () =>
    setForm({
      name_ar: normalized.name_ar,
      name_en: normalized.name_en,
      description_en: normalized.description_en,
      description_ar: normalized.description_ar,
      order: normalized.order,
      image: null,
    });

  return (
    <div className="space-y-3">
      <article className="rounded-2xl border border-brand-200 bg-white shadow-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-brand-700">Program Level</h1>
          <p className="mt-1 text-brand-600 text-sm">
            Enter level details below
          </p>
        </div>

        <form className="p-6 pt-0" onSubmit={handleSave} noValidate>
          {/* Names */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Name (Arabic)">
              <input
                value={form.name_ar}
                onChange={(e) => setField("name_ar", e.target.value)}
                placeholder="المستوى الأول"
                className="w-full rounded-md border px-3 py-2"
              />
            </Field>
            <Field label="Name (English)">
              <input
                value={form.name_en}
                onChange={(e) => setField("name_en", e.target.value)}
                placeholder="Level 1"
                className="w-full rounded-md border px-3 py-2"
              />
            </Field>
          </div>

          {/* Descriptions */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Description (Arabic)">
              <textarea
                rows={4}
                value={form.description_ar}
                onChange={(e) => setField("description_ar", e.target.value)}
                placeholder="وصف المستوى…"
                className="w-full rounded-md border px-3 py-2"
              />
            </Field>
            <Field label="Description (English)">
              <textarea
                rows={4}
                value={form.description_en}
                onChange={(e) => setField("description_en", e.target.value)}
                placeholder="Level description…"
                className="w-full rounded-md border px-3 py-2"
              />
            </Field>
          </div>

          {/* Order */}
          <div className="mt-4">
            <Field label="Order">
              <input
                type="number"
                step="1"
                min="1"
                value={form.order}
                onChange={(e) => {
                  const val = e.target.value;
                  setField("order", val < 1 ? "1" : val);
                }}
                placeholder="1"
                className="w-full h-11 rounded-md border px-3 py-2"
              />
            </Field>
          </div>

          {/* Image */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Image" hint="PNG/JPG">
              <FilePicker
                initialText={
                  normalized.image_path_hint?.split(/[\\/]/).pop() || ""
                }
                value={form.image}
                onChange={(f) => setField("image", f)}
                accept="image/*"
                placeholder="No image chosen"
              />
            </Field>
          </div>
        </form>
      </article>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 rounded-lg font-semibold transition border border-brand-600 text-brand-600"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 rounded-lg font-semibold transition bg-brand-600 text-white hover:bg-brand-700"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default ProgramLevelFormCard;
