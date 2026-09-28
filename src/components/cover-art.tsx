import { MusicIcon } from "@/components/icons";

type CoverArtProps = {
  src: string | null;
  title: string;
  className?: string;
  rounded?: string;
};

export function CoverArt({
  src,
  title,
  className = "",
  rounded = "rounded-md",
}: CoverArtProps) {
  if (!src) {
    return (
      <div
        className={`flex items-center justify-center bg-[#1b1730] text-[#6f6690] ${rounded} ${className}`}
        aria-label={`No cover art for ${title}`}
      >
        <MusicIcon className="h-1/3 w-1/3" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`Cover art for ${title}`}
      className={`object-cover ${rounded} ${className}`}
      loading="lazy"
    />
  );
}
