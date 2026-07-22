import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-12 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo and Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-primary text-white flex items-center justify-center font-black shadow">
                i
              </div>
              <span className="font-extrabold text-white text-base tracking-tight">
                Prep<span className="text-brand-primary">Intel</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Real interview experiences from top companies, meticulously mapped, structured, and presented for how candidates actually prepare.
            </p>
          </div>

          {/* Catalog Browse Links */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">Explore</h5>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <Link href="/companies" className="hover:text-white transition-colors">
                  All Companies
                </Link>
              </li>
              <li>
                <Link href="/companies?roleLevel=SDE-1" className="hover:text-white transition-colors">
                  Entry Level Experiences
                </Link>
              </li>
              <li>
                <Link href="/companies?roleLevel=SDE-2" className="hover:text-white transition-colors">
                  Mid/Senior Experiences
                </Link>
              </li>
            </ul>
          </div>

          {/* Help Links */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">Resources</h5>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <Link href="/admin/login" className="hover:text-white transition-colors">
                  Panelist Login
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Student Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">Legal</h5>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Terms of Service
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright bar */}
        <div className="border-t border-slate-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500">
          <p>&copy; {new Date().getFullYear()} PrepIntel. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 cursor-pointer">About</span>
            <span className="hover:text-slate-400 cursor-pointer">GitHub</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
