"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers";
import { DataProvider } from "@/components/data-provider";
import { Spinner } from "@/components/ui";
import Shell from "@/components/Shell";

export default function AppLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  if (loading || !user) return <Spinner />;

  return (
    <DataProvider>
      <Shell>{children}</Shell>
    </DataProvider>
  );
}
