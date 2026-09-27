"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { formatCurrency } from "@/lib/utils";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart } = useCartStore();

  const subtotal = items.reduce(
    (acc, item) => acc + (item.price ?? 0) * (item.quantity ?? 1),
    0
  );
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  // Notice: NO <Navbar /> here because app/layout.tsx already provides it globally
  if (items.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-4xl w-full">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Shopping Cart
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Review and manage items before proceeding to checkout
            </p>
          </div>

          {/* Empty Cart Container matching your screenshot */}
          <div className="rounded-3xl border-2 border-dashed border-gray-200 p-16 text-center flex flex-col items-center justify-center bg-white shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 mb-4 border border-gray-100">
              <ShoppingBag className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Your cart is empty</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm">
              Looks like you haven&apos;t added anything to your cart yet. Discover something new today.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex items-center gap-2 bg-gray-900 hover:bg-indigo-600 text-white text-xs font-semibold px-6 py-3 rounded-full transition shadow-xs"
            >
              <span>Start Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Title & Clear Cart */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Shopping Cart
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Review and manage items before proceeding to checkout
            </p>
          </div>
          <button
            type="button"
            onClick={clearCart}
            className="text-xs font-semibold text-rose-500 hover:text-rose-700 transition cursor-pointer"
          >
            Clear Cart
          </button>
        </div>

        {/* Cart Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const itemTotal = (item.price ?? 0) * (item.quantity ?? 1);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs flex items-center justify-between gap-4 transition hover:border-gray-200"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative w-20 h-20 bg-slate-50 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                      <Image
                        src={item.image || "/placeholder-product.png"}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate">
                        {item.name}
                      </h3>
                      <p className="text-xs sm:text-sm font-semibold text-gray-600 mt-0.5">
                        {formatCurrency(item.price)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                    <div className="flex items-center border border-gray-200 rounded-full px-2 py-1 bg-white shadow-xs">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.id, Math.max(1, (item.quantity ?? 1) - 1))
                        }
                        disabled={(item.quantity ?? 1) <= 1}
                        className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:hover:text-gray-400 transition"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-gray-800">
                        {item.quantity ?? 1}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            Math.min(item.stock ?? 99, (item.quantity ?? 1) + 1)
                          )
                        }
                        className="p-1 text-gray-400 hover:text-gray-700 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="w-24 text-right">
                      <span className="text-sm sm:text-base font-bold text-gray-900">
                        {formatCurrency(itemTotal)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <aside className="lg:col-span-1 bg-white rounded-2xl p-6 border border-gray-100 shadow-xs sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              Order Summary
            </h2>

            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Estimated Tax (8%)</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(tax)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="font-semibold text-emerald-600">Free</span>
              </div>

              <div className="border-t border-gray-100 pt-3.5 flex justify-between items-baseline">
                <span className="text-base font-bold text-gray-900">Total</span>
                <span className="text-xl font-black text-gray-900">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="mt-6 w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-indigo-600 text-white text-sm font-semibold py-3.5 rounded-xl transition duration-200 shadow-xs"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}