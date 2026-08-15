import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const customCallbackUrl = process.env.GOOGLE_CALLBACK_URL;
  const redirectUri = customCallbackUrl || `${origin}/api/auth/callback/google`;

  if (!clientId) {
    // If Google Client ID is missing, redirect to login with informative error parameter
    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set("error", "google_credentials_missing");
    return NextResponse.redirect(loginUrl);
  }

  // Generate cryptographically secure random state for CSRF protection
  const stateArray = new Uint8Array(16);
  crypto.getRandomValues(stateArray);
  const state = Array.from(stateArray, (byte) => byte.toString(16).padStart(2, "0")).join("");

  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.set("client_id", clientId);
  googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("scope", "openid email profile");
  googleAuthUrl.searchParams.set("prompt", "select_account");
  googleAuthUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(googleAuthUrl.toString());

  // Store state in secure HTTP-only cookie for state verification on callback
  response.cookies.set("vsi_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 minutes
  });

  return response;
}
