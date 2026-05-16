import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/** Design tokens aligned with landing hero: amber accents, uppercase labels, pill tags */
const cardLinkClass =
  "flex flex-col flex-grow min-h-0 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
const titleHoverClass =
  "font-semibold tracking-tight text-lg text-foreground hover:text-amber-800 dark:hover:text-amber-400 transition-colors";
const metaLabelClass =
  "text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground";
const tagPillClass =
  "rounded-full bg-muted/80 dark:bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground";
/** Max tags shown on a card so they don't wrap beyond 2 rows */
const MAX_TAGS_ON_CARD = 5;
const tagsWrapperClass = "flex flex-wrap gap-2 max-h-[3.5rem] overflow-hidden";
const footerLinkClass =
  "text-sm font-semibold text-amber-800 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 transition-colors";

/** Shared options for content list cards */
type ContentCardCommon = {
  /** Heading level for the title */
  titleLevel?: "h2" | "h3";
  /** Max summary lines when space is tight; expands when card has room (via container query) */
  summaryLines?: 2 | 3;
  /** Show tags in content (after first tag in header where used) */
  showExtraTags?: boolean;
};

export type ContentCardProject = ContentCardCommon & {
  variant: "project";
  slug: string;
  title: string;
  summary?: string | null;
  tags?: string[];
  /** Optional date (ISO) shown like Lovable blog cards */
  date?: string | null;
  repoUrl?: string | null;
  demoUrl?: string | null;
  /** Optional cover image (Lovable-style image-first card) */
  coverImage?: string | null;
  coverImageAlt?: string | null;
};

export type ContentCardThought = ContentCardCommon & {
  variant: "post";
  slug: string;
  title: string;
  summary?: string | null;
  tags?: string[];
  date: string; // ISO
  /** Optional cover image (Lovable-style image-first card) */
  coverImage?: string | null;
  coverImageAlt?: string | null;
};

export type ContentCardBlock = {
  variant: "block";
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

export type ContentCardProps =
  | ContentCardProject
  | ContentCardThought
  | ContentCardBlock;

function formatDate(iso: string, options: Intl.DateTimeFormatOptions = {}) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  });
}

/** Normalize cover image URL (relative → absolute path). */
function coverImageSrc(src: string): string {
  if (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("/")
  ) {
    return src;
  }
  return `/${src}`;
}

/**
 * Content cards modelled on lovable.dev/blog: image-first, whole card is one link,
 * order: image → title → date → optional summary → tags (all tags below excerpt).
 * Single click target; no "Read more" button. Uses shadcn Card only.
 */
export function ContentCard(props: ContentCardProps) {
  if (props.variant === "block") {
    return (
      <Card className={props.className}>
        {(props.title || props.description) && (
          <CardHeader>
            {props.title && (
              <CardTitle className="text-xl">{props.title}</CardTitle>
            )}
            {props.description && (
              <CardDescription>{props.description}</CardDescription>
            )}
          </CardHeader>
        )}
        <CardContent>{props.children}</CardContent>
        {props.footer && <CardFooter>{props.footer}</CardFooter>}
      </Card>
    );
  }

  const { titleLevel = "h2", summaryLines = 3, showExtraTags = true } = props;

  const TitleTag = titleLevel;
  /** Summary uses .card-summary-text in CSS for container-query line-clamp (3 by default, 4–5 when there's room) */
  const summaryTextClass =
    summaryLines === 2
      ? "card-summary-text card-summary-text--max-2"
      : "card-summary-text";

  const getDisplayTags = (tags: string[]) => {
    const display = tags.slice(0, MAX_TAGS_ON_CARD);
    const overflow = tags.length - MAX_TAGS_ON_CARD;
    return { display, overflow };
  };

  /* Hero design language: image-first card, amber accents, pill tags */
  if (props.variant === "project") {
    const href = `/projects/${props.slug}`;
    const hasCover = props.coverImage && props.coverImage.trim() !== "";
    return (
      <Card
        className={`card-interactive flex flex-col h-full overflow-hidden border-border/60 ${hasCover ? "pt-0" : ""}`}
      >
        <a href={href} className={cardLinkClass}>
          {hasCover ? (
            <span className="-mt-px block aspect-video w-full overflow-hidden rounded-t-xl">
              <img
                src={coverImageSrc(props.coverImage!)}
                alt={props.coverImageAlt ?? ""}
                width={400}
                height={225}
                className="block h-full w-full object-cover"
                loading="lazy"
              />
            </span>
          ) : (
            <span className="block h-0 shrink" aria-hidden />
          )}
          <CardHeader
            className={`flex-grow-0 space-y-2 pb-2 ${hasCover ? "pt-4" : ""}`}
          >
            {props.date && (
              <time className={metaLabelClass} dateTime={props.date}>
                {formatDate(props.date)}
              </time>
            )}
            <CardTitle className="leading-tight">
              <TitleTag className={titleHoverClass}>{props.title}</TitleTag>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 flex flex-col flex-grow min-h-0">
            <div className="card-summary-container min-h-0 flex-grow flex flex-col">
              {props.summary ? (
                <p
                  className={`min-h-0 flex-grow text-muted-foreground text-sm leading-relaxed ${summaryTextClass}`}
                >
                  {props.summary}
                </p>
              ) : (
                <span className="block flex-grow min-h-[1.5rem]" aria-hidden />
              )}
            </div>
            {showExtraTags &&
              props.tags &&
              props.tags.length > 0 &&
              (() => {
                const { display, overflow } = getDisplayTags(props.tags);
                return (
                  <div className={`${tagsWrapperClass} mt-3 flex-shrink-0`}>
                    {display.map((tag) => (
                      <span key={tag} className={tagPillClass}>
                        {tag}
                      </span>
                    ))}
                    {overflow > 0 && (
                      <span
                        className={tagPillClass}
                        aria-label={`${overflow} more tags`}
                      >
                        +{overflow}
                      </span>
                    )}
                  </div>
                );
              })()}
          </CardContent>
        </a>
        {(props.repoUrl || props.demoUrl) && (
          <CardFooter className="flex flex-wrap items-center gap-4 border-t border-border/60 pt-4 flex-shrink-0">
            {props.repoUrl && (
              <a
                href={props.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={footerLinkClass}
              >
                GitHub
              </a>
            )}
            {props.demoUrl && (
              <a
                href={props.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={footerLinkClass}
              >
                Demo
              </a>
            )}
          </CardFooter>
        )}
      </Card>
    );
  }

  if (props.variant === "post") {
    const href = `/blog/${props.slug}`;
    const hasCover = props.coverImage && props.coverImage.trim() !== "";
    return (
      <Card
        className={`card-interactive flex flex-col h-full overflow-hidden border-border/60 ${hasCover ? "pt-0" : ""}`}
      >
        <a href={href} className={cardLinkClass}>
          {hasCover ? (
            <span className="-mt-px block aspect-video w-full overflow-hidden rounded-t-xl">
              <img
                src={coverImageSrc(props.coverImage!)}
                alt={props.coverImageAlt ?? ""}
                width={400}
                height={225}
                className="block h-full w-full object-cover"
                loading="lazy"
              />
            </span>
          ) : (
            <span className="block h-0 shrink" aria-hidden />
          )}
          <CardHeader
            className={`flex-grow-0 space-y-2 pb-2 ${hasCover ? "pt-4" : ""}`}
          >
            <time className={metaLabelClass} dateTime={props.date}>
              {formatDate(props.date)}
            </time>
            <CardTitle className="leading-tight">
              <TitleTag className={titleHoverClass}>{props.title}</TitleTag>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 flex flex-col flex-grow min-h-0">
            <div className="card-summary-container min-h-0 flex-grow flex flex-col">
              {props.summary ? (
                <p
                  className={`min-h-0 flex-grow text-muted-foreground text-sm leading-relaxed ${summaryTextClass}`}
                >
                  {props.summary}
                </p>
              ) : (
                <span className="block flex-grow min-h-[1.5rem]" aria-hidden />
              )}
            </div>
            {showExtraTags &&
              props.tags &&
              props.tags.length > 0 &&
              (() => {
                const { display, overflow } = getDisplayTags(props.tags);
                return (
                  <div className={`${tagsWrapperClass} mt-3 flex-shrink-0`}>
                    {display.map((tag) => (
                      <span key={tag} className={tagPillClass}>
                        {tag}
                      </span>
                    ))}
                    {overflow > 0 && (
                      <span
                        className={tagPillClass}
                        aria-label={`${overflow} more tags`}
                      >
                        +{overflow}
                      </span>
                    )}
                  </div>
                );
              })()}
          </CardContent>
        </a>
      </Card>
    );
  }

  return null;
}
