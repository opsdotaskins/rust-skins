import { NextResponse } from "next/server";
import { verifyCorefyWebhookSignature } from "@/lib/corefy";
import { handleCorefyPaymentWebhook } from "@/lib/orders";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const signature = req.headers.get("x-signature") || req.headers.get("X-Signature");
  const rawBody = await req.text();

  if (!rawBody) {
    return NextResponse.json({ error: "Empty request body" }, { status: 400 });
  }

  const isValid = verifyCorefyWebhookSignature(rawBody, signature);
  if (!isValid) {
    console.error("Corefy webhook signature mismatch:", { signature });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let payload: {
    data?: {
      id?: string;
      type?: string;
      attributes?: {
        reference_id?: string;
        amount?: number;
        processed_amount?: number;
        currency?: string;
        status?: string;
        resolution?: string;
        test_mode?: boolean;
      };
    };
  };

  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const refId = payload?.data?.attributes?.reference_id || "";

  try {
    const result = await handleCorefyPaymentWebhook(payload);
    return NextResponse.json({
      status: "ok",
      reference_id: result.reference_id || refId,
    });
  } catch (err) {
    console.error("Error processing Corefy webhook:", err);
    return NextResponse.json(
      { error: "Webhook processing error", reference_id: refId },
      { status: 500 }
    );
  }
}
