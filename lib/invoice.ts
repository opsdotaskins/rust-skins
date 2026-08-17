import "server-only";
import PDFDocument from "pdfkit";
import { COMPANY, CONTACT_EMAIL, SITE, VALUES } from "./config";

export interface InvoiceData {
  reference: string;
  date: Date;
  customer: { name: string; email: string; address: string };
  lines: { name: string; price: string }[];
  subtotal: string;
  fee?: string;
  total: string;
  currency: string;
}

/** Build a PDF invoice and resolve with a Buffer. Runs in Node runtime. */
export function buildInvoicePdf(data: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c as Buffer));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const gold = "#C68A2E";
    const ink = "#182A21";
    const muted = "#6b7a6f";

    doc
      .fillColor(gold)
      .fontSize(24)
      .font("Helvetica-Bold")
      .text("RUNEVAULT", { continued: false });
    doc
      .fillColor(muted)
      .fontSize(10)
      .font("Helvetica")
      .text("Rust skins store");

    doc.moveDown(1);
    doc
      .fillColor(ink)
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("Invoice");
    doc
      .fillColor(muted)
      .fontSize(10)
      .font("Helvetica")
      .text(`Reference: ${data.reference}`)
      .text(`Date: ${data.date.toLocaleDateString("en-GB")}`);

    doc.moveDown(1);
    doc.fillColor(ink).fontSize(11).font("Helvetica-Bold").text("Billed to");
    doc
      .fillColor(muted)
      .font("Helvetica")
      .fontSize(10)
      .text(data.customer.name)
      .text(data.customer.email)
      .text(data.customer.address);

    doc.moveDown(1);
    doc.fillColor(ink).fontSize(11).font("Helvetica-Bold").text("Seller");
    doc
      .fillColor(muted)
      .font("Helvetica")
      .fontSize(10)
      .text(COMPANY.name)
      .text(COMPANY.address)
      .text(`Reg: ${COMPANY.regNumber}`)
      .text(`${CONTACT_EMAIL} · ${COMPANY.phone}`);

    doc.moveDown(1.2);
    // Table header
    const top = doc.y;
    doc
      .fillColor(ink)
      .font("Helvetica-Bold")
      .fontSize(10)
      .text("Item", 50, top)
      .text("Price", 400, top, { width: 145, align: "right" });
    doc
      .moveTo(50, doc.y + 4)
      .lineTo(545, doc.y + 4)
      .strokeColor("#cccccc")
      .stroke();
    doc.moveDown(0.6);

    doc.font("Helvetica").fillColor(muted).fontSize(10);
    for (const line of data.lines) {
      const y = doc.y;
      doc.text(line.name, 50, y, { width: 340 });
      doc.text(line.price, 400, y, { width: 145, align: "right" });
      doc.moveDown(0.4);
    }

    doc
      .moveTo(50, doc.y + 4)
      .lineTo(545, doc.y + 4)
      .strokeColor("#cccccc")
      .stroke();
    doc.moveDown(0.6);

    const totalsRow = (label: string, value: string, bold = false) => {
      const y = doc.y;
      doc
        .font(bold ? "Helvetica-Bold" : "Helvetica")
        .fillColor(bold ? ink : muted)
        .text(label, 300, y, { width: 90, align: "right" })
        .text(value, 400, y, { width: 145, align: "right" });
      doc.moveDown(0.4);
    };
    totalsRow("Subtotal", data.subtotal);
    if (data.fee) totalsRow("Service fee", data.fee);
    totalsRow("Total", data.total, true);

    doc.moveDown(2);
    doc
      .fillColor(muted)
      .fontSize(8)
      .font("Helvetica")
      .text(
        `Tax is included in the price. Delivery: ${VALUES.deliveryPromise}. Refund window: ${VALUES.refundWindowDays} days. Support: ${VALUES.supportHours}.`,
        50,
        doc.y,
        { width: 495 }
      )
      .moveDown(0.5)
      .text(
        `${SITE.url} · Runevault is not affiliated with or endorsed by Facepunch Studios or Valve Corporation. Rust is a trademark of Facepunch Studios.`,
        { width: 495 }
      );

    doc.end();
  });
}
