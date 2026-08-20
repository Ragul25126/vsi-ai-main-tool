import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

import { isAuthorizedEmail } from "@/lib/auth-config";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";

  if (code) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (!error && data?.session?.user) {
        const user = data.session.user;

        if (!isAuthorizedEmail(user.email)) {
          await supabase.auth.signOut();
          return NextResponse.redirect(new URL("/login?error=unauthorized_account", requestUrl.origin));
        }

        const nameFromEmail = (user.email ?? "").split("@")[0];
        const formattedName = user.user_metadata?.full_name || user.user_metadata?.name || (nameFromEmail ? nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1) : "User");

        const userProfile = {
          name: formattedName,
          email: user.email ?? "",
          role: "Administrator",
          company: "Valgrow Enterprise",
          plan: "VSI GEO Platform Pro",
          avatarUrl: user.user_metadata?.avatar_url || undefined,
        };

        const maxAge = 2592000;
        const response = NextResponse.redirect(new URL(next, requestUrl.origin));
        
        response.cookies.set("vsi_session", "authenticated", {
          path: "/",
          maxAge,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        });

        if (userProfile.email) {
          response.cookies.set("vsi_user_email", encodeURIComponent(userProfile.email), {
            path: "/",
            maxAge,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
          });
        }

        if (userProfile.name) {
          response.cookies.set("vsi_user_name", encodeURIComponent(userProfile.name), {
            path: "/",
            maxAge,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
          });
        }

        response.cookies.set("vsi_oauth_payload", encodeURIComponent(JSON.stringify(userProfile)), {
          path: "/",
          maxAge: 300,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        });

        return response;
      }
    } catch (err) {
      console.error("Error in Supabase PKCE callback:", err);
    }
  }

  return NextResponse.redirect(new URL("/login?error=auth_callback_error", requestUrl.origin));
}
