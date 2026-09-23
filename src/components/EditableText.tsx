"use client";

import { useLayoutEffect, useRef } from "react";

type TagName = "h1" | "h2" | "h3" | "p" | "span" | "div";

export function EditableText({
  value,
  onChange,
  editable,
  as = "span",
  className,
  multiline = false,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  editable: boolean;
  as?: TagName;
  className?: string;
  multiline?: boolean;
  // Shown (edit mode only) while the field is empty — otherwise an empty
  // field collapses to a sliver of dashed outline that's nearly impossible to find.
  placeholder?: string;
}) {
  const Tag = as as React.ElementType;
  const ref = useRef<HTMLElement>(null);

  // The editable element's text is owned by the browser while she types
  // (Enter adds <div>/<br> nodes React doesn't know about), so React never
  // renders it as children. Instead the DOM is synced here whenever the value
  // changes from outside — e.g. deleting a list item hands this element the
  // next item's text. Skipped while focused so the caret isn't reset.
  useLayoutEffect(() => {
    const el = ref.current;
    if (el && el !== document.activeElement && el.textContent !== value) {
      el.textContent = value;
    }
  }, [value, editable]);

  if (!editable) {
    if (multiline) {
      return (
        <Tag className={className} data-body="">
          {value
            .split("\n")
            .filter(Boolean)
            .map((line, i) => (
              <p key={i} className={i > 0 ? "mt-4" : undefined}>
                {line}
              </p>
            ))}
        </Tag>
      );
    }
    return <Tag className={className}>{value}</Tag>;
  }

  return (
    <Tag
      // Keyed so switching modes remounts the element instead of React
      // reconciling children into DOM text it didn't create.
      key="edit"
      ref={ref}
      contentEditable
      style={multiline ? { whiteSpace: "pre-wrap" } : undefined}
      // Marks body text so a section's custom text colour reaches it in edit
      // mode too (where it's one div, not separate <p>s).
      data-body={multiline ? "" : undefined}
      data-placeholder={placeholder}
      className={`${className ?? ""} ${
        placeholder
          ? "empty:inline-block empty:min-w-[12rem] empty:before:italic empty:before:opacity-60 empty:before:content-[attr(data-placeholder)]"
          : ""
      } cursor-text rounded px-1 -mx-1 outline-dashed outline-1 outline-sage/40 transition-[outline] hover:outline-sage focus:outline-2 focus:outline-sage`}
      onBlur={(e: React.FocusEvent<HTMLElement>) => {
        const text = e.currentTarget.innerText.replace(/\n{3,}/g, "\n\n").trim();
        onChange(text);
      }}
    />
  );
}
