"use client";

export default function ScrollToTopButton() {
  return (
    <button
      onClick={() => {
        const el = document.getElementById("path-tool");
        el ? el.scrollIntoView({ behavior: "smooth" }) : window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-bold px-8 py-4 rounded-xl transition-colors mt-2"
    >
      Get my verdict →
    </button>
  );
}
