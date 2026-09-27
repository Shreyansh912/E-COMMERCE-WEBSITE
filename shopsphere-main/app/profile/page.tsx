"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Package, ShieldCheck, LogOut, ArrowRight, User as UserIcon } from "lucide-react";

export default function ProfilePage() {
  const { data: session, status } = useSession();

  const userInitial = session?.user?.name
    ? session.user.name.charAt(0).toUpperCase()
    : session?.user?.email
    ? session.user.email.charAt(0).toUpperCase()
    : "U";

  const displayName = session?.user?.name || session?.user?.email?.split("@")[0] || "User 7950";

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* User Profile Header Card */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gray-900 text-white flex items-center justify-center font-black text-2xl shadow-sm">
              {userInitial}
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                {displayName}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {session?.user?.email || "Signed in with verified session"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Verified Customer Account
            </span>

            {status === "authenticated" && (
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-full border border-rose-200 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>

        {/* Order History Section */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Order History</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Review and track all your previous purchases
              </p>
            </div>
            <span className="text-xs font-semibold text-gray-400">0 Orders</span>
          </div>

          <div className="rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 mb-3">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">No orders placed yet</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm">
              Once you complete a purchase, your itemized tracking and digital receipts will show up here.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex items-center gap-2 bg-gray-900 hover:bg-indigo-600 text-white text-xs font-semibold px-5 py-2.5 rounded-full transition shadow-xs"
            >
              <span>Start Browsing</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}