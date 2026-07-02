# 💊 MediRun — Pharmacy & Health Delivery Platform

A full MERN stack pharmacy delivery platform with live rider tracking (free OpenStreetMap-based map), delivery fee calculation, reviews with +234 masking, Google sign-in, and a full admin CMS — including **manual rider assignment** by an admin instead of automated GPS matching.

This README is a complete, start-to-finish setup guide, written for a first deploy with **zero paid services**: a free MongoDB Atlas database, free Firebase Google sign-in, and free OpenStreetMap tiles for the delivery map.

---

## ✅ What changed in this pass (bug fixes & new features)

- **Fixed a build-breaking bug**: `react-icons` was imported throughout the app but was missing from `frontend/package.json` — `npm install` + `npm start` would fail. It's now a proper dependency.
- **Removed the Google Maps dependency.** The live delivery map now uses **Leaflet + OpenStreetMap**, which is free and needs no API key or billing account.
- **Manual rider assignment.** Orders no longer auto-assign "whichever rider happens to be free" — an admin picks a specific rider from the Orders dashboard once an order is confirmed (and, for bank transfers, once payment is confirmed). This also fixes a real bug where checkout would hard-fail with "No riders available" if every rider was busy.
- **Delivery fee** is now calculated from a fixed, admin-configurable pickup location (your pharmacy/warehouse) to the customer's address, instead of from whichever rider happened to be free — more accurate and no longer blocks checkout.
- **Google Sign-In with Firebase**, alongside the existing email/password auth. No email/SMS provider needed for this — Firebase's Google provider is free.
- **Mobile responsiveness fixes**: the navbar hamburger menu had `display:none` hardcoded with no way to ever show — mobile users could never open the nav menu. This is fixed, and checkout/cart/product/admin layouts now properly collapse to a single column and a slim icon sidebar on small screens.
- Icons already used `react-icons` (Lucide set) throughout — that convention is kept and extended (Google's "G" logo on the sign-in button uses `react-icons/fc`, the standard colored Google icon).
- Real database, real accounts: this guide sets you up with MongoDB Atlas (a real, persistent cloud database) rather than a local throwaway Mongo instance. `seed.js` is optional demo data only — actual sign-up (email/password or Google) creates real, permanently-stored user accounts.

---

## 🧱 Prerequisites

- [Node.js 18+](https://nodejs.org)
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) account (or local MongoDB if you prefer)
- A free [Firebase](https://console.firebase.google.com) account (for Google sign-in) — optional but recommended
- A free [Google Cloud Console](https://console.cloud.google.com) account is **not** required — Firebase handles the Google sign-in OAuth setup for you

---

## 1. Set up a real database (MongoDB Atlas — free)

1. Go to [mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register) and create a free account.
2. Create a new **free (M0) cluster** — any cloud provider/region is fine.
3. Under **Database Access**, add a database user with a username and password (save these).
4. Under **Network Access**, add an IP entry. For development, "Allow access from anywhere" (`0.0.0.0/0`) is simplest; tighten this later for production.
5. Click **Connect → Drivers**, copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Add a database name to the path (e.g. `/medirun`) so it becomes:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/medirun?retryWrites=true&w=majority
   ```
   This is your `MONGO_URI`. Every account that registers through the app (email/password or Google) will be a real document permanently stored in this database — nothing here is dummy data.

*(If you'd rather run MongoDB locally instead, install it and use `mongodb://localhost:27017/medirun` — everything else in this guide is identical.)*

---

## 2. Set up Google Sign-In (Firebase — free)

Firebase's Google auth provider is completely free at any scale for this use case, and needs no mailer/SMS subscription.

### 2a. Create the Firebase project
1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project** → name it (e.g. `medirun`) → finish the wizard.
2. In the left sidebar: **Build → Authentication → Get started**.
3. Under **Sign-in method**, enable **Google**, set a support email, and save.

### 2b. Get the frontend (web) config
1. In Project settings (gear icon) → **General** → scroll to "Your apps" → click the **Web** icon (`</>`) to register a web app (any nickname).
2. Copy the `firebaseConfig` values shown — you'll need `apiKey`, `authDomain`, `projectId`, and `appId` for `frontend/.env`.
3. Back in **Authentication → Settings → Authorized domains**, add `localhost` (already there by default) and, later, your production domain.

### 2c. Get the backend (Admin SDK) credentials
1. Project settings → **Service accounts** tab → **Generate new private key**. This downloads a JSON file.
2. From that JSON file, copy three values into `backend/.env`:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the `\n` characters exactly as they appear, wrapped in quotes)
3. **Never commit this file or its contents to git.** Keep it only in your `.env`.

If you skip Firebase setup entirely, the app still works fine with plain email/password sign-up — the Google button will just show a friendly "not configured" message instead of crashing.

---

## 3. Clone & install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

## 4. Configure environment variables

**Backend** — copy and edit:
```bash
cd backend
cp .env.example .env
```

Fill in `.env`:
```
PORT=5003
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/medirun?retryWrites=true&w=majority
JWT_SECRET=your_long_random_secret_string
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:3000
NODE_ENV=development

FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

> Generate a strong `JWT_SECRET` quickly with: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

**Frontend** — copy and edit:
```bash
cd frontend
cp .env.example .env
```

Fill in `.env`:
```
REACT_APP_API_URL=http://localhost:5003/api
REACT_APP_SOCKET_URL=http://localhost:5003

REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
```

No Google Maps key is needed — the map uses free OpenStreetMap tiles.

---

## 5. Seed demo/starter data (optional)

```bash
cd backend
node seed.js
```

This creates **demo content only** — it's optional and safe to skip:
- Sample products (medicines, devices, vitamins)
- 3 demo riders (so you have someone to manually assign orders to)
- Mock reviews with +234 Nigerian numbers
- A demo admin account: **admin@medirun.com / admin123**
- A demo customer account: **test@medirun.com / test123**

Your **real** customers and your own admin account should be created through the actual app (Sign up page, or by promoting a registered user's `role` to `admin` directly in Atlas — see below). Everything created this way is a real, permanent document in your MongoDB Atlas database.

### Creating your own real admin account
1. Register a normal account through the app at `/login` (email/password or Google).
2. In MongoDB Atlas → Browse Collections → `medirun` database → `users` collection, find your user document and change `role` from `"customer"` to `"admin"`.
3. Log out and back in — you'll now see the **Admin** link in the navbar.

---

## 6. Run the app

Open two terminals:

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm start
```

Visit:
- **Store:** http://localhost:3000
- **Admin:** http://localhost:3000/admin

---

## 🚚 How manual rider assignment works

Instead of relying on live GPS to auto-match "the nearest available rider" (which needs either Google's paid Directions API or a lot of extra infrastructure), MediRun now works like this:

1. Customer places an order. Delivery fee/ETA is calculated using **straight-line distance** (Haversine formula — free, no API) from your pharmacy's location (set in **Admin → Delivery fees → Pickup location**) to the customer's address.
2. For cash/card orders, the order goes straight to **Confirmed**. For bank transfer orders, it sits at **Awaiting payment confirmation** until an admin manually confirms the transfer landed (**Admin → Orders → Confirm payment**).
3. Once confirmed, an admin picks any available rider from a dropdown in **Admin → Orders** and clicks **Assign** — matching riders to zones/orders using human judgement (e.g. "this rider covers Lekki").
4. The assigned rider's phone/app can still push live GPS updates via `POST /api/riders/location` using their rider token (**Admin → Riders → Token**) — the customer's tracking page shows this live on the free OpenStreetMap-based map, with a straight dashed line between rider and customer.

If you don't want to bother with rider GPS at all, that's fine too — the map on the tracking page just won't show a moving rider marker until location updates start coming in; everything else (status updates, order details) works regardless.

---

## 🗂 Project Structure

```
medirun/
├── backend/
│   ├── config/db.js               MongoDB connection
│   ├── config/firebase.js         Firebase Admin SDK init (Google sign-in verification)
│   ├── middleware/auth.js         JWT + admin guard + rider token guard
│   ├── models/                    User, Product, Order, Rider, Review, DeliveryFeeRule, SiteContent
│   ├── routes/                    auth (incl. /google), products, orders, riders, reviews, delivery, siteContent
│   ├── routes/admin/              Products, Orders (incl. assign-rider), Riders, Reviews, Hero, Fee rules, Upload
│   ├── services/deliveryFeeService.js   Haversine + fee rules engine (store → customer)
│   ├── utils/phoneUtils.js        +234 masking
│   └── server.js                  Express + Socket.IO
│
└── frontend/
    ├── src/
    │   ├── config/firebase.js     Firebase web SDK init (Google sign-in)
    │   ├── components/            Navbar, ProductCard, ReviewCard, ReviewForm, LiveMap (Leaflet), DeliveryFeeWidget, OrderTracker
    │   ├── pages/                 Home, ProductDetail, Auth (incl. Google button), Cart, Checkout, TrackOrder, MyOrders
    │   ├── admin/pages/           Dashboard, ProductsCMS, OrdersCMS (incl. rider assignment), RidersCMS, ReviewsCMS, HeroCMS, FeeRulesCMS, PaymentSettingsCMS
    │   ├── context/                AuthContext (incl. Google), CartContext
    │   ├── hooks/                 useSocket, useDeliveryFee
    │   └── services/api.js        Axios instance
```

---

## 🔑 Key Features

| Feature | Details |
|---|---|
| **Live rider tracking** | Socket.IO pushes rider location updates; shown on a free Leaflet/OpenStreetMap map — no API key. |
| **Delivery fee engine** | Haversine distance (pharmacy → customer) × admin-configurable rules (base fee, per-km, peak hour surcharge). |
| **Manual rider assignment** | Admins assign riders to orders by hand from the Orders dashboard — no GPS-matching infrastructure required. |
| **Google Sign-In** | Firebase-backed "Continue with Google", alongside email/password. Free, no mailer needed. |
| **Reviews with +234** | All Nigerian phone numbers masked as `+234 803 ***4521`. |
| **Admin CMS** | Update hero text, categories, products, riders, reviews, delivery rules, pickup location, payment details — all live. |
| **Responsive** | Mobile-first layout: collapsing navbar, single-column checkout/cart/product pages, icon-only admin sidebar on small screens. |
| **JWT Auth** | Customer and admin roles. Protected routes on both frontend and backend. Google accounts issue the same JWTs as local accounts. |

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router 6, Socket.IO client, React Leaflet |
| Backend | Node.js, Express 4, Socket.IO |
| Database | MongoDB Atlas + Mongoose |
| Maps | Leaflet + OpenStreetMap (free, no API key) |
| Auth | JWT (jsonwebtoken + bcryptjs) + Firebase Admin (Google sign-in) |
| Validation | express-validator |
| Notifications | react-hot-toast |
| Icons | react-icons (Lucide set + Google "G" logo) |

---

## 🛠 Admin Panel

Login with an admin account at `/admin`. You can manage:

- **Products** — add, edit, delete, set stock, toggle active/inactive
- **Orders** — view all orders, update delivery status, confirm bank transfer payments, **manually assign riders**
- **Riders** — add riders, assign delivery zones, get each rider's GPS-push token
- **Reviews** — approve, hide, or delete customer reviews
- **Hero / Banner** — edit homepage headline, badge, CTA, background color, category order
- **Delivery fees** — set your pharmacy's pickup location, base fee, per-km rate, peak hours, free delivery threshold
- **Payment settings** — set the bank account customers transfer to for manual bank-transfer orders

---

## 🚀 Deploying (all free-tier friendly)

- **Backend**: [Render](https://render.com) or [Railway](https://railway.app) free tier — set the same env vars as `.env`, plus set `CLIENT_URL` to your deployed frontend URL.
- **Frontend**: [Vercel](https://vercel.com) or [Netlify](https://www.netlify.com) free tier — set the `REACT_APP_*` env vars, and point `REACT_APP_API_URL`/`REACT_APP_SOCKET_URL` at your deployed backend.
- **Database**: MongoDB Atlas free tier (already set up above).
- **Auth**: Firebase free tier (already set up above) — remember to add your production domain under Authentication → Settings → Authorized domains.
- Uploaded product images/prescriptions are stored on the backend's local disk (`backend/uploads`) — on most free hosts this is **not persistent across deploys/restarts**. For production, swap `middleware/upload.js` for a free-tier object storage service (e.g. Cloudinary's free tier) when you're ready to go further than local dev.

---

## ⚠️ Known limitations (good next steps, not blockers)

- Order numbers are generated from a document count, which has a small race-condition window under very high concurrent order volume — fine at small/medium scale.
- Uploaded files aren't persisted on most free hosting platforms' ephemeral filesystems (see Deploying section above).
- There's no password-reset flow for local accounts yet (Google sign-in sidesteps this entirely, since Google handles password recovery).
