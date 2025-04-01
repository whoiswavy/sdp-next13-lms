import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import Stripe from "stripe";

export async function POST(req: Request) {
    const body = await req.text();
    const signature = headers().get("stripe-signature") as string; // Lowercase!
  
    // Debugging: Log secret and signature
    console.log("Webhook Secret:", process.env.STRIPE_WEBHOOK_SECRET);
    console.log("Signature:", signature);
  
    let event: Stripe.Event;
  
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (error: any) {
      console.error("Webhook Verification Failed:", error.message);
      return new NextResponse(`Webhook Error: ${error.message}`, { status: 401 }); // Return 401 on failure
    }
  
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session?.metadata?.userId;
    const courseId = session?.metadata?.courseId;
  
    if (event.type === "checkout.session.completed") {
      if (!userId || !courseId) {
        console.error("Missing metadata:", { userId, courseId });
        return new NextResponse("Missing metadata", { status: 400 });
      }
  
      try {
        await db.purchase.create({
          data: {
            courseId,
            userId,
          },
        });
        console.log("Purchase created for:", { userId, courseId });
      } catch (error) {
        console.error("Database Error:", error);
        return new NextResponse("Database Error", { status: 500 });
      }
    }
  
    return new NextResponse(null, { status: 200 });
  }