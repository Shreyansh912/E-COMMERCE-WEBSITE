# ShopSphere — Full-Stack AI-Powered E-Commerce Platform

A production-grade, modern e-commerce web application featuring AI-powered visual search, vector similarity product recommendations, isolated user authentication, and persistent cart state management.

Built with **Next.js (App Router)**, **Prisma ORM**, **SQLite**, **NextAuth.js**, and an independent **FastAPI + PyTorch (MobileNetV3)** machine learning microservice.

---

## 🌟 Key Features

### 🛍️ E-Commerce & Storefront
- **Dynamic Product Catalog:** Filter, browse, and search products across categories with responsive layouts.
- **Product Detail Views:** Dynamic slug routing (`/products/[slug]`) complete with real-time stock counters, image showcases, and customer reviews.
- **Session-Isolated Cart:** Cart state management via Zustand with persistent local synchronization and guaranteed session isolation (clears automatically upon logout to prevent data leakage across accounts).
- **Checkout Workflow:** Order summary calculation including dynamic subtotal, regional tax estimation, and payment processing hooks.

### 🧠 AI & Computer Vision Microservice
- **Image-Based Visual Search:** Users can upload any photo or product snippet directly through the camera modal to discover visually comparable catalog items.
- **Visual Similarity Recommendations:** Product detail pages dynamically fetch visually cohesive suggestions powered by vector distance calculations.
- **MobileNetV3 Feature Extraction:** High-performance, lightweight deep learning embeddings extractor generating 576-dimensional feature representations.
- **PyTorch Catalog Indexing:** Automated offline indexer script (`indexer.py`) converting catalog media into PyTorch vector tensors (`catalog_embeddings.pt`) for real-time cosine similarity search.

### 🔐 Security & Identity
- **JWT Session Management:** Secure NextAuth.js credential provider integration.
- **Safe Password Reset Workflow:** Custom API route utilizing direct parameterized SQL operations to ensure password updates bypass schema-level model constraints seamlessly.
- **Bcrypt Password Hashing:** Salted hash encryption for credential persistence.

---

## 🏗️ Architecture & Tech Stack

```
ShopSphere Project
├── shopsphere-main/           # Next.js 14+ Frontend & Core Web API
│   ├── app/                   # App Router Pages, Routes, & Layouts
│   │   ├── api/               # Serverless Next.js API Endpoints
│   │   ├── cart/              # Cart & Bag Management
│   │   ├── products/          # Catalog & Detail Pages
│   │   └── ...
│   ├── components/            # Reusable UI Components (Navbar, Visual Search Modal, etc.)
│   ├── lib/                   # Database client (Prisma), utility functions
│   ├── prisma/                # SQLite database schema, migrations & seed scripts
│   ├── store/                 # Zustand state stores (Cart, UI)
│   └── ml-service/            # Embedded Python FastAPI Computer Vision Service
│       ├── main.py            # FastAPI Application & Inference Server
│       ├── indexer.py         # Catalog Vector Extraction Script
│       ├── catalog_embeddings.pt # Indexed PyTorch Embeddings Store
│       └── requirements.txt   # Python Dependencies
```

### Technologies Used

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | Next.js (App Router), React, TypeScript |
| **Styling & Icons** | Tailwind CSS, Lucide React |
| **State Management** | Zustand (with local storage synchronization) |
| **Authentication** | NextAuth.js (JWT Strategy), BcryptJS |
| **Database & ORM** | SQLite, Prisma ORM |
| **Machine Learning Service** | FastAPI, PyTorch, Torchvision (MobileNetV3), Scikit-Learn, Pillow, Uvicorn |

---

## 🚀 Getting Started

Running ShopSphere requires two concurrent processes:
1. **FastAPI ML Microservice** on `http://127.0.0.1:8000`
2. **Next.js Frontend Application** on `http://localhost:3000`

---

### Prerequisites

- **Node.js:** `v18.17+` or `v20+`
- **npm** or **yarn**
- **Python:** `3.10+` or `3.11+`
- **Conda** (recommended) or `venv`

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/Shreyansh912/E-COMMERCE-WEBSITE.git
cd E-COMMERCE-WEBSITE/shopsphere-main
```

---

### Step 2: Configure Environment Variables

Create a `.env` file in the `shopsphere-main` directory:

```env
# Database configuration
DATABASE_URL="file:./dev.db"

# NextAuth Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="shopsphere-secure-auth-secret-key-98234"

# External Microservice URLs
NEXT_PUBLIC_ML_SERVICE_URL="http://127.0.0.1:8000"
```

---

### Step 3: Setup the Next.js Frontend

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Initialize Database & Run Migrations:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **(Optional) Seed Catalog Data:**
   ```bash
   npm run seed # or npx ts-node prisma/seed.ts
   ```

---

### Step 4: Setup and Run the Python ML Microservice

1. **Navigate to the `ml-service` directory:**
   ```bash
   cd ml-service
   ```

2. **Create and activate a Python virtual environment:**
   ```bash
   # Using Conda:
   conda create -n shopsphere-ml python=3.10 -y
   conda activate shopsphere-ml

   # Or using standard venv:
   python -m venv venv
   # Windows:
   .\venv\Scripts\activate
   # Linux/macOS:
   source venv/bin/activate
   ```

3. **Install ML dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
   *(Ensure `torch`, `torchvision`, `fastapi`, `uvicorn`, `scikit-learn`, `pillow`, and `numpy` are installed).*

4. **Generate Catalog Vector Embeddings:**
   > **Note:** This step processes product images and extracts deep feature representations into `catalog_embeddings.pt`. You must run this once before launching visual search!
   ```bash
   python indexer.py
   ```
   *Expected Output: `Saved 200+ vector embeddings to catalog_embeddings.pt`*

5. **Start the FastAPI Microservice:**
   ```bash
   python -m uvicorn main:app --reload --port 8000
   ```
   - **Service Health Check:** Visit `http://127.0.0.1:8000/` (returns JSON status and count of indexed items).
   - **Swagger Documentation:** Visit `http://127.0.0.1:8000/docs` to test endpoints interactively.

---

### Step 5: Start the Frontend Application

Open a second terminal window, navigate back to `shopsphere-main`, and run:

```bash
cd shopsphere-main
npm run dev
```

Open your browser and navigate to:
**`http://localhost:3000`**

---

## 📡 API Endpoints Reference

### Machine Learning Microservice (`http://127.0.0.1:8000`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Microservice health check & count of active vector embeddings |
| `POST` | `/search?top_k=8` | Accepts multipart image upload, returns top matching catalog product IDs & cosine scores |
| `GET` | `/similar/{product_id}?top_k=4` | Returns visually similar products based on catalog feature vector distance |
| `GET` | `/recommendations/{product_id}` | Alias for visual similarity endpoint |
| `GET` | `/docs` | Interactive OpenAPI Swagger UI documentation |

### Next.js Core API Routes (`http://localhost:3000/api`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/[...nextauth]` | Session login, authentication & token generation |
| `POST` | `/api/auth/register` | New customer account registration |
| `POST` | `/api/auth/reset-password` | Raw parameterized SQL password update bypassing schema constraints |
| `GET` | `/api/products` | Retrieve catalog items with category/search filters |
| `GET/POST`| `/api/cart` | Retrieve or persist server-synced cart items |

---

## 🛠️ Key Architectural Decisions & Fixes Applied

- **Global Navigation Isolation:** Navbar rendering is consolidated exclusively within the root `app/layout.tsx`. Redundant invocations inside individual route pages (`/cart`, `/profile`, `/orders`) were removed to eliminate UI flickering and duplicate header bars.
- **Account Cart Isolation:** Fixed shared cart state across account changes by adding explicit `clearCart()` invocations to the sign-out pipeline in `components/navbar/Navbar.tsx`.
- **Safe PyTorch Tensor Deserialization:** In `ml-service/main.py`, array extraction avoids evaluating truthiness across multi-dimensional tensors directly, preventing `Boolean value of Tensor with more than one value is ambiguous` runtime errors during indexing loads.
- **Direct SQL Reset Route:** Overcomes schema misalignment in Prisma Client during user password reset cycles by utilizing parameterized raw queries directly on the SQLite database layer.

---

## 🧪 Testing the End-to-End Flow

1. **User Authentication:** Create a new user account at `/register`, log in via `/login`, and verify your avatar and initials appear in the navigation bar.
2. **Visual Search:** Click the camera icon in the search bar, upload a sample product photo, and verify that matching catalog items are returned from port `8000`.
3. **Product Recommendations:** Open any product page and inspect the "Similar Products" shelf to ensure embeddings-based matches load.
4. **Sign Out Hygiene:** Add items to your cart, click sign out, and verify that the cart resets to zero for subsequent sessions.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.