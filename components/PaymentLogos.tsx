import Image from "next/image";

/** Full-colour Visa, Mastercard and 3D Secure marks. Never greyscale. */
const MARKS = [
  { src: "/payments/visa.svg", label: "Visa", width: 2501, height: 1384, h: "h-5" },
  { src: "/payments/mastercard.svg", label: "Mastercard", width: 2501, height: 1384, h: "h-5" },
  // Square shield: a touch taller so "3D SECURE" stays legible in the same pill.
  { src: "/payments/3ds.svg", label: "3D Secure", width: 404, height: 440, h: "h-6" },
] as const;

export function PaymentLogos({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {MARKS.map((m) => (
        <span
          key={m.src}
          className="grid h-8 place-items-center rounded-md bg-white px-2 shadow-sm ring-1 ring-black/5"
        >
          <Image
            src={m.src}
            alt={m.label}
            width={m.width}
            height={m.height}
            className={`${m.h} w-auto`}
          />
        </span>
      ))}
    </div>
  );
}
