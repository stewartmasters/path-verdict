"use client";

import { useRouter, usePathname } from "next/navigation";

export default function LanguageSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const current = pathname?.startsWith("/es") ? "es" : "en";

  return (
    <select
      value={current}
      onChange={(e) => router.push(e.target.value === "es" ? "/es" : "/")}
      className="text-xs border border-gray-200 text-gray-600 px-2 py-1 rounded-full bg-white cursor-pointer hover:border-teal-400 hover:text-teal-600 transition-colors"
      aria-label="Select language"
    >
      <option value="en">EN</option>
      <option value="es">ES</option>
    </select>
  );
}
