import Image from "next/image";
import type { ComponentProps } from "react";

export type YatraImageProps = ComponentProps<typeof Image>;

/**
 * Wikimedia throttles the node-based image optimizer, so Commons URLs are
 * marked unoptimized and fetched straight by the browser (which Wikimedia
 * serves without rate limits). All other sources stay optimized.
 */
export function Img({ src, ...rest }: YatraImageProps) {
  const isWikimedia = typeof src === "string" && src.includes("wikimedia.org");
  return <Image src={src} unoptimized={isWikimedia} {...rest} />;
}

export default Img;