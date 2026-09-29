import type { ComponentType, SVGProps } from "react";

import { DotsThree } from "@phosphor-icons/react/dist/csr/DotsThree";
import { House } from "@phosphor-icons/react/dist/csr/House";
import { Image } from "@phosphor-icons/react/dist/csr/Image";
import { Key } from "@phosphor-icons/react/dist/csr/Key";
import { LockKey } from "@phosphor-icons/react/dist/csr/LockKey";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { Moon } from "@phosphor-icons/react/dist/csr/Moon";
import { MusicNotes } from "@phosphor-icons/react/dist/csr/MusicNotes";
import { Play } from "@phosphor-icons/react/dist/csr/Play";
import { Plus } from "@phosphor-icons/react/dist/csr/Plus";
import { Queue } from "@phosphor-icons/react/dist/csr/Queue";
import { Repeat } from "@phosphor-icons/react/dist/csr/Repeat";
import { RepeatOnce } from "@phosphor-icons/react/dist/csr/RepeatOnce";
import { Shuffle } from "@phosphor-icons/react/dist/csr/Shuffle";
import { SkipBack } from "@phosphor-icons/react/dist/csr/SkipBack";
import { SkipForward } from "@phosphor-icons/react/dist/csr/SkipForward";
import { SpeakerHigh } from "@phosphor-icons/react/dist/csr/SpeakerHigh";
import { SpeakerLow } from "@phosphor-icons/react/dist/csr/SpeakerLow";
import { SpeakerSlash } from "@phosphor-icons/react/dist/csr/SpeakerSlash";
import { Trash } from "@phosphor-icons/react/dist/csr/Trash";
import { UploadSimple } from "@phosphor-icons/react/dist/csr/UploadSimple";
import { VinylRecord } from "@phosphor-icons/react/dist/csr/VinylRecord";
import { X } from "@phosphor-icons/react/dist/csr/X";
import { CloudRain } from "@phosphor-icons/react/dist/csr/CloudRain";

export type IconProps = SVGProps<SVGSVGElement>;

type Weight = "thin" | "light" | "regular" | "bold" | "fill" | "duotone";

type PhosphorIcon = ComponentType<
  { weight?: Weight; size?: string | number; mirrored?: boolean } & SVGProps<SVGSVGElement>
>;

/**
 * The weight is chosen here, once, so the whole set reads as one family:
 * transport and volume are solid like a record player's buttons, while
 * navigation and utility icons stay as thin outlines. Callers only ever pass
 * `className`, which keeps sizing and colour decisions in the components that
 * actually own the layout.
 */
function icon(Component: PhosphorIcon, weight: Weight) {
  return function Icon({ "aria-label": ariaLabel, ...props }: IconProps) {
    return (
      <Component
        weight={weight}
        aria-hidden={ariaLabel ? undefined : true}
        {...props}
      />
    );
  };
}

export const PlayIcon = icon(Play, "fill");
export const NextIcon = icon(SkipForward, "fill");
export const PreviousIcon = icon(SkipBack, "fill");
export const VolumeIcon = icon(SpeakerHigh, "fill");
export const VolumeLowIcon = icon(SpeakerLow, "fill");
export const MutedIcon = icon(SpeakerSlash, "fill");

export const ShuffleIcon = icon(Shuffle, "regular");
export const RepeatIcon = icon(Repeat, "regular");
export const RepeatOneIcon = icon(RepeatOnce, "regular");
export const QueueIcon = icon(Queue, "regular");
export const SearchIcon = icon(MagnifyingGlass, "regular");
export const HomeIcon = icon(House, "regular");
export const ImageIcon = icon(Image, "regular");

export const PlusIcon = icon(Plus, "bold");
export const TrashIcon = icon(Trash, "bold");
export const CloseIcon = icon(X, "bold");
export const MoreIcon = icon(DotsThree, "bold");

export const MusicIcon = icon(MusicNotes, "fill");
export const LibraryIcon = icon(VinylRecord, "fill");
export const UploadIcon = icon(UploadSimple, "fill");
export const MoonIcon = icon(Moon, "fill");
export const RainIcon = icon(CloudRain, "fill");
export const LockIcon = icon(LockKey, "fill");
export const KeyIcon = icon(Key, "fill");

/**
 * Not a Phosphor icon, same as the equalizer below.
 *
 * These bars were previously 80 wide around a 24 gap, which is too heavy: the
 * bars were more than three times the gap, so at 16px they filled in as two
 * solid blocks. They are 36 wide around a 40 gap now, so the gap is wider than
 * a bar and the glyph stays legible when small.
 */
export function PauseIcon({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      fill="currentColor"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="M80,40h20a8,8,0,0,1,8,8v160a8,8,0,0,1-8,8H80a8,8,0,0,1-8-8V48A8,8,0,0,1,80,40Zm76,0h20a8,8,0,0,1,8,8v160a8,8,0,0,1-8,8H156a8,8,0,0,1-8-8V48A8,8,0,0,1,156,40Z" />
    </svg>
  );
}

/**
 * Not a Phosphor icon. Three bars, animated to show this is the thing
 * currently playing. The delays are staggered in globals.css so they do not
 * move in lockstep.
 */
export function EqualizerIcon({ className }: { className?: string }) {
  return (
    <span
      className={`flex h-4 w-4 items-end justify-between ${className ?? ""}`}
      aria-hidden="true"
    >
      <span className="equalizer-bar h-full w-[2px] rounded-sm bg-current" />
      <span className="equalizer-bar h-full w-[2px] rounded-sm bg-current" />
      <span className="equalizer-bar h-full w-[2px] rounded-sm bg-current" />
    </span>
  );
}
