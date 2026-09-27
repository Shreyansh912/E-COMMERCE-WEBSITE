"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { ShoppingBag, Search, User, LogOut, Home, Grid } from "lucide-react";
import VisualSearchModal from "@/components/products/VisualSearchModal";
import { useCartStore } from "@/store/useCartStore";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  // Total cart item counter
  const totalCartCount = items.reduce(
    (acc, item) => acc + (item.quantity ?? 1),
    0
  );

  const handleSignOut = async () => {
    // Clear the cart so the next user logged in starts with a fresh empty cart
    clearCart();
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand & Left Navigation */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center text-base shadow-sm group-hover:bg-indigo-700 transition">
              S
            </div>
            <span className="font-extrabold text-lg text-indigo-600 tracking-tight">
              ShopSphere
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-sm font-semibold text-gray-600">
            <Link
              href="/"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                pathname === "/"
                  ? "text-indigo-600 bg-indigo-50/60"
                  : "hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            <Link
              href="/products"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                pathname.startsWith("/products")
                  ? "text-indigo-600 bg-indigo-50/60"
                  : "hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>Catalog</span>
            </Link>
          </nav>
        </div>

        {/* Central Search with AI Visual Search */}
        <div className="flex-1 max-w-md hidden sm:flex items-center relative">
          <div className="w-full flex items-center bg-slate-50 border border-gray-200 rounded-full px-3.5 py-1.5 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition">
            <Search className="w-4 h-4 text-gray-400 mr-2.5 shrink-0" />
            <input
              type="text"
              placeholder="Search products, shoes, watches..."
              className="w-full bg-transparent text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden"
            />
            {/* AI Visual Search Modal Trigger */}
            <VisualSearchModal />
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cart Icon with Dynamic Badge */}
          <Link
            href="/cart"
            className="relative p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-full transition"
            title="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalCartCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-in zoom-in">
                {totalCartCount > 9 ? "9+" : totalCartCount}
              </span>
            )}
          </Link>

          {/* User Account / Profile */}
          {status === "authenticated" ? (
            <div className="flex items-center gap-1">
              <Link
                href="/profile"
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-full hover:bg-gray-50 text-gray-700 transition"
              >
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-200">
                  {session.user?.name?.charAt(0).toUpperCase() ||
                    session.user?.email?.charAt(0).toUpperCase() ||
                    "U"}
                </div>
                <span className="text-xs font-semibold text-gray-800 hidden md:inline-block max-w-[100px] truncate">
                  {session.user?.name || session.user?.email?.split("@")[0]}
                </span>
              </Link>

              <button
                type="button"
                onClick={handleSignOut}
                className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50/70 hover:bg-indigo-100 rounded-full transition"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}