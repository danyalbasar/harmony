import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function PlayIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M8 5.14v13.72c0 .8.87 1.29 1.55.87l11.2-6.86a1.03 1.03 0 0 0 0-1.74L9.55 4.27A1.03 1.03 0 0 0 8 5.14Z" />
    </Icon>
  );
}

export function PauseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M7 4a1 1 0 0 1 2 0v16a1 1 0 0 1-2 0V4Zm8 0a1 1 0 0 1 2 0v16a1 1 0 0 1-2 0V4Z" />
    </Icon>
  );
}

export function NextIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 5.5a1 1 0 0 1 2 0v4.2l8.2-5.05A1 1 0 0 1 18 5.5v13a1 1 0 0 1-1.8.6L8 14.3V18.5a1 1 0 0 1-2 0v-13Z" />
      <path d="M20 5a1 1 0 0 1 1 1v12a1 1 0 0 1-2 0V6a1 1 0 0 1 1-1Z" />
    </Icon>
  );
}

export function PreviousIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M18 5.5a1 1 0 0 0-2 0v4.2L7.8 4.65A1 1 0 0 0 6 5.5v13a1 1 0 0 0 1.8.6L16 14.3v4.2a1 1 0 0 0 2 0v-13Z" />
      <path d="M4 5a1 1 0 0 0-1 1v12a1 1 0 0 0 2 0V6a1 1 0 0 0-1-1Z" />
    </Icon>
  );
}

export function ShuffleIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M17.65 6.35A.75.75 0 0 0 17 6h-2.1a3 3 0 0 0-2.4 1.2l-.4.53-.9-1.2A3 3 0 0 0 8.8 5H7a.75.75 0 0 0 0 1.5h1.8c.6 0 1.17.3 1.53.79l.9 1.2-1.2 1.6-.5.67a3 3 0 0 1-2.4 1.2H5a.75.75 0 0 0 0 1.5h1.9c.6 0 1.17-.3 1.53-.79l.5-.66 2.5 3.34A3 3 0 0 0 13.8 17H17a.75.75 0 0 0 0-1.5h-3.2c-.6 0-1.17-.3-1.53-.79l-.9-1.2 1.2-1.6.4-.53a1.5 1.5 0 0 1 1.2-.6h2.1a.75.75 0 0 0 0-1.5h-2.1a3 3 0 0 0-2.4 1.2l-.4.52-.9-1.2A3 3 0 0 0 10.7 5H17a.75.75 0 0 1 .65.35Z" />
      <path d="M14.2 13.2a.75.75 0 0 1 1.06-.02l.9 1.2a1.5 1.5 0 0 0 1.53.79H19a.75.75 0 0 1 0 1.5h-1.3a3 3 0 0 1-2.4-1.2l-.4-.53a.75.75 0 0 1 .3-.74Z" />
    </svg>
  );
}

export function RepeatIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M7 5h8a4 4 0 0 1 4 4v1.5h1.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75V9A2.5 2.5 0 0 0 15 6.5H7a.75.75 0 0 1 0-1.5ZM5.25 12H7a.75.75 0 0 1 0 1.5H5.25V15A2.5 2.5 0 0 0 7.75 17.5h8a.75.75 0 0 1 0 1.5h-8A4 4 0 0 1 3.75 15v-2.25A.75.75 0 0 1 5.25 12Z" />
      <path d="M16.5 4.25a.75.75 0 0 1 .53.22l2.25 2.25a.75.75 0 0 1 0 1.06l-2.25 2.25a.75.75 0 1 1-1.06-1.06l.97-.97H7.5a.75.75 0 0 1 0-1.5h9.44l-.97-.97a.75.75 0 0 1 .53-1.28Z" />
    </Icon>
  );
}

export function RepeatOneIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M7 5h8a4 4 0 0 1 4 4v1.5h1.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75V9A2.5 2.5 0 0 0 15 6.5H7a.75.75 0 0 1 0-1.5ZM5.25 12H7a.75.75 0 0 1 0 1.5H5.25V15A2.5 2.5 0 0 0 7.75 17.5h8a.75.75 0 0 1 0 1.5h-8A4 4 0 0 1 3.75 15v-2.25A.75.75 0 0 1 5.25 12Z" />
      <path d="M11.5 10.75a.75.75 0 0 1 1.2-.6l.5.5a.75.75 0 0 1 0 1.06l-.5.5a.75.75 0 1 1-1.06-1.06l.5-.5a.75.75 0 0 1-.64.1Z" />
    </Icon>
  );
}

export function VolumeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M11.3 3.6a1 1 0 0 1 1.7.7v15.4a1 1 0 0 1-1.7.7L6.9 17.1H4.75A1.75 1.75 0 0 1 3 15.35v-6.7C3 7.25 3.65 6 5 6h1.9l4.4-2.4Z" />
    </Icon>
  );
}

export function VolumeLowIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M11.3 3.6a1 1 0 0 1 1.7.7v15.4a1 1 0 0 1-1.7.7L6.9 17.1H4.75A1.75 1.75 0 0 1 3 15.35v-6.7C3 7.25 3.65 6 5 6h1.9l4.4-2.4Z" />
      <path d="M15.5 8.5a.75.75 0 0 1 1.06.06 5 5 0 0 1 0 6.88.75.75 0 1 1-1.12-1 3.5 3.5 0 0 0 0-4.88.75.75 0 0 1 .06-1.06Zm2.6-2.6a.75.75 0 0 1 1.06.06 8.5 8.5 0 0 1 0 11.68.75.75 0 0 1-1.12-1.06 7 7 0 0 0 0-9.56.75.75 0 0 1 .06-1.12Z" />
    </svg>
  );
}

export function MutedIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M11.3 3.6a1 1 0 0 1 1.7.7v15.4a1 1 0 0 1-1.7.7L6.9 17.1H4.75A1.75 1.75 0 0 1 3 15.35v-6.7C3 7.25 3.65 6 5 6h1.9l4.4-2.4Z" />
      <path d="M16.28 9.22a.75.75 0 0 1 1.06 0l.72.72.72-.72a.75.75 0 1 1 1.06 1.06L19.12 11l.72.72a.75.75 0 1 1-1.06 1.06l-.72-.72-.72.72a.75.75 0 0 1-1.06-1.06l.72-.72-.72-.72a.75.75 0 0 1 0-1.06Z" />
    </Icon>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M10.5 3a7.5 7.5 0 1 0 4.55 13.46l4.24 4.25a1 1 0 0 0 1.42-1.42l-4.25-4.24A7.5 7.5 0 0 0 10.5 3Zm0 2a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11Z" />
    </svg>
  );
}

export function HomeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12.3 2.6a1 1 0 0 0-1.52 0l-8 6.4A1 1 0 0 0 2.5 9.8V19a2.5 2.5 0 0 0 2.5 2.5h3.75a.75.75 0 0 0 .75-.75v-5.5a1.5 1.5 0 0 1 1.5-1.5h1a1.5 1.5 0 0 1 1.5 1.5v5.5a.75.75 0 0 0 .75.75h3.75A2.5 2.5 0 0 0 20.5 19V9.8a1 1 0 0 0-.28-.7l-7.92-6.5Z" />
    </Icon>
  );
}

export function LibraryIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 5.5A1.5 1.5 0 0 1 4.5 4h1A1.5 1.5 0 0 1 7 5.5v13A1.5 1.5 0 0 1 5.5 20h-1A1.5 1.5 0 0 1 3 18.5v-13Zm5 0A1.5 1.5 0 0 1 9.5 4h1A1.5 1.5 0 0 1 12 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-1A1.5 1.5 0 0 1 8 18.5v-13Zm7.9-.28a1.5 1.5 0 0 1 .8 1.9l-2.2 8a1.5 1.5 0 0 1-2.84-.78l2.2-8a1.5 1.5 0 0 1 1.9-.8l.14.68Z" />
    </Icon>
  );
}

export function MusicIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M19 3.4a1 1 0 0 0-1.27-.83l-9 2.6A1 1 0 0 0 8 6.13v9.6a4 4 0 1 0 2 3.46V9.4l7-2.02v5.66a4 4 0 1 0 2 3.46V3.4Z" />
    </Icon>
  );
}

export function UploadIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 3.25a.75.75 0 0 1 .53.22l4 4a.75.75 0 1 1-1.06 1.06L12.75 5.81v9.44a.75.75 0 0 1-1.5 0V5.81L8.53 8.53a.75.75 0 0 1-1.06-1.06l4-4a.75.75 0 0 1 .53-.22Z" />
      <path d="M4.5 13a.75.75 0 0 1 .75.75v4.5c0 .41.34.75.75.75h12a.75.75 0 0 0 .75-.75v-4.5a.75.75 0 0 1 1.5 0v4.5a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18.25v-4.5A.75.75 0 0 1 4.5 13Z" />
    </svg>
  );
}

export function QueueIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 6.25a.75.75 0 0 1 .75-.75h11.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.25Zm0 5.5a.75.75 0 0 1 .75-.75h11.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 11.75Zm0 5.5a.75.75 0 0 1 .75-.75h7a.75.75 0 0 1 0 1.5h-7a.75.75 0 0 1-.75-.75Z" />
      <path d="M18.75 6.5a.75.75 0 0 1 .75.75v8.19l1.72-1.72a.75.75 0 1 1 1.06 1.06l-3 3a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 1 1 1.06-1.06l1.72 1.72V7.25a.75.75 0 0 1 .75-.75Z" />
    </Icon>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 4a.75.75 0 0 1 .75.75v6.5h6.5a.75.75 0 0 1 0 1.5h-6.5v6.5a.75.75 0 0 1-1.5 0v-6.5h-6.5a.75.75 0 0 1 0-1.5h6.5v-6.5A.75.75 0 0 1 12 4Z" />
    </Icon>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M9 3.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v.5h3.25a.75.75 0 0 1 0 1.5h-.72l-.75 12.4A2.75 2.75 0 0 1 14.03 19.5H9.97a2.75 2.75 0 0 1-2.75-2.6L6.47 6.5H5.75a.75.75 0 0 1 0-1.5H9v-.5Zm1.5.5h3v-.5h-3V4Z" />
      <path d="M10.25 9a.75.75 0 0 1 .75.75v5.5a.75.75 0 0 1-1.5 0v-5.5A.75.75 0 0 1 10.25 9Zm4.25.75a.75.75 0 0 0-1.5 0v5.5a.75.75 0 0 0 1.5 0v-5.5Z" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M5.7 4.3a1 1 0 0 1 1.4 0L12 9.2l4.9-4.9a1 1 0 1 1 1.4 1.4L13.4 10.6l4.9 4.9a1 1 0 0 1-1.4 1.4L12 12l-4.9 4.9a1 1 0 0 1-1.4-1.4l4.9-4.9-4.9-4.9a1 1 0 0 1 0-1.4Z" />
    </svg>
  );
}

export function ImageIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M4.5 3.5h15A2.5 2.5 0 0 1 22 6v12a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 18V6a2.5 2.5 0 0 1 2.5-2.5Zm0 1.5A1 1 0 0 0 3.5 6v12c0 .55.45 1 1 1h15a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-15Z" />
      <path d="M8.75 8a1.75 1.75 0 1 1 0 3.5 1.75 1.75 0 0 1 0-3.5ZM4.5 17.5c.83-1.2 1.7-1.8 2.6-1.8.98 0 1.94.72 3 2.16.28.38.63.85 1.03 1.2l1.2-1.5c.9-1.13 1.86-1.7 2.87-1.7 1.02 0 2.06.7 3.3 2.25l1.5 2.16v1.39h-15.5Z" />
    </svg>
  );
}

export function MoreIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 7.5a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5Zm0 6.25a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5Zm0 6.25a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5Z" />
    </Icon>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </Icon>
  );
}

export function RainIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M17.5 15a4.5 4.5 0 0 0-.5-8.97A6 6 0 0 0 5.2 7.5 3.75 3.75 0 0 0 5.5 15h12Z" />
      <path
        d="M8 17.5 6.5 21M12 17.5 10.5 21M16 17.5 14.5 21"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Icon>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="M7 10V7a5 5 0 0 1 10 0v3h.5A1.5 1.5 0 0 1 19 11.5v8A1.5 1.5 0 0 1 17.5 21h-11A1.5 1.5 0 0 1 5 19.5v-8A1.5 1.5 0 0 1 6.5 10H7Zm2 0h6V7a3 3 0 0 0-6 0v3Z"
      />
    </Icon>
  );
}

export function KeyIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M14 3a6 6 0 1 0-4.2 10.3L4 19v2h4l1-1v-2h2v-2h2l.7-.7A6 6 0 0 0 14 3Zm2.5 4.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" />
    </Icon>
  );
}

export function EqualizerIcon({ className }: { className?: string }) {
  return (
    <span className={`flex h-4 w-4 items-end justify-between ${className ?? ""}`} aria-hidden="true">
      <span className="equalizer-bar h-full w-[3px] rounded-sm bg-current" />
      <span className="equalizer-bar h-full w-[3px] rounded-sm bg-current" />
    </span>
  );
}
