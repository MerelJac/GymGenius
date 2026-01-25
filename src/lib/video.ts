export function getEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);

    // YouTube
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (parsed.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${parsed.pathname}`;
    }

    // Vimeo
    if (parsed.hostname.includes("vimeo.com")) {
      const id = parsed.pathname.split("/").pop();
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }

    // Direct video file
    if (url.match(/\.(mp4|webm)$/)) {
      return url;
    }

    return null;
  } catch {
    return null;
  }
}
