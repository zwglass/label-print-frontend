"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { localePath } from "@/lib/locales";

export default function LocaleRedirect({ path = "/" }) {
  const router = useRouter();
  const target = localePath("en", path);

  useEffect(() => {
    router.replace(target);
  }, [router, target]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-base-100 p-6 text-base-content">
      <div className="max-w-sm text-center">
        <h1 className="text-xl font-bold">ZWGlass Label Print</h1>
        <p className="mt-3 text-sm opacity-70">Redirecting to the English route.</p>
        <div className="mt-5 flex justify-center gap-3">
          <Link className="btn btn-primary btn-sm" href={target}>
            English
          </Link>
          <Link className="btn btn-outline btn-sm" href={localePath("zh", path)}>
            中文
          </Link>
        </div>
      </div>
    </main>
  );
}
