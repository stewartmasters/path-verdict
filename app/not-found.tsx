import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-6">
        <div className="text-6xl font-black text-teal-100">404</div>
        <h1 className="text-2xl font-extrabold text-gray-900">Page not found</h1>
        <p className="text-gray-500 leading-relaxed">
          This page doesn&apos;t exist. If you followed a link here, it may have moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/"
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-3 rounded-xl transition-colors"
          >
            Check my financial position →
          </Link>
          <Link
            href="/methodology"
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Methodology
          </Link>
        </div>
      </div>
    </div>
  );
}
