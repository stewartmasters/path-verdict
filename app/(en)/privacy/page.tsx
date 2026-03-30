import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How SalaryVerdict collects, uses, and protects your data.",
};

const LAST_UPDATED = "27 March 2026";

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400">Last updated: {LAST_UPDATED}</p>
      </div>

      <div className="prose prose-gray max-w-none space-y-8 text-gray-600 text-sm leading-relaxed">

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">1. Who we are</h2>
          <p>
            SalaryVerdict (<strong>salaryverdict.com</strong>) is a free salary benchmarking tool for European professionals.
            For the purposes of GDPR and applicable data protection law, we are the data controller for any
            personal data collected through this website.
          </p>
          <p>
            Contact:{" "}
            <a href="mailto:hello@salaryverdict.com" className="text-orange-500 hover:underline">
              hello@salaryverdict.com
            </a>
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">2. What data we collect and why</h2>

          <h3 className="font-semibold text-gray-800">Salary tool inputs</h3>
          <p>
            When you use the salary checker (role, location, years of experience, current salary), this data is
            processed entirely in your browser. We do not transmit or store your salary inputs on any server.
            Your results are never sent to us.
          </p>

          <h3 className="font-semibold text-gray-800">Analytics (Google Analytics 4)</h3>
          <p>
            With your consent, we use Google Analytics 4 to understand how visitors use the site — for example,
            which pages are visited, how long users stay, and what actions they take (such as completing the salary
            check). This data is anonymised and aggregated. It contains no personally identifiable information.
          </p>
          <p>
            Analytics are only activated after you click &ldquo;Accept analytics&rdquo; in the cookie banner.
            If you decline, no analytics cookies are set and no tracking data is sent to Google.
          </p>
          <p>
            Google Analytics is governed by Google&apos;s privacy policy:{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-500 hover:underline"
            >
              policies.google.com/privacy
            </a>
          </p>

          <h3 className="font-semibold text-gray-800">Email subscription</h3>
          <p>
            If you choose to subscribe to salary insights via the result screen, we collect your email address.
            This is used solely to send you monthly salary and negotiation content. We do not sell, rent, or
            share your email address with third parties for marketing purposes.
          </p>
          <p>
            Email subscriptions are managed via Netlify Forms. You can unsubscribe at any time by clicking the
            unsubscribe link in any email we send, or by emailing{" "}
            <a href="mailto:hello@salaryverdict.com" className="text-orange-500 hover:underline">
              hello@salaryverdict.com
            </a>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">3. Cookies</h2>
          <p>We use the following cookies:</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-2 border border-gray-200 font-semibold text-gray-700">Cookie</th>
                  <th className="text-left p-2 border border-gray-200 font-semibold text-gray-700">Purpose</th>
                  <th className="text-left p-2 border border-gray-200 font-semibold text-gray-700">Duration</th>
                  <th className="text-left p-2 border border-gray-200 font-semibold text-gray-700">Consent required</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border border-gray-200"><code>sv_cookie_consent</code></td>
                  <td className="p-2 border border-gray-200">Stores your cookie preference</td>
                  <td className="p-2 border border-gray-200">1 year</td>
                  <td className="p-2 border border-gray-200">No (functional)</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="p-2 border border-gray-200"><code>salary_verdict_saved</code></td>
                  <td className="p-2 border border-gray-200">Remembers your last salary check result locally</td>
                  <td className="p-2 border border-gray-200">Browser session</td>
                  <td className="p-2 border border-gray-200">No (functional)</td>
                </tr>
                <tr>
                  <td className="p-2 border border-gray-200"><code>_ga, _ga_*</code></td>
                  <td className="p-2 border border-gray-200">Google Analytics — distinguishes users and sessions</td>
                  <td className="p-2 border border-gray-200">2 years</td>
                  <td className="p-2 border border-gray-200">Yes</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            You can withdraw your analytics consent at any time by clearing your browser cookies or by contacting us.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">4. Legal basis for processing</h2>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Analytics:</strong> Consent (Article 6(1)(a) GDPR)</li>
            <li><strong>Email subscription:</strong> Consent (Article 6(1)(a) GDPR)</li>
            <li><strong>Salary tool inputs:</strong> Processed locally in your browser only — no personal data is transmitted to us</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">5. Data retention</h2>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Analytics data:</strong> Retained for 14 months in Google Analytics (our configured retention period)</li>
            <li><strong>Email addresses:</strong> Retained until you unsubscribe or request deletion</li>
            <li><strong>Cookie consent preference:</strong> Stored locally in your browser for 1 year</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">6. Your rights</h2>
          <p>Under GDPR (if you are in the UK or EEA), you have the right to:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request erasure of your data (&ldquo;right to be forgotten&rdquo;)</li>
            <li>Withdraw consent at any time (without affecting prior processing)</li>
            <li>Lodge a complaint with your national supervisory authority (e.g. ICO in the UK, AEPD in Spain)</li>
          </ul>
          <p>
            To exercise any of these rights, email{" "}
            <a href="mailto:hello@salaryverdict.com" className="text-orange-500 hover:underline">
              hello@salaryverdict.com
            </a>
            . We will respond within 30 days.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">7. Third-party services</h2>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Google Analytics 4</strong> — analytics (consent required). Operated by Google Ireland Limited.</li>
            <li><strong>Netlify</strong> — website hosting and form processing. Operated by Netlify, Inc.</li>
            <li><strong>Netlify Forms</strong> — email collection. Data stored by Netlify, Inc.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">8. Changes to this policy</h2>
          <p>
            We may update this policy from time to time. The &ldquo;last updated&rdquo; date at the top of this
            page reflects the most recent revision. Material changes will be noted prominently.
          </p>
        </section>

        <div className="pt-6 border-t border-gray-100">
          <Link href="/" className="text-orange-500 hover:underline text-sm font-medium">
            ← Back to SalaryVerdict
          </Link>
        </div>
      </div>
    </div>
  );
}
