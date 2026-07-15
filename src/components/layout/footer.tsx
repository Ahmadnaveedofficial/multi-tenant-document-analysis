import Link from "next/link";
import { Brain, Mail, ArrowUpRight } from "lucide-react";
import { FiGithub, FiLinkedin } from "react-icons/fi";


export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks: Record<string, { label: string; href: string }[]> = {
    Product: [
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/pricing" },
      { label: "API", href: "/api-docs" },
    ],
    Company: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
    ],
    Legal: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Security", href: "/security" },
    ],
    Support: [
      { label: "Help center", href: "/help" },
      { label: "Contact us", href: "/contact" },
      { label: "Status", href: "/status" },
    ],
  };

  const socialLinks = [
    { icon: <FiGithub className="h-[17px] w-[17px]" />, href: "https://github.com", label: "GitHub" },
    { icon: <FiLinkedin className="h-[17px] w-[17px]" />, href: "https://linkedin.com", label: "LinkedIn" },
    { icon: <Mail className="h-[17px] w-[17px]" />, href: "mailto:support@docuai.com", label: "Email" },
  ];

  return (
    <footer className="border-t border-gray-200 bg-white text-gray-900">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-6">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <Brain className="h-7 w-7 text-sky-500" strokeWidth={1.75} />
              <span className="font-serif text-2xl font-bold tracking-tight text-gray-900">
                DocuAI
              </span>
            </div>

            <p className="mb-6 max-w-xs text-[15px] leading-relaxed text-gray-500">
              AI-powered document analysis for teams. Upload, analyze, and
              collaborate on documents with your organization.
            </p>

            <div className="flex gap-2">
              {socialLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:border-gray-900 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                >
                  {link.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Link groups */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <nav key={category} aria-label={category} className="lg:col-span-1">
              <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-1 text-[15px] text-gray-600 transition-colors hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 focus-visible:rounded-sm"
                    >
                      {link.label}
                      <ArrowUpRight className="h-3 w-3 -translate-x-0.5 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 motion-reduce:hidden" />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-6 text-sm text-gray-500 md:flex-row">
          <div>© {currentYear} DocuAI, Inc. All rights reserved.</div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 focus-visible:rounded-sm">
              Privacy policy
            </Link>
            <Link href="/terms" className="hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 focus-visible:rounded-sm">
              Terms of service
            </Link>
            <Link href="/cookies" className="hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 focus-visible:rounded-sm">
              Cookie policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}