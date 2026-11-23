import Image from "next/image";

/** Full-colour Visa and Mastercard marks (+ PCI DSS in the footer). Never greyscale. */
const MARKS = [
  { src: "/payments/visa.svg", label: "Visa", width: 2501, height: 1384, h: "h-5" },
  { src: "/payments/mastercard.svg", label: "Mastercard", width: 2501, height: 1384, h: "h-5" },
] as const;

const PCI_DSS = { src: "/payments/pci-dss.svg", label: "PCI DSS Compliant", width: 2501, height: 1384, h: "h-5" } as const;

export function PaymentLogos({
  className = "",
  withPciDss = false,
}: {
  className?: string;
  withPciDss?: boolean;
}) {
  const marks = withPciDss ? [...MARKS, PCI_DSS] : MARKS;
  return (
    <div className={`flex flex-wrap items-center gap-2.5 ${className}`}>
      {marks.map((m) => (
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
