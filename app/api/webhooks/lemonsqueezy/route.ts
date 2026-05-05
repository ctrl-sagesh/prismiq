import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
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
  const rawBody = await req.text();
  const signature = req.headers.get("x-signature") ?? "";
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET ?? "";

  // Verify signature
  const hmac = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  if (hmac !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const eventName = payload.meta?.event_name;
  const attrs = payload.data?.attributes;

  if (!attrs) return NextResponse.json({ ok: true });

  const email = attrs.user_email;
  const productName = attrs.product_name ?? "";
  const subscriptionId = payload.data?.id;
  const customerId = attrs.customer_id;

  if (!email) return NextResponse.json({ ok: true });

  if (eventName === "subscription_created" || eventName === "subscription_updated") {
    const status = attrs.status;
    const plan = getPlanFromProductName(productName);

    if (plan && status === "active") {
      await supabase.from("users").upsert({
        email,
        plan,
        scans_used: 0,
        scans_reset_at: new Date().toISOString(),
        lemon_subscription_id: String(subscriptionId),
        lemon_customer_id: String(customerId),
      }, { onConflict: "email" });
    }
  }

  if (eventName === "subscription_cancelled" || eventName === "subscription_expired") {
    await supabase.from("users")
      .update({ plan: "free", scans_used: 0 })
      .eq("email", email);
  }

  return NextResponse.json({ ok: true });
}
