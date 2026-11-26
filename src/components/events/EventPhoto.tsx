import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { Link } from "react-router";
import type { EventImage } from "../../types/events";

interface EventPhotoProps {
  image: EventImage | null;
  title: string;
  href?: string;
  large?: boolean;
}

export function EventPhoto({
  image,
  title,
  href,
  large = false,
}: EventPhotoProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const available = image !== null && image.url !== failedUrl;
  const photo = available ? (
    <img
      src={image.url}
      alt={image.alt || title}
      loading={large ? "eager" : "lazy"}
      onError={() => setFailedUrl(image.url)}
      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03] motion-reduce:transform-none"
    />
  ) : (
    <div
      role="img"
      aria-label={`Зображення для події «${title}» відсутнє`}
      className="flex h-full items-center justify-center bg-[#e9ede5] text-[#8b9785]"
    >
      <CalendarDays className="size-14" aria-hidden="true" strokeWidth={1} />
    </div>
  );

  return (
    <figure>
      <div
        className={`overflow-hidden bg-stone-100 ${large ? "aspect-[16/9] rounded-3xl" : "aspect-[16/10] rounded-t-2xl"}`}
      >
        {href ? (
          <Link
            to={href}
            tabIndex={-1}
            aria-hidden="true"
            className="block h-full"
          >
            {photo}
          </Link>
        ) : (
          photo
        )}
      </div>
      {available && (
        <figcaption
          className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] leading-relaxed text-stone-500 ${large ? "mt-2" : "px-4 pt-2"}`}
        >
          <span>Фото — {image.photographer || "Linked Events"}</span>
          {image.licenseUrl && (
            <a
              href={image.licenseUrl}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2"
            >
              {image.license || "Ліцензія"}
            </a>
          )}
        </figcaption>
      )}
    </figure>
  );
}
