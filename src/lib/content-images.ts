type ImageLike = string | { src: string } | undefined;

export function toImageSrc(image: ImageLike): string | undefined {
  if (!image) return undefined;
  if (typeof image === "string") return image;
  return image.src;
}
