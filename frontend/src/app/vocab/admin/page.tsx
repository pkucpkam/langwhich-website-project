"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function LegacyAdminRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin");
  }, [router]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-[#9CA3AF]">
      <Loader2 className="h-8 w-8 animate-spin text-[#2563EB]" />
      <span className="text-sm font-semibold">Redirecting to Admin Control Panel...</span>
    </div>
  );
}
