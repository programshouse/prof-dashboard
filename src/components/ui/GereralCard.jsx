// src/components/ui/GeneralCard.jsx
import React from "react";
import PropTypes from "prop-types";

/**
 * GeneralCard — polished, reusable card
 *
 * Extras vs previous:
 * - variants: "elevated" | "outline" | "soft"
 * - compact: tighter vertical rhythm
 * - isLoading: skeleton state
 * - badge: small label on image (e.g., "New", "Pro")
 * - improved hover/focus ring & depth
 * - graceful image fallback with initials
 */
export default function GeneralCard({
  image,
  imageAlt = "Image",
  title,
  subtitle,
  description,
  tags = [],
  href,
  onClick,
  rightSlot,
  footer,
  actions = [],
  orientation = "vertical",
  clamp = 3,
  className = "",
  children,
  variant = "elevated",
  compact = false,
  isLoading = false,
  badge, // string | ReactNode
}) {
  // Resolve image src
  const imgSrc =
    typeof image === "string"
      ? image
      : image instanceof File
      ? URL.createObjectURL(image)
      : null;

  const clickable = !!onClick || !!href;

  // Variant styles
  const variantBase =
    variant === "outline"
      ? "border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800"
      : variant === "soft"
      ? "border border-transparent bg-gray-50/80 dark:bg-gray-800/60"
      : // elevated (default)
        "border border-gray-100/80 dark:border-gray-800/70 bg-white dark:bg-gray-800 shadow-sm";

  const hoverRing =
    "hover:shadow-md hover:shadow-gray-200/50 dark:hover:shadow-black/30 hover:border-gray-200/90";

  const paddingX = orientation === "horizontal" ? "p-4" : compact ? "p-4" : "p-5";

  // Wrapper behavior
  const Wrapper = ({ children: wChildren }) =>
    clickable ? (
      <a
        href={href || "#"}
        onClick={(e) => {
          if (!href && onClick) {
            e.preventDefault();
            onClick(e);
          }
        }}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/70 rounded-xl"
      >
        {wChildren}
      </a>
    ) : (
      <div>{wChildren}</div>
    );

  // Initials if no image
  const initials =
    !imgSrc && typeof title === "string"
      ? title
          .split(" ")
          .map((w) => w?.[0])
          .filter(Boolean)
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : null;

  // Skeleton pieces
  if (isLoading) {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl ${variantBase} ${className}`}
      >
        <div className="animate-pulse">
          {/* Image skeleton */}
          <div
            className={`${
              orientation === "horizontal" ? "h-28 w-full" : "aspect-[16/9] w-full"
            } bg-gray-200/70 dark:bg-gray-700 rounded-t-2xl`}
          />
          {/* Body skeleton */}
          <div className={`${paddingX} space-y-3`}>
            <div className="h-4 w-1/3 rounded bg-gray-200/80 dark:bg-gray-700" />
            <div className="h-3 w-2/3 rounded bg-gray-200/70 dark:bg-gray-700" />
            <div className="h-3 w-full rounded bg-gray-200/60 dark:bg-gray-700" />
            <div className="h-3 w-5/6 rounded bg-gray-200/60 dark:bg-gray-700" />
            <div className="mt-2 flex gap-2">
              <div className="h-8 w-20 rounded-lg bg-gray-200/70 dark:bg-gray-700" />
              <div className="h-8 w-20 rounded-lg bg-gray-200/70 dark:bg-gray-700" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Title element (clickable when href)
  const TitleEl = title ? (
    href ? (
      <span
        className="line-clamp-1 text-[15px] font-semibold text-gray-900 decoration-brand-600/40 hover:underline dark:text-gray-100"
        title={typeof title === "string" ? title : undefined}
      >
        {title}
      </span>
    ) : (
      <div
        className="line-clamp-1 text-[15px] font-semibold text-gray-900 dark:text-gray-100"
        title={typeof title === "string" ? title : undefined}
      >
        {title}
      </div>
    )
  ) : null;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl transition-all duration-200 ${variantBase} ${hoverRing} ${className}`}
    >
      {/* Subtle gradient ring on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-200 group-hover:opacity-100"
           style={{
             background:
               "radial-gradient(800px 240px at 0% 0%, rgba(79,111,180,0.12), transparent 60%)",
           }}
      />

      <Wrapper>
        {/* Layout */}
        <div className={orientation === "horizontal" ? "flex gap-4" : ""}>
          {/* Media */}
          <div
            className={
              orientation === "horizontal"
                ? "relative w-40 shrink-0 overflow-hidden rounded-l-2xl lg:rounded-xl"
                : "relative aspect-[16/9] w-full overflow-hidden rounded-b-none rounded-t-2xl"
            }
          >
            {imgSrc ? (
              <>
                <img
                  src={imgSrc}
                  alt={imageAlt}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  loading="lazy"
                />
                {/* Image gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-black/0 to-transparent opacity-80" />
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300">
                <div className="text-lg font-semibold tracking-wide">{initials || "—"}</div>
              </div>
            )}

            {/* Badge (optional) */}
            {badge && (
              <div className="absolute left-2 top-2 rounded-full bg-brand-600 px-2 py-0.5 text-[11px] font-medium text-white shadow">
                {badge}
              </div>
            )}
          </div>

          {/* Content */}
          <div className={`${paddingX} ${orientation === "horizontal" ? "flex-1" : ""}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {TitleEl}
                {subtitle && (
                  <div className="mt-0.5 line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
                    {subtitle}
                  </div>
                )}
              </div>
              {rightSlot}
            </div>

            {/* Tags */}
            {tags?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map((t, i) => (
                  <span
                    key={i}
                    className="rounded-full border border-gray-200 bg-white/70 px-2 py-0.5 text-xs text-gray-600 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-300"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            {description && (
              <p
                className={`mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300 ${compact ? "mt-1" : ""}`}
                style={
                  clamp
                    ? {
                        display: "-webkit-box",
                        WebkitLineClamp: clamp,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }
                    : undefined
                }
                title={typeof description === "string" ? description : undefined}
              >
                {description}
              </p>
            )}

            {/* Children (custom slot) */}
            {children}

            {/* Actions */}
            {actions?.length > 0 && (
              <div className={`mt-3 flex flex-wrap gap-2 ${compact ? "mt-2" : ""}`}>
                {actions.map((a, idx) => {
                  const base =
                    "inline-flex h-9 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium transition focus:outline-none";
                  const variants = {
                    primary:
                      "bg-brand-600 text-white hover:bg-brand-700 focus:ring-2 focus:ring-brand-500",
                    danger:
                      "border border-error-300 text-error-700 hover:bg-error-50 dark:border-error-700 dark:text-error-300 dark:hover:bg-error-900/30",
                    ghost:
                      "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700",
                  };
                  return (
                    <button
                      key={idx}
                      onClick={a.onClick}
                      type="button"
                      className={`${base} ${variants[a.variant || "ghost"]}`}
                    >
                      {a.icon && <span className="text-[16px]">{a.icon}</span>}
                      {a.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer slot */}
        {footer && (
          <div className="mt-4 border-t border-gray-100 bg-gray-50/60 p-3 text-sm dark:border-gray-700 dark:bg-gray-900/40">
            {footer}
          </div>
        )}
      </Wrapper>
    </div>
  );
}

GeneralCard.propTypes = {
  image: PropTypes.any,
  imageAlt: PropTypes.string,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  subtitle: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  tags: PropTypes.arrayOf(PropTypes.string),
  href: PropTypes.string,
  onClick: PropTypes.func,
  rightSlot: PropTypes.node,
  footer: PropTypes.node,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func,
      variant: PropTypes.oneOf(["primary", "danger", "ghost"]),
      icon: PropTypes.node,
    })
  ),
  orientation: PropTypes.oneOf(["vertical", "horizontal"]),
  clamp: PropTypes.number,
  className: PropTypes.string,
  children: PropTypes.node,
  variant: PropTypes.oneOf(["elevated", "outline", "soft"]),
  compact: PropTypes.bool,
  isLoading: PropTypes.bool,
  badge: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
};
