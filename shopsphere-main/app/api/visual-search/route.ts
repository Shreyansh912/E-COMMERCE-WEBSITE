import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const image = formData.get("image") as File;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Forward image to Python FastAPI service with correct query params
    const mlFormData = new FormData();
    mlFormData.append("file", image);

    const mlServiceUrl = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";
    
    // Correct URL format: /search?top_k=8
    const mlResponse = await fetch(`${mlServiceUrl}/search?top_k=8`, {
      method: "POST",
      body: mlFormData,
    });

    if (!mlResponse.ok) {
      const errText = await mlResponse.text();
      console.error("FastAPI error response:", errText);
      return NextResponse.json(
        { error: "ML microservice visual search error." },
        { status: mlResponse.status }
      );
    }

    const data = await mlResponse.json();
    // data is expected to be { results: [{ id: "...", score: 0.95 }, ...] }
    const matchIds: string[] = (data.results || []).map((item: any) => String(item.id || item.product_id));

    if (matchIds.length === 0) {
      return NextResponse.json({ products: [] });
    }

    // Fetch matching products from SQLite
    const products = await prisma.product.findMany({
      where: {
        id: { in: matchIds },
      },
      include: {
        images: true,
        category: true,
      },
    });

    // Reorder according to the ML similarity score order
    const orderedProducts = matchIds
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean)
      .map((p) => ({
        id: p!.id,
        name: p!.name,
        slug: p!.slug,
        price: p!.price,
        discountPrice: p!.discountPrice,
        image: p!.images[0]?.url || "/placeholder-product.png",
      }));

    return NextResponse.json({ products: orderedProducts });
  } catch (error) {
    console.error("Visual search error:", error);
    return NextResponse.json(
      { error: "Unable to process visual search request." },
      { status: 500 }
    );
  }
}