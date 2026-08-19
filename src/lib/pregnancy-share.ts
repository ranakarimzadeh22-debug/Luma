import { createClient } from "./supabase";

export interface PregnancyShareData {
  share_token: string;
  partner_name: string;
  created_at: string;
  updated_at: string;
}

/** Create or update a pregnancy share link for a user. */
export async function createPregnancyShare(
  userId: string,
  partnerName: string = ""
): Promise<{ share_token: string; url: string } | null> {
  const supabase = createClient();

  // Upsert: if a share already exists, keep the token; otherwise generate new one
  const { data, error } = await supabase
    .from("pregnancy_shares")
    .upsert(
      {
        user_id: userId,
        partner_name: partnerName,
      },
      { onConflict: "user_id" }
    )
    .select("share_token")
    .single();

  if (error || !data) {
    console.error("createPregnancyShare error:", error);
    return null;
  }

  const token = data.share_token;
  const url = `${window.location.origin}/schwangerschaft/partner/${token}`;

  return { share_token: token, url };
}

/** Get existing share data for a user (or null if none). */
export async function getPregnancyShare(
  userId: string
): Promise<PregnancyShareData | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("pregnancy_shares")
    .select("share_token, partner_name, created_at, updated_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("getPregnancyShare error:", error);
    return null;
  }

  return data;
}

/** Regenerate the share token (invalidates old link). */
export async function regeneratePregnancyShare(
  userId: string,
  partnerName?: string
): Promise<{ share_token: string; url: string } | null> {
  const supabase = createClient();

  const patch: Record<string, string> = {
    share_token: crypto.randomUUID(),
  };
  if (partnerName !== undefined) {
    patch.partner_name = partnerName;
  }

  const { data, error } = await supabase
    .from("pregnancy_shares")
    .update(patch)
    .eq("user_id", userId)
    .select("share_token")
    .single();

  if (error || !data) {
    console.error("regeneratePregnancyShare error:", error);
    return null;
  }

  const url = `${window.location.origin}/schwangerschaft/partner/${data.share_token}`;
  return { share_token: data.share_token, url };
}

/** Fetch pregnancy data for a partner via share token (server-side). */
export async function getPregnancyDataByShareToken(
  shareToken: string
): Promise<{
  last_period_start: string | null;
  due_date: string | null;
  is_pregnant: boolean;
  mother_name: string;
} | null> {
  const supabase = createClient();

  // 1. Look up the share token → user_id
  const { data: share, error: shareError } = await supabase
    .from("pregnancy_shares")
    .select("user_id")
    .eq("share_token", shareToken)
    .maybeSingle();

  if (shareError || !share) {
    console.error("getPregnancyDataByShareToken: share not found", shareError);
    return null;
  }

  // 2. Fetch pregnancy data
  const { data: preg, error: pregError } = await supabase
    .from("pregnancies")
    .select("last_period_start, due_date, is_pregnant")
    .eq("user_id", share.user_id)
    .maybeSingle();

  if (pregError || !preg) {
    console.error("getPregnancyDataByShareToken: pregnancy not found", pregError);
    return null;
  }

  // 3. Fetch mother's name
  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", share.user_id)
    .maybeSingle();

  return {
    last_period_start: preg.last_period_start,
    due_date: preg.due_date,
    is_pregnant: preg.is_pregnant ?? false,
    mother_name: profile?.name ?? "",
  };
}