# 🌲 VanNetr — Forest Rights Act (FRA) Decision Support System

> **Empowering Government Officers with Geospatial & AI Support for Forest Rights Act (FRA) Monitoring**

[![Vercel Deployment](https://img.shields.io/badge/Deployment-Vercel-success?style=for-the-badge&logo=vercel)](https://va-nnetr.vercel.app/login)
[![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Bundler-Vite-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)

---

## 🔗 Live Application Links

- 🔐 **Official Portal Login**: [https://va-nnetr.vercel.app/login](https://va-nnetr.vercel.app/login)
- 📊 **WebGIS Dashboard**: [https://va-nnetr.vercel.app/dashboard](https://va-nnetr.vercel.app/dashboard)

---

## ✨ Key Platform Features

### 1. 🔐 Seamless Passwordless & Google Officer Authentication
- **Single-Click Google Login**: Instant authentication for government officers via Google accounts.
- **Passwordless Email Verification**: Streamlined email verification launching directly into the personal officer dashboard.

### 2. 🗺️ WebGIS Multi-Tier FRA Spatial Monitoring Atlas
- **National State Choropleth Heatmaps**: Translucent glassmorphism state choropleth layers across all 36 Indian States & UTs (Title Recognition Rate %, Anomaly Risk Density, Claims Volume).
- **ISRO Bhuvan GIS & Esri Satellite Layers**: High-precision satellite imagery with toggleable topographic basemaps.
- **Protected Wildlife Buffer Intersections**: Real-time spatial overlap detection with Similipal Tiger Reserve, Kanha National Park, and Indravati National Park corridors.

### 3. 🤖 AI-Powered Executive Decision Engine
- **Automated Executive Brief Generation**: Instant AI summary evaluating real-time land record mismatches, area discrepancies, and statutory SLA delay trends (>180 days).
- **Audit Decision Briefs**: Detailed spatial reasoning and administrative action recommendations per claim.

### 4. 📊 State-wise FRA Implementation & Progress Matrix
- **Comparative Benchmarking**: State-by-state analytics tracking Total Claims, Titles Granted, Recognition Rate %, Land Distributed (Ha), and Active Anomalies across Odisha, Chhattisgarh, Madhya Pradesh, Maharashtra, Jharkhand, etc.
- **Stage Distribution & Pipeline Analytics**: Visual tracking across Gram Sabha, SDLC, DLC, and Title Deed stages.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend UI** | React 18, Vite, Tailwind CSS, Lucide Icons |
| **Spatial GIS & Maps** | Leaflet GIS, React-Leaflet, Esri World Imagery, GeoJSON |
| **Data Analytics** | Recharts, Custom Spatial Intersection Engine |
| **Backend API** | Node.js, Express, Vercel Serverless Functions |
| **Authentication** | Supabase Auth, Firebase Auth, Custom Local Storage Session Engine |
| **Deployment** | Vercel Global Edge Network |

---

## 🚀 Getting Started (Local Setup)

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation & Running Locally

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Shoubhik95/VANnetr_.git
   cd VANnetr_
   ```

2. **Install Dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install client dependencies
   cd client && npm install && cd ..
   ```

3. **Start Development Server**
   ```bash
   # Run Vite Client Dev Server (Port 3000)
   npm --prefix client run dev
   ```

4. **Open in Browser**
   Navigate to `http://localhost:3000` to access the portal locally.

---

## 📄 License & Attribution

Designed and developed for the **Ministry of Tribal Affairs (MoTA)** Forest Rights Act (FRA) Monitoring & Decision Support System.