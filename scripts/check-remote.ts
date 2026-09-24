import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      process.env[key] = val;
    }
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(url, anonKey);

async function checkTables() {
  console.log("Checking remote agencies table...");
  const agencies = await supabase.from("agencies").select("*").limit(5);
  console.log("agencies query:", JSON.stringify(agencies, null, 2));

  console.log("\nChecking remote profiles table...");
  const profiles = await supabase.from("profiles").select("*").limit(5);
  console.log("profiles query:", JSON.stringify(profiles, null, 2));

  console.log("\nChecking remote clients table...");
  const clients = await supabase.from("clients").select("*").limit(5);
  console.log("clients query:", JSON.stringify(clients, null, 2));

  console.log("\nChecking remote project_competitors table...");
  const comps = await supabase.from("project_competitors").select("*").limit(5);
  console.log("project_competitors query:", JSON.stringify(comps, null, 2));
}

checkTables().catch(console.error);
