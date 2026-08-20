import { NextResponse, type NextRequest } from "next/server";
import { isAuthorizedEmail } from "@/lib/auth-config";

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const searchParams = request.nextUrl.searchParams;

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const errorParam = searchParams.get("error");

  // Handle user cancellation or Google authorization errors
  if (errorParam) {
    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set("error", errorParam === "access_denied" ? "google_cancelled" : "google_auth_failed");
    return NextResponse.redirect(loginUrl);
  }

  if (!code) {
    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set("error", "google_no_code");
    return NextResponse.redirect(loginUrl);
  }

  // Validate state parameter against HTTP-only state cookie
  const savedState = request.cookies.get("vsi_oauth_state")?.value;
  if (state && savedState && state !== savedState) {
    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set("error", "google_csrf_mismatch");
    return NextResponse.redirect(loginUrl);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const customCallbackUrl = process.env.GOOGLE_CALLBACK_URL;
  const redirectUri = customCallbackUrl || `${origin}/api/auth/callback/google`;

  if (!clientId || !clientSecret) {
    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set("error", "google_credentials_missing");
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Exchange authorization code for tokens with Google OAuth 2.0 server
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok || !tokens.access_token) {
      console.error("Google OAuth token exchange failed:", tokens);
      const loginUrl = new URL("/login", origin);
      loginUrl.searchParams.set("error", "google_token_failed");
      return NextResponse.redirect(loginUrl);
    }

    // Fetch authenticated user profile from Google UserInfo endpoint
    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    const googleUser = await userInfoResponse.json();

    if (!userInfoResponse.ok || !googleUser.email) {
      console.error("Failed to fetch Google user info:", googleUser);
      const loginUrl = new URL("/login", origin);
      loginUrl.searchParams.set("error", "google_profile_failed");
      return NextResponse.redirect(loginUrl);
    }

    // Security Check: Restrict to authorized ValGrow Labs account only
    if (!isAuthorizedEmail(googleUser.email)) {
      const loginUrl = new URL("/login", origin);
      loginUrl.searchParams.set("error", "unauthorized_account");
      return NextResponse.redirect(loginUrl);
    }

    // Format user profile
    const nameFromEmail = googleUser.email.split("@")[0];
    const formattedName = googleUser.name || nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);

    const userProfile = {
      name: formattedName,
      email: googleUser.email,
      role: "Administrator",
      company: "Valgrow Enterprise",
      plan: "VSI GEO Platform Pro",
      avatarUrl: googleUser.picture || undefined,
    };

    const maxAge = 2592000; // 30 days
    const dashboardUrl = new URL("/dashboard", origin);
    dashboardUrl.searchParams.set("auth", "google_success");

    const response = NextResponse.redirect(dashboardUrl);

    // Set authenticated session cookies
    response.cookies.set("vsi_session", "authenticated", {
      path: "/",
      maxAge,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    response.cookies.set("vsi_user_email", encodeURIComponent(userProfile.email), {
      path: "/",
      maxAge,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    response.cookies.set("vsi_user_name", encodeURIComponent(userProfile.name), {
      path: "/",
      maxAge,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    // Pass temporary payload for client localStorage sync
    response.cookies.set("vsi_oauth_payload", encodeURIComponent(JSON.stringify(userProfile)), {
      path: "/",
      maxAge: 300,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    // Clear OAuth state cookie
    response.cookies.set("vsi_oauth_state", "", {
      path: "/",
      expires: new Date(0),
    });

    return response;
  } catch (err) {
    console.error("Error during Google OAuth callback processing:", err);
    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set("error", "google_auth_error");
    return NextResponse.redirect(loginUrl);
  }
}
