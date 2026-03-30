"use client";

import { useRouter } from "next/navigation";

interface Props {
  current: "en" | "es";
}

export default function LanguageSelect({ current }: Props) {
  const router = useRouter();

  return (
    <select
      value={current}
      onChange={(e) => router.push(e.target.value === "es" ? "/es/" : "/")}
      className="text-xs border border-gray-200 text-gray-600 px-2 py-1 rounded-full bg-white cursor-pointer hover:border-orange-300 hover:text-orange-600 transition-colors"
      aria-label="Select language"
    >
      <option value="en">EN</option>
      <option value="es">ES</option>
    </select>
  );
}
