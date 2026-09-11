import { NextResponse } from "next/server";
import { clientAvecSession } from "@/lib/supabaseServeur";

export async function GET() {
  const supabaseSession = await clientAvecSession();
  const {
    data: { user },
  } = await supabaseSession.auth.getUser();
  if (!user) return NextResponse.json({ erreur: "Non authentifié." }, { status: 401 });

  const { data, error } = await supabaseSession.rpc("mes_permissions");
  if (error) return NextResponse.json({ erreur: error.message }, { status: 500 });

  return NextResponse.json({ permissions: (data ?? []).map((l: { code: string }) => l.code) });
}
