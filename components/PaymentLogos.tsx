import Image from "next/image";

/** Full-colour Visa and Mastercard marks (+ PCI 3DS in the footer). Never greyscale. */
const MARKS = [
  { src: "/payments/visa.svg", label: "Visa", width: 2501, height: 1384, h: "h-7" },
  { src: "/payments/mastercard.svg", label: "Mastercard", width: 2501, height: 1384, h: "h-7" },
] as const;

const PCI_3DS = { src: "/payments/pci-3ds.webp", label: "PCI 3DS", width: 1133, height: 435, h: "h-6" } as const;

export function PaymentLogos({
  className = "",
  withPci3ds = false,
}: {
  className?: string;
  withPci3ds?: boolean;
}) {
  const marks = withPci3ds ? [...MARKS, PCI_3DS] : MARKS;
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {marks.map((m) => (
        <span
          key={m.src}
          className="grid h-11 place-items-center rounded-lg bg-white px-3 shadow-sm ring-1 ring-black/5"
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
