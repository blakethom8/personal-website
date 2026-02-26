import Image from "next/image";

interface PageBackgroundProps {
  src: string;
  alt: string;
  priority?: boolean;
}

export function PageBackground({ src, alt, priority = false }: PageBackgroundProps) {
  return (
    <div className="fixed inset-0 -z-10">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        priority={priority}
        quality={80}
        sizes="100vw"
      />
      {/* Warm overlay */}
      <div
        className="absolute inset-0"
        style={{ background: "var(--overlay)" }}
      />
    </div>
  );
}
