import { describe, expect, it } from "vitest";

describe("Supabase browser configuration", () => {
  it("accepts the configured public key at the configured project endpoint", async () => {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const publishableKey = process.env.VITE_SUPABASE_ANON_KEY;

    expect(supabaseUrl).toMatch(/^https:\/\//);
    expect(publishableKey).toBeTruthy();

    const response = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      headers: {
        apikey: publishableKey!,
        Authorization: `Bearer ${publishableKey!}`,
      },
    });

    expect(response.ok).toBe(true);
  }, 15_000);
});
