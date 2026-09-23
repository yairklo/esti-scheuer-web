"use client";

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

  if (!editable) {
    if (multiline) {
      return (
        <Tag className={className}>
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
      contentEditable
      suppressContentEditableWarning
      style={multiline ? { whiteSpace: "pre-wrap" } : undefined}
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
    >
      {value}
    </Tag>
  );
}
