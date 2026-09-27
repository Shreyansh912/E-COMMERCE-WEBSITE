import { ComponentProps } from "react";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/products/ProductCard";
import ProductFilters from "@/components/products/ProductFilters";
import { Prisma } from "@prisma/client";

interface ProductsPageProps {
  searchParams: Promise<{
    search?: string;
    query?: string;
    category?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
  }> | {
    search?: string;
    query?: string;
    category?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedParams = await searchParams;
  
  // Support both ?search= and ?query= from the search bar
  const rawSearch = resolvedParams?.search || resolvedParams?.query || "";
  const search = rawSearch.trim();
  const categorySlug = resolvedParams?.category?.trim() || "";
  const sort = resolvedParams?.sort || "newest";
  const minPrice = resolvedParams?.minPrice ? parseFloat(resolvedParams.minPrice) : undefined;
  const maxPrice = resolvedParams?.maxPrice ? parseFloat(resolvedParams.maxPrice) : undefined;

  // Safe Prisma where clause for SQLite without 'brand'
  const whereClause: Prisma.ProductWhereInput = {};

  if (categorySlug && categorySlug !== "all") {
    whereClause.category = {
      slug: categorySlug,
    };
  }

  if (search) {
    whereClause.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
      {
        category: {
          name: { contains: search },
        },
      },
    ];
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    whereClause.price = {
      ...(minPrice !== undefined ? { gte: minPrice } : {}),
      ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
    };
  }

  // Safe sorting
  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  if (sort === "price-low") {
    orderBy = { price: "asc" };
  } else if (sort === "price-high") {
    orderBy = { price: "desc" };
  }

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: whereClause,
      include: {
        images: true,
        category: true,
      },
      orderBy,
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Product Catalog
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {search
              ? `Showing results for "${search}" (${products.length} found)`
              : `Explore high-performance electronics, apparel, and lifestyle essentials (${products.length} total)`}
          </p>
        </div>

        {/* 2-Column Responsive Layout: Sidebar Filters on Left, Product Grid on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          <aside className="lg:col-span-1 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs sticky top-20">
            <ProductFilters categories={categories} />
          </aside>

          <section className="lg:col-span-3">
            {products.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-xs">
                <p className="text-gray-500 font-medium text-sm">
                  No products found matching your search.
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Try checking your spelling or clearing category filters.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
                {products.map((product) => {
                  const cardProps = product as unknown as ComponentProps<typeof ProductCard>;
                  return <ProductCard key={product.id} {...cardProps} />;
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}