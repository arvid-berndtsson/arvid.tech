import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export interface RecommendationAvatarProps {
  name: string;
  className?: string;
}

/**
 * Avatar with initial fallback for recommendations/testimonials.
 * Wraps Avatar + AvatarFallback in one React component so Radix context is preserved when used from Astro.
 */
export function RecommendationAvatar({
  name,
  className,
}: RecommendationAvatarProps) {
  return (
    <Avatar
      className={`size-10 shrink-0 rounded-full bg-amber-600 text-white ${className ?? ""}`}
    >
      <AvatarFallback className="bg-amber-600 text-white text-sm font-semibold rounded-full">
        {name.charAt(0)}
      </AvatarFallback>
    </Avatar>
  );
}
