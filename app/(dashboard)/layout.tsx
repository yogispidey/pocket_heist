"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock8 } from "lucide-react";
import { useUser } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="center-content">
        <Clock8 size={32} strokeWidth={2} className="animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}
