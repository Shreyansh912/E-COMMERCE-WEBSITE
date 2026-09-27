"use client";

import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore";
import { ShoppingBag } from "lucide-react";

export interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  discountPrice?: number | null;
  slug: string;
  image?: string;
  imageUrl?: string;
  images?: { url: string }[];
  category?: { name: string } | null;
  stock?: number;
  stockQuantity?: number;
}

export default function ProductCard({
  id,
  name,
  price,
  discountPrice,
  slug,
  image,
  imageUrl,
  images,
  category,
  stock = 10,
  stockQuantity = 10,
}: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  // Safely resolve image URL from any passed property
  const resolvedImageUrl =
    image ||
    imageUrl ||
    (images && images.length > 0 ? images[0].url : null) ||
    "/placeholder-product.png";

  const displayPrice = discountPrice ?? price;
  const hasDiscount =
    discountPrice !== null && discountPrice !== undefined && discountPrice < price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      id,
      name,
      price: displayPrice,
      image: resolvedImageUrl,
      stock: stock ?? stockQuantity,
      quantity: 1,
    });
  };

  return (
    <div className="group relative bg-white border border-gray-100 rounded-2xl p-3 flex flex-col hover:shadow-lg transition-all duration-300">
      <Link
        href={`/products/${slug}`}
        className="block relative w-full aspect-square bg-slate-50 rounded-xl overflow-hidden mb-3"
      >
        {hasDiscount && (
          <span className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Sale
          </span>
        )}
        <Image
          src={resolvedImageUrl}
          alt={name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </Link>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          {category && (
            <p className="text-[11px] font-medium text-indigo-500 uppercase tracking-wider truncate mb-1">
              {category.name}
            </p>
          )}
          <Link href={`/products/${slug}`}>
            <h3 className="text-sm font-semibold text-gray-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
              {name}
            </h3>
          </Link>
        </div>

        <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-50">
          <div>
            <p className="text-sm font-bold text-gray-900">
              {formatCurrency(displayPrice)}
            </p>
            {hasDiscount && (
              <p className="text-xs text-gray-400 line-through">
                {formatCurrency(price)}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className="flex items-center gap-1 bg-gray-900 hover:bg-indigo-600 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}