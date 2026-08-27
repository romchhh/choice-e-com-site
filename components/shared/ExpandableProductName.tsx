type Tag = "h1" | "h2" | "h3" | "p" | "span";

type Props = {
  name: string;
  as?: Tag;
  className?: string;
  /** Max lines when collapsed (desktop expands on group-hover). */
  lines?: 2 | 3;
  /**
   * card/search — clamp + expand on hover
   * page — full text, smaller type when the name is long
   */
  variant?: "card" | "search" | "page";
};

function pageTitleClass(name: string) {
  const len = name.trim().length;
  if (len > 110) return "text-lg leading-snug md:text-xl lg:text-2xl";
  if (len > 70) return "text-xl leading-snug md:text-2xl lg:text-3xl";
  return "text-2xl leading-[1.29] md:text-3xl lg:text-4xl";
}

/**
 * Compact product titles for long set / multi-ingredient names.
 * Parent should have `group` for hover expand (card/search).
 */
export default function ExpandableProductName({
  name,
  as: Tag = "p",
  className = "",
  lines = 2,
  variant = "card",
}: Props) {
  if (variant === "page") {
    const caseClass = name.trim().length > 70 ? "normal-case" : "capitalize";
    return (
      <Tag
        className={`font-semibold tracking-[-0.02em] text-[#3D1A00] ${caseClass} ${pageTitleClass(name)} ${className}`.trim()}
        style={{ fontFamily: "Montserrat, sans-serif" }}
        title={name}
      >
        {name}
      </Tag>
    );
  }

  const clamp =
    lines === 3
      ? "line-clamp-3 group-hover:line-clamp-none"
      : "line-clamp-2 group-hover:line-clamp-none";

  return (
    <Tag
      className={`break-words ${clamp} ${className}`.trim()}
      title={name}
    >
      {name}
    </Tag>
  );
}
