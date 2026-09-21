import { LoginPage } from "@/components/auth/LoginPage";

export const metadata = {
  title: "Sign in or create an account - VSI AI Suite",
  description: "Sign in to VSI AI Suite, or create an account to get started",
};

export default async function Page({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { mode } = await searchParams;
  return <LoginPage initialMode={mode === "signup" ? "signup" : "signin"} />;
}
