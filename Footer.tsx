import React from "react";
import Link from "next/link";
import { Sparkles, Shield, Lock, FileCheck, CheckCircle2 } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1 */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2 font-bold text-white text-base">
              <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span>HireFlow</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Automated recruitment infrastructure connecting Google Forms, applicant scoring, email triggers, and verified digital offer letters.
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">Product</h4>
            <ul className="space-y-2">
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Admin Dashboard</Link></li>
              <li><Link href="/applications" className="hover:text-white transition-colors">Applicant Tracker</Link></li>
              <li><Link href="/selection-criteria" className="hover:text-white transition-colors">Scoring Engine</Link></li>
              <li><Link href="/offer-letters" className="hover:text-white transition-colors">PDF Offer Generator</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">Integrations</h4>
            <ul className="space-y-2">
              <li><Link href="/integrations" className="hover:text-white transition-colors">Google Forms & Sheets</Link></li>
              <li><Link href="/integrations" className="hover:text-white transition-colors">Gmail & Resend Delivery</Link></li>
              <li><Link href="/integrations" className="hover:text-white transition-colors">Google Drive Storage</Link></li>
              <li><Link href="/integrations" className="hover:text-white transition-colors">PostgreSQL Database</Link></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">Trust & Security</h4>
            <div className="space-y-2 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-blue-400" /> SOC-2 Compliant Architecture</div>
              <div className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-emerald-400" /> End-to-End Encrypted Tokens</div>
              <div className="flex items-center gap-1.5"><FileCheck className="w-3.5 h-3.5 text-amber-400" /> Legally Binding e-Signatures</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> Comprehensive Audit Logs</div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} HireFlow Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/login" className="hover:text-white transition-colors">Portal Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
