import io
import os
import numpy as np
import torch
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image
from fastapi import FastAPI, File, UploadFile, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI(
    title="ShopSphere ML Microservice",
    description="MobileNetV3 feature extraction and cosine visual similarity search",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = None

# Path to the indexed embeddings saved by indexer.py
INDEX_FILE = os.path.join(os.path.dirname(__file__), "catalog_embeddings.pt")
product_ids = []
product_embeddings = None

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


def load_model():
    """Loads pre-trained MobileNetV3 for feature extraction."""
    global model
    weights = models.MobileNet_V3_Small_Weights.DEFAULT
    base_model = models.mobilenet_v3_small(weights=weights)
    base_model.classifier = base_model.classifier[:-1]
    base_model.eval()
    model = base_model.to(device)


def load_embeddings():
    """Loads pre-computed product embeddings safely from catalog_embeddings.pt."""
    global product_ids, product_embeddings
    if not os.path.exists(INDEX_FILE):
        print(f"Index file '{INDEX_FILE}' not found. Run indexer.py to generate it.")
        product_ids = []
        product_embeddings = None
        return

    try:
        # weights_only=False ensures PyTorch dict/list containers load correctly
        data = torch.load(INDEX_FILE, map_location="cpu", weights_only=False)

        if isinstance(data, dict):
            # 1. Safely extract IDs without boolean truth evaluation
            raw_ids = None
            for key in ("ids", "product_ids", "items", "labels"):
                if key in data:
                    raw_ids = data[key]
                    break

            if raw_ids is not None:
                product_ids = [str(i) for i in raw_ids]
            else:
                product_ids = []

            # 2. Safely extract tensor embeddings without boolean truth evaluation
            raw_vectors = None
            for key in ("embeddings", "vectors", "features", "matrix"):
                if key in data:
                    raw_vectors = data[key]
                    break

            if isinstance(raw_vectors, torch.Tensor):
                product_embeddings = raw_vectors.cpu().numpy()
            elif raw_vectors is not None:
                product_embeddings = np.array(raw_vectors)
            else:
                product_embeddings = None

        elif isinstance(data, list):
            product_ids = [str(item["id"]) for item in data]
            product_embeddings = np.array([item["embedding"] for item in data])

        if product_embeddings is not None and len(product_ids) > 0:
            print(f"Successfully loaded {len(product_ids)} product embeddings from {INDEX_FILE}")
        else:
            print(f"Warning: Index loaded but 0 items parsed from {INDEX_FILE}")

    except Exception as e:
        print(f"Failed to load {INDEX_FILE}: {e}")
        product_ids = []
        product_embeddings = None


@app.on_event("startup")
def startup_event():
    load_model()
    load_embeddings()


def extract_features(image_bytes: bytes) -> np.ndarray:
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image payload.")

    tensor = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        embedding = model(tensor).squeeze().cpu().numpy()

    norm = np.linalg.norm(embedding)
    if norm > 0:
        embedding = embedding / norm

    return embedding


@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "service": "ShopSphere ML Microservice",
        "indexed_items": len(product_ids),
    }


@app.post("/search")
async def visual_search(
    file: UploadFile = File(...),
    top_k: int = Query(default=8, ge=1, le=50)
):
    global product_embeddings, product_ids
    if product_embeddings is None or len(product_ids) == 0:
        load_embeddings()

    if product_embeddings is None or len(product_ids) == 0:
        return {
            "results": [],
            "message": "Product index is empty. Please run indexer.py to generate catalog_embeddings.pt"
        }

    contents = await file.read()
    query_vector = extract_features(contents).reshape(1, -1)

    similarities = cosine_similarity(query_vector, product_embeddings)[0]
    ranked_indices = np.argsort(similarities)[::-1][:top_k]

    results = []
    for idx in ranked_indices:
        results.append({
            "id": product_ids[idx],
            "score": round(float(similarities[idx]), 4)
        })

    return {"results": results}


# Supports both /similar/{product_id} and /recommendations/{product_id}
@app.get("/similar/{product_id}")
@app.get("/recommendations/{product_id}")
def get_similar_products(
    product_id: str,
    top_k: int = Query(default=4, ge=1, le=20)
):
    global product_embeddings, product_ids
    if product_embeddings is None or len(product_ids) == 0:
        load_embeddings()

    if product_embeddings is None or len(product_ids) == 0:
        return {"results": []}

    target_str = str(product_id)
    if target_str not in product_ids:
        raise HTTPException(status_code=404, detail="Product ID not found in catalog index.")

    target_idx = product_ids.index(target_str)
    target_vector = product_embeddings[target_idx].reshape(1, -1)

    other_mask = [i != target_idx for i in range(len(product_ids))]
    other_ids = [product_ids[i] for i in range(len(product_ids)) if i != target_idx]
    other_matrix = product_embeddings[other_mask]

    similarities = cosine_similarity(target_vector, other_matrix)[0]
    ranked_indices = np.argsort(similarities)[::-1][:top_k]

    results = []
    for idx in ranked_indices:
        results.append({
            "id": other_ids[idx],
            "score": round(float(similarities[idx]), 4)
        })

    return {"results": results}