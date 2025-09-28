// import { handlers } from "@/lib/auth";

// export const { GET, POST } = handlers;

import { handlers } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { nextauth: string[] } }
) {
  // Log the full URL object that the handler receives from Next.js
  console.log("--- Auth.js GET Handler ---");
  console.log("Received URL Pathname:", req.nextUrl.pathname);
  console.log("Received Route Params:", params);
  console.log("--------------------------");

  // Pass the request along to the original Auth.js handler
  return handlers.GET(req);
}

// You can do the same for POST if needed, but GET is enough for now
export const POST = handlers.POST;