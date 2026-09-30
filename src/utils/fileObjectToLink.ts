import config from "@/config";
import { TFileDocument } from "@/types";

/**
 * Convert a TFileDocument-like object (or string) into a usable URL.
 *
 * Falls back to the configured AWS CDN url, then to the file's own
 * `originalUrl`/`url`, and finally to a placeholder image.
 */
export default function fileObjectToLink(src: TFileDocument | string | null | undefined) {
    let imageSrc;

    if (src && typeof src === "object" && "path" in src) {
        imageSrc = config.aws_cdn_url + "/" + src.path;
    } else if (src && typeof src === "object" && "originalUrl" in src && src.originalUrl) {
        imageSrc = src.originalUrl;
    } else if (src && typeof src === "object" && "url" in src && src.url) {
        imageSrc = src.url;
    } else if (typeof src === "string") {
        imageSrc = src;
    } else if (src && typeof src === "object") {
        imageSrc = "/placeholder.png?height=36&width=36&query=user";
    } else if (src) {
        imageSrc = src;
    } else {
        imageSrc = "/placeholder.png?height=36&width=36&query=user";
    }
    return imageSrc as string;
}