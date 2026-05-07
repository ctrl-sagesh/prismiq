import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

function getPlanFromProductName(name: string): "starter" | "pro" | "unlimited" | null {
  const lower = name.toLowerCase();
  if (lower.includes("starter")) return "starter";
  if (lower.includes("pro")) return "pro";
  if (lower.includes("unlimited")) return "unlimited";
  return null;
}

export async function POST(req: NextRequest) {
  // Gumroad sends webhooks as application/x-www-form-urlencoded
  const text = await req.text();
  const params = new URLSearchParams(text);

  const sellerIdFromPayload = params.get("seller_id") ?? "";
  const expectedSellerId = process.env.GUMROAD_SELLER_ID ?? "";

  // Verify this webhook is from our Gumroad account
  // Note: Gumroad sends seller_id as a base64-encoded string
  if (expectedSellerId && sellerIdFromPayload !== expectedSellerId) {
    console.error("Gumroad webhook seller_id mismatch:", sellerIdFromPayload);
    return NextResponse.json({ error: "Invalid seller" }, { status: 401 });
  }

  const email = params.get("email") ?? "";
  const productName = params.get("product_name") ?? "";
  const saleId = params.get("sale_id") ?? "";
  const subscriptionId = params.get("subscription_id") ?? "";
  const refunded = params.get("refunded") === "true";
  const cancelled = params.get("cancelled") === "true";
  const ended = params.get("subscription_ended_at") ?? "";

  if (!email) return NextResponse.json({ ok: true });

  const plan = getPlanFromProductName(productName);

  // New sale / subscription renewal
  if (!refunded && !cancelled && !ended) {
    if (plan) {
      await supabase.from("users").upsert({
        email,
        plan,
        scans_used: 0,
        period_start: null,
        scans_reset_at: new Date().toISOString(),
        gumroad_sale_id: saleId,
        gumroad_subscription_id: subscriptionId,
      }, { onConflict: "email" });
    }
  }

  // Refund, cancellation, or subscription ended → downgrade to free
  if (refunded || cancelled || ended) {
    await supabase.from("users")
      .update({ plan: "free", scans_used: 0, period_start: null })
      .eq("email", email);
  }

  return NextResponse.json({ ok: true });
}
