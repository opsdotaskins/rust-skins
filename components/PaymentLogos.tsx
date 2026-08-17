import Image from "next/image";

/** Full-colour Visa, Mastercard and PCI DSS marks. Never greyscale. */
const MARKS = [
  { src: "/payments/visa.svg", label: "Visa" },
  { src: "/payments/mastercard.svg", label: "Mastercard" },
  { src: "/payments/pci-dss.svg", label: "PCI DSS Compliant" },
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
            width={2501}
            height={1384}
            className="h-5 w-auto"
          />
        </span>
      ))}
    </div>
  );
}
