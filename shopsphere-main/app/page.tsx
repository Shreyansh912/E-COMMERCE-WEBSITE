import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/products/ProductCard";
import { ArrowRight, Sparkles, ShieldCheck, Truck, RefreshCw, Headphones } from "lucide-react";

export const revalidate = 60;

interface CategoryType {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

interface ProductImage {
  id?: string;
  url: string;
}

interface ProductType {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number | null;
  images?: ProductImage[];
  category?: { name: string } | null;
  stock?: number;
  stockQuantity?: number;
}

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([
    prisma.product.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        images: true,
        category: true,
      },
    }),
    prisma.category.findMany({
      take: 12,
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-white border-b border-gray-100 py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-100 uppercase mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              New Generation Marketplace
            </span>

            <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight leading-tight max-w-4xl mx-auto">
              Everything you need. <br className="hidden sm:inline" />
              <span>One smarter store.</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Discover curated electronics, high-fidelity audio, and modern computing gear built for creators and professionals.
            </p>

            <div className="mt-8 flex items-center justify-center gap-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-gray-900 hover:bg-indigo-600 text-white font-semibold text-sm px-6 py-3 rounded-full transition-all shadow-md hover:shadow-lg"
              >
                <span>Shop Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Categories Bar */}
        {categories && categories.length > 0 && (
          <section className="bg-white border-b border-gray-100 py-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3 overflow-x-auto scrollbar-none py-1">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 whitespace-nowrap">
                  Categories:
                </span>
                <Link
                  href="/products"
                  className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-gray-900 text-white whitespace-nowrap hover:opacity-90 transition"
                >
                  All Products
                </Link>
                {categories.map((cat: CategoryType) => (
                  <Link
                    key={cat.id}
                    href={`/products?category=${cat.slug}`}
                    className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-gray-50 hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 border border-gray-200 transition whitespace-nowrap"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Value Proposition Badges */}
        <section className="py-12 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="flex flex-col items-center p-3">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-2">
                  <Truck className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-gray-900">Free Express Delivery</h4>
                <p className="text-xs text-gray-500 mt-0.5">On all orders over $100</p>
              </div>

              <div className="flex flex-col items-center p-3">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-2">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-gray-900">2-Year Warranty</h4>
                <p className="text-xs text-gray-500 mt-0.5">100% verified original gear</p>
              </div>

              <div className="flex flex-col items-center p-3">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-2">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-gray-900">30-Day Easy Returns</h4>
                <p className="text-xs text-gray-500 mt-0.5">Zero hassle refund policy</p>
              </div>

              <div className="flex flex-col items-center p-3">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-2">
                  <Headphones className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-gray-900">24/7 Dedicated Support</h4>
                <p className="text-xs text-gray-500 mt-0.5">Always here to help you</p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                Featured Releases
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Top-rated items handpicked for you
              </p>
            </div>
            <Link
              href="/products"
              className="text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition"
            >
              <span>View all products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {(featuredProducts as unknown as ProductType[]).map((p: ProductType, index: number) => {
              const productStock =
                typeof p.stock === "number"
                  ? p.stock
                  : typeof p.stockQuantity === "number"
                  ? p.stockQuantity
                  : 10;

              return (
                <ProductCard
                  key={p.id || String(index)}
                  id={p.id}
                  name={p.name}
                  slug={p.slug}
                  price={p.price}
                  discountPrice={p.discountPrice}
                  images={p.images}
                  category={p.category}
                  stock={productStock}
                />
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}