import { db } from "@/db";
import { type NextRequest, NextResponse } from "next/server";
import { config } from "@/app-config";

/*
  Supabase free tier auto-shutdown if inactive for a week.
  Thus, we're going to ping via Vercel's "cron job" regularly to keep it alive!
*/
export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${config.cron_secret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const timestamp = new Date().toISOString();

  try {
    await db.query.products.findFirst();
    return NextResponse.json(
      { message: `Supabase is alive 💓 -- ${timestamp}` },
      { status: 200 },
    );
  } catch (error) {
    const errMessage = `Supabase is dead cry 😵 -- ${timestamp}\n`;
    console.error(errMessage, error);
    return NextResponse.json({ message: errMessage }, { status: 500 });
  }
}
