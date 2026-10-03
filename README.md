# E-Shop — Master Full-Stack Project Planning, Architecture & Specification

> **The Ultimate Architectural Blueprint & Implementation Specification for E-Shop**  
> *A high-performance, AI-powered e-commerce ecosystem blending the best capabilities of Amazon, Flipkart, and modern Web3 aesthetics.*

---

### 📚 Project Documentation & Architecture Suite

| Document / Asset | File Path | Description |
|---|---|---|
| 📋 **Enhanced Project Planning Document** | [EShop_Project_Planning_Document.md](file:///c:/Users/WIN%2011/Desktop/E%20commerce/E_Shop/EShop_Project_Planning_Document.md) | Enhanced planning document with Provenance Tags `[U]`/`[R]`, Assumptions A1–A10, and 20 Granular Phased Prompts (P1–P20). |
| 🏗️ **Technical Architecture Specifications** | [ARCHITECTURE.md](file:///c:/Users/WIN%2011/Desktop/E%20commerce/E_Shop/ARCHITECTURE.md) | Complete micro-flows, sequence diagrams, 5-stage order state machine, and infrastructure topology. |
| 🖥️ **Interactive Architecture Dashboard** | [architecture-diagram.html](file:///c:/Users/WIN%2011/Desktop/E%20commerce/E_Shop/architecture-diagram.html) | Interactive dark-mode visual diagram navigator with tabbed flows and zoom/pan controls. |
| 🖼️ **System Architecture Blueprint** | [architecture-diagram.jpg](file:///c:/Users/WIN%2011/Desktop/E%20commerce/E_Shop/architecture-diagram.jpg) | High-resolution infographic displaying multi-tier services, Edge gateway, and persistence layers. |

---

## Table of Contents

1. [Project Overview](#1-project-overview)
   - [Product Identity & Branding](#product-identity--branding)
   - [Executive Summary](#executive-summary)
   - [Problem Statement & Market Opportunity](#problem-statement--market-opportunity)
   - [Proposed Solution](#proposed-solution)
   - [Business Goals & Value Proposition](#business-goals--value-proposition)
   - [Success Metrics & Target KPIs](#success-metrics--target-kpis)
2. [Target Users and Roles](#2-target-users-and-roles)
   - [User Personas](#user-personas)
   - [Role-Based Access Control (RBAC) Matrix](#role-based-access-control-rbac-matrix)
   - [Core User Journeys](#core-user-journeys)
3. [Scope Definition](#3-scope-definition)
   - [MVP Scope (Phase 1)](#mvp-scope-phase-1)
   - [Post-MVP Scope (V2 & Future Roadmap)](#post-mvp-scope-v2--future-roadmap)
   - [Explicitly Out-of-Scope Items](#explicitly-out-of-scope-items)
   - [Assumptions & Constraints](#assumptions--constraints)
4. [Functional Requirements](#4-functional-requirements)
   - [Module 1: Landing Page & Dynamic Navigation](#module-1-landing-page--dynamic-navigation)
   - [Module 2: Visual Category Browser & AI Recommendations (3×4 Grid)](#module-2-visual-category-browser--ai-recommendations-34-grid)
   - [Module 3: Web3 Canvas Footer Animation](#module-3-web3-canvas-footer-animation)
   - [Module 4: Multi-Identifier Authentication & Random Avatars](#module-4-multi-identifier-authentication--random-avatars)
   - [Module 5: Real-Time Notification Center with Swipe-to-Dismiss](#module-5-real-time-notification-center-with-swipe-to-dismiss)
   - [Module 6: Left Sidebar Filters & Multi-Parameter Sorting](#module-6-left-sidebar-filters--multi-parameter-sorting)
   - [Module 7: Interactive Product Cards & 3D Hover Oversight](#module-7-interactive-product-cards--3d-hover-oversight)
   - [Module 8: Product Detail Page & 6-Second Auto-Slide Gallery](#module-8-product-detail-page--6-second-auto-slide-gallery)
   - [Module 9: Smart Pincode Delivery Estimator (Default 560035)](#module-9-smart-pincode-delivery-estimator-default-560035)
   - [Module 10: Verified-Purchaser Product Reviews & Ratings](#module-10-verified-purchaser-product-reviews--ratings)
   - [Module 11: Real-Time Cart, Address Selector & Promo Engine](#module-11-real-time-cart-address-selector--promo-engine)
   - [Module 12: Order Checkout, Payment Gateway & Automated PDF Invoicing](#module-12-order-checkout-payment-gateway--automated-pdf-invoicing)
   - [Module 13: Order Lifecycle, History & Visual Order Tracking](#module-13-order-lifecycle-history--visual-order-tracking)
   - [Module 14: Customer Account Dashboard & Profile Lifecycle](#module-14-customer-account-dashboard--profile-lifecycle)
   - [Module 15: Protected Admin Section & Operations Panel](#module-15-protected-admin-section--operations-panel)
   - [Module 16: Sticky Glassmorphism AI Search & Personal Shopping Concierge](#module-16-sticky-glassmorphism-ai-search--personal-shopping-concierge)
5. [Non-Functional Requirements](#5-non-functional-requirements)
   - [Performance & Core Web Vitals](#performance--core-web-vitals)
   - [Accessibility (a11y)](#accessibility-a11y)
   - [Reliability, Availability & Fault Tolerance](#reliability-availability--fault-tolerance)
   - [Browser & Device Compatibility](#browser--device-compatibility)
   - [Localization & Currency Standards](#localization--currency-standards)
6. [UX/UI Requirements & Design System](#6-uxui-requirements--design-system)
   - [Information Architecture & Sitemap](#information-architecture--sitemap)
   - [Design Tokens & Theming](#design-tokens--theming)
   - [Micro-Interactions & Animation Specs](#micro-interactions--animation-specs)
   - [Component States (Loading, Empty, Success, Error)](#component-states)
7. [Technical Architecture](#7-technical-architecture)
   - [Tech Stack Selection & Justification](#tech-stack-selection--justification)
   - [System Architecture Diagram (Mermaid)](#system-architecture-diagram)
   - [Frontend & Client State Architecture](#frontend--client-state-architecture)
   - [Backend & API Architecture](#backend--api-architecture)
   - [AI Concierge Architecture with Gemini API](#ai-concierge-architecture)
   - [Real-Time Event Architecture (SSE / WebSockets)](#real-time-event-architecture)
8. [Database Design & Data Models](#8-database-design--data-models)
   - [Entity Relationship Diagram (Mermaid ERD)](#entity-relationship-diagram)
   - [Database Schemas & Data Dictionary (PostgreSQL / Prisma)](#database-schemas--data-dictionary)
   - [Indexes, Foreign Keys & Constraints](#indexes-foreign-keys--constraints)
9. [API Specification](#9-api-specification)
   - [RESTful Endpoints Matrix](#restful-endpoints-matrix)
   - [Sample Request & Response JSON Shapes](#sample-request--response-json-shapes)
10. [Security and Privacy](#10-security-and-privacy)
    - [Authentication & JWT Lifecycle](#authentication--jwt-lifecycle)
    - [Password & OTP Security](#password--otp-security)
    - [OWASP Top 10 Mitigation](#owasp-top-10-mitigation)
    - [Data Encryption & Secrets Management](#data-encryption--secrets-management)
11. [Development Plan & Directory Structure](#11-development-plan--directory-structure)
    - [Repository Directory Tree](#repository-directory-tree)
    - [Environment Variable Template (`.env.example`)](#environment-variable-template)
    - [Phased Implementation Roadmap](#phased-implementation-roadmap)
12. [Testing Strategy](#12-testing-strategy)
    - [Testing Levels & Tools](#testing-levels--tools)
    - [Critical Test Scenarios & Quality Gates](#critical-test-scenarios--quality-gates)
13. [DevOps, Deployment & Infrastructure](#13-devops-deployment--infrastructure)
    - [Containerization (Docker & Compose)](#containerization)
    - [CI/CD Pipeline (GitHub Actions)](#cicd-pipeline)
    - [Cloud Hosting & Production Deployment](#cloud-hosting--production-deployment)
14. [Documentation Deliverables](#14-documentation-deliverables)
15. [Risks, Edge Cases & Mitigation](#15-risks-edge-cases--mitigation)
16. [AI Coding IDE Execution Prompts (Granular Handoff Prompts)](#16-ai-coding-ide-execution-prompts)

---

## 1. Project Overview

### Product Identity & Branding
- **Name:** E-Shop
- **Tagline:** Next-Generation Intelligent Commerce.
- **Brand Archetype:** High-tech, ultra-responsive, trustworthy, and visually captivating.
- **Inspiration:** Synergizing Amazon’s robust catalog, fulfillment speed, and search with Flipkart’s dynamic discounts, festive offer banners, and Indian pincode delivery intelligence, supercharged with modern Web3 visual aesthetics and a context-aware Google Gemini AI shopping assistant.

### Executive Summary
**E-Shop** is a production-grade, full-stack e-commerce web platform engineered for maximum customer conversion, frictionless navigation, and administrative efficiency. Built using Next.js 15, TypeScript, PostgreSQL, Prisma, TailwindCSS/Vanilla CSS, and Google Gemini API, E-Shop features auto-sliding promotional banners, animated drop-down navigation, live category filters, 3D card hover oversight, 6-second auto-slide product galleries, pincode distance estimation (benchmarked to default `560035` Bengaluru), verified-only customer reviews, real-time cart tracking, admin coupon engine, automated PDF invoice generation, visual order tracking with conditional cancellation/address alteration, a comprehensive hidden admin dashboard, and a persistent, bottom-centered glassmorphism AI shopping concierge.

### Problem Statement & Market Opportunity
Legacy e-commerce clones frequently suffer from:
1. **Cluttered, Generic UI:** Monolithic layouts lacking fluid micro-interactions, responsive hover states, or modern aesthetic depth.
2. **Impersonal Search:** Static keyword searches that fail when buyers describe their needs naturally (e.g., *"Show me lightweight wireless noise-canceling headphones for university under ₹6,000"*).
3. **Fragmented Buyer Lifecycle:** Disconnected OTP auth, missing real-time delivery estimates, fake unverified reviews, and lack of instant downloadable PDF invoices.
4. **Weak Administrative Control:** Fragmented backends without paginated order management, dynamic coupon generation, inventory alerts, or customer governance.

### Proposed Solution
E-Shop resolves these pain points through a unified architectural approach:
- **Visual Delight:** Smooth auto-swipe banner carousels, staggered animated category dropdowns, subtle 3D pop-up card elevations, and an interactive Web3 particle canvas footer.
- **Intelligent Shopping:** A sticky bottom-center frosted glassmorphism AI search & chat assistant powered by Gemini 2.5 Flash that maintains per-user chat context and returns direct clickable product cards.
- **Trust & Verification:** Strict verified-buyer-only review restrictions, delivery timeline calculator based on Indian pincode coordinates, multi-identifier login (Email, Phone, Username) with Gmail OTP, and tamper-proof PDF invoices.
- **Full Operational Governance:** A hidden, protected admin suite with 10-per-page paginated order processing, real-time stock analytics, coupon creation, and broadcast deal notifications with swipe-to-dismiss functionality.

### Business Goals & Value Proposition
- **High Conversion Rate (CVR):** Minimize drop-off with 1-click cart addition, inline quantity counters, and smart promo codes.
- **Personalized Retention:** Deliver 12 personalized products (3×4 grid) via user affinity tracking and interactive AI recommendations.
- **Operational Scalability:** Stateless JWT sessions, optimized database indexing, edge caching, and automated asynchronous notifications.

### Success Metrics & Target KPIs
| Metric | Target | Measurement Method |
|---|---|---|
| **Largest Contentful Paint (LCP)** | < 1.5 seconds | Lighthouse / Web Vitals MCP |
| **Interaction to Next Paint (INP)** | < 100 milliseconds | Chrome DevTools Real-User Monitoring |
| **Cumulative Layout Shift (CLS)** | < 0.05 | Core Web Vitals Auditing |
| **Search-to-Cart Conversion** | > 18% | Application Event Analytics |
| **Cart-to-Order Completion** | > 65% | Checkout Funnel Tracking |
| **AI Assistant Engagement** | > 25% of active sessions | AI Conversation Session Telemetry |

---

## 2. Target Users and Roles

### User Personas

```mermaid
journey
    title E-Shop Customer & Admin Experience
    section Customer Flow
      Browse Auto-Banner & Categories: 5: Customer
      Ask Glassmorphism AI Assistant: 5: Customer
      Check Pincode 560035 Delivery: 4: Customer
      Add to Cart with Inline Counter: 5: Customer
      Apply Admin Promo Code: 5: Customer
      Order & Download PDF Invoice: 5: Customer
      Track 5-Step Order Progress: 4: Customer
    section Admin Flow
      Log in via Secure Admin Route: 5: Admin
      Review Dashboard KPI Cards: 5: Admin
      Broadcast Flash Deal Notification: 5: Admin
      Generate 20% Coupon Code: 5: Admin
      Manage 10 Orders Per Page: 4: Admin
      Update Stock & Product CRUD: 5: Admin
```

1. **The Modern Consumer (Priya, 26 — Tech Professional)**
   - *Goal:* Fast browsing, reads real reviews before buying, wants clear delivery date to her apartment in Bengaluru (`560035`).
   - *Pain Point:* Confusing navigation, fake reviews, inability to modify address after ordering.
   - *E-Shop Advantage:* One-click pincode estimation, verified purchaser reviews badge, ability to update shipping address prior to dispatch.

2. **The Bargain Hunter (Rahul, 31 — Budget Conscious Shopper)**
   - *Goal:* Seeks high-discount deals, uses coupons, wants clear breakdown of savings.
   - *Pain Point:* Expired coupons, hidden delivery fees, clunky coupon validation.
   - *E-Shop Advantage:* Prominent discount badge on products, instant admin promo code validation, transparent cart totals.

3. **The Conversational Shopper (Ananya, 21 — College Student)**
   - *Goal:* Needs laptop recommendations for coding and digital art under a strict budget.
   - *Pain Point:* Scrolling through hundreds of technical spec sheets without knowing what matches.
   - *E-Shop Advantage:* Sticky floating glass AI concierge providing curated direct product recommendations via conversational chat.

4. **The Store Administrator (Vikram, 38 — Operations & Inventory Manager)**
   - *Goal:* Needs an uncluttered dashboard with live sales metrics, inventory alerts, quick order status updates, and user management.
   - *Pain Point:* Overwhelmed by sluggish administrative interfaces and manual invoice generation.
   - *E-Shop Advantage:* Dedicated hidden admin portal, 10-per-page paginated order fulfillment, one-click order status transitions (Accept/Reject/Delivered), and instant stock analytics.

### Role-Based Access Control (RBAC) Matrix

| Feature / Resource | Guest (Unauthenticated) | Customer (Authenticated) | Admin (Superuser) |
|---|:---:|:---:|:---:|
| View Landing Page, Banners & Categories | ✅ | ✅ | ✅ |
| Search Catalog & Filter Products | ✅ | ✅ | ✅ |
| Add to Cart & Wishlist | ⚠️ (Local storage only) | ✅ (Persisted to DB) | ✅ |
| Use Floating Glass AI Assistant | ✅ (Ephemeral session) | ✅ (Persistent DB history) | ✅ |
| Calculate Pincode Delivery Estimate | ✅ | ✅ | ✅ |
| Submit Product Review | ❌ | ✅ (Verified buyers only) | ✅ |
| Checkout & Order Placement | ❌ | ✅ | ❌ (Customer mode) |
| Download Automated PDF Invoice | ❌ | ✅ (Own orders) | ✅ (All orders) |
| Track Order / Cancel / Edit Address | ❌ | ✅ (Before out-for-delivery) | ✅ (Override anytime) |
| Receive Deal Notifications | ❌ | ✅ (Dismiss via right-swipe)| ✅ |
| Access Admin Panel (`/admin/*`) | ❌ | ❌ | ✅ |
| Product & Category CRUD | ❌ | ❌ | ✅ |
| Create Discount Coupons | ❌ | ❌ | ✅ |
| Broadcast Deal Notifications | ❌ | ❌ | ✅ |
| Manage Users / Ban / Delete Account | ❌ | ❌ | ✅ |

---

## 3. Scope Definition

### MVP Scope (Phase 1)
All 6 serialized functional specification blocks requested by the user:
- **Landing Page & Top Navigation:** Auto-swipe discount posters carousel (left-to-right), animated category dropdown, E-Shop logo with home navigation, smart search input, wishlist counter badge, reactive cart badge, login button.
- **Category Bar & AI Recommendations:** Visual category boxes with images, special discounts button, 3×4 grid (12 items) of personalized AI product recommendations, Web3 animated canvas footer, contact developers.
- **Authentication & User Management:** Multi-identifier login (Phone, Username, Email), Gmail OTP verification, password login with eye toggle, forgot password flow, live password strength meter on signup, random account avatar allocation.
- **Notifications & Swipe-to-Dismiss:** Admin-initiated broadcast deal notifications with interactive right-swipe to delete.
- **Catalog, Filtering & Hover Oversight:** Left sidebar filters (min-to-max price slider, category, rating), multi-parameter sorting (Newest, Oldest, Low-to-High, High-to-Low, Discount, Best Sellers), 3D card pop-up hover effect, wishlist heart toggle.
- **Product Details & Gallery:** New tab navigation, left vertical thumbnail strip, 6-second auto-slide main image with arrow controls, rich specs, warranty.
- **Delivery Estimator:** Default pincode `560035` lookup, custom pincode input, distance & transit calculation.
- **Verified Reviews:** Strict verified purchaser gate, real-time review submissions, star breakdown.
- **Cart & Promo Engine:** Real-time top navbar cart counter, address selection on top of cart products, admin coupon code application.
- **Invoicing & Checkout:** Payment simulation/gateway, unique invoice number generation, client/server downloadable PDF invoice.
- **Order Lifecycle & Tracking:** 5-step visual tracking pipeline, conditional address modification & cancellation before `Out for Delivery`.
- **Hidden Admin Suite:** CRUD operations on products/categories, inventory analytics, user management, 10-per-page paginated order fulfillment (Accept, Reject, Delivered), coupon code generator.
- **Sticky Glassmorphism AI Concierge:** Floating bottom-center frosted glass search and chat bar, persistent per-user context, direct product card links.

### Post-MVP Scope (V2 & Future Roadmap)
- Multi-vendor marketplace support with individual merchant dashboards.
- Native mobile applications (React Native / Flutter) reusing the REST/GraphQL APIs.
- Real Web3 cryptocurrency checkout (ETH, USDC, Solana) using Wagmi / RainbowKit.
- Augmented Reality (AR) 3D product preview in mobile browser.
- Voice-activated natural language search using Web Speech API.

### Explicitly Out-of-Scope Items
- Physical courier API hardware tracking (simulated via deterministic coordinate distance matrix).
- Telephonic voice customer support (handled via AI chat assistant and email ticketing).

### Assumptions & Constraints (Provenance Matrix)

| # | Assumption / Constraint | Impact on Architecture & Implementation |
|---|---|---|
| **A1** | **"Web 3 animation"** means a modern *Web3-style visual* (interactive animated particle network / 3D-node canvas mesh on the About/footer section), **not** blockchain token transactions. | Built via HTML5 Canvas / Three.js without requiring Web3 wallet extension dependencies for visitors. |
| **A2** | **Currency & Locale:** Currency is Indian Rupee (`₹` / INR); language English; timezone Indian Standard Time (IST - UTC+5:30). | Used for order pricing, promo discount caps, and timestamped PDF invoice generation. |
| **A3** | **Warehouse Origin Hub:** Delivery distance is computed from central hub PIN code (`560001` - Bengaluru Central GPO) to the destination PIN using centroid coordinates and the Haversine formula. | Default destination is `560035` (Sarjapur/Karmelaram, Bengaluru). Delivery ETA = 1 day base + `ceil(distance / 400km)`. |
| **A4** | **Payment Gateway Integration:** Payment uses **Razorpay in test mode** (India-native; supports simulated UPI, Cards, Netbanking, and COD). | Supports simulated webhook signature verification and mock confirmation. |
| **A5** | **OTP Delivery Channels:** Email OTP uses Nodemailer (Gmail SMTP for dev / Resend for prod); Phone OTP uses MSG91 or Twilio SMS, falling back to server console logging in dev mode. | Guarantees non-blocking testing during development without external billing blockers. |
| **A6** | **Scale Target:** Designed for ~1,000 concurrent users on solo/student or small-team scale; stateless API with horizontal scalability. | Free/low-cost cloud tier compatible (Vercel, Render, Supabase, Neon). |
| **A7** | **Category Visual Boxes:** Category cards are implemented as styled visual boxes with representative category imagery and an animated "Mega Discount" button. | Matches the UI requirement while allowing custom asset updates via admin panel. |
| **A8** | **Order Cancellation Policy:** "Change address" and "Cancel order" are allowed only before status reaches *Shipped / Out for Delivery*. | Terminal lockdown occurs at `OUT_FOR_DELIVERY` to reflect real-world logistics constraints. |
| **A9** | **Registration Flow:** "Draw/register new" indicates a prominent *"New user? Register"* link with live password entropy analysis. | Live 4-tier visual strength bar (Weak, Fair, Strong, Bulletproof). |
| **A10** | **Admin Order Export:** "Complete payment will be created" indicates a **1-click payment/settlement summary report** exported alongside the paginated order list (CSV & PDF). | Operational reconciliation report for administrative oversight. |

### MVP Scope Prioritization & Cut-Line Strategy
If delivery timelines necessitate an phased rollout, the architectural **cut line** (build last, drop first) is:
1. Interactive Web3 canvas particle footer (fallback to static CSS gradient mesh).
2. Advanced AI conversational chat history search (fallback to 10-turn active memory).
3. Complex export formats beyond standard CSV/PDF.
4. Live SMS provider integration (fallback to reliable Gmail SMTP OTP).

---

## 4. Functional Requirements

### Module 1: Landing Page & Dynamic Navigation
- **Auto-Swipe Hero Carousel:**
  - Automated continuous sliding from left to right every 4 seconds.
  - Displays high-resolution promotional discount posters (e.g., "Electronics Fest 50% Off", "Fashion Mega Carnival").
  - Clickable banners redirect directly to the specific discounted product or curated category page.
  - Manual pause on hover, touch-swipe gestures for mobile, pagination indicator dots, and left/right navigation chevrons.
- **Top Navigation Bar:**
  - **Brand Logo:** Distinct SVG E-Shop logo on the top-left; clicking instantly resets filters and navigates to the home view.
  - **Animated Category Dropdown:** Staggered sliding transition using CSS keyframes / Framer Motion. Reveals sub-categories with icons on click/hover.
  - **Smart Search Bar:** Centered input with search icon, auto-complete suggestions, keyboard shortcut (`/` to focus), and debounce of 300ms.
  - **Action Controls (Top-Right):**
    - Wishlist Heart button with live count badge.
    - Cart icon with real-time quantity badge (animates on item increment).
    - Authentication button displaying "Login" for guests, or the user's allocated avatar for authenticated members.

### Module 2: Visual Category Browser & AI Recommendations (3×4 Grid)
- **Top Category Strip:**
  - Visual circular/boxed cards with high-contrast category imagery (Mobiles, Laptops, Fashion, Audio, Home, Watches).
  - Prominent pulsating "🔥 Mega Discounts" button filtering for items with > 30% discount.
- **AI-Recommended Products (3×4 Grid):**
  - Exactly 12 recommended products displayed in an ergonomic 3-column by 4-row layout on desktop (responsive: 2-col tablet, 1-col mobile).
  - Powered by user browsing affinity, category popularity, and Gemini recommendation scoring.
  - Live badges: "AI Pick", "Trending", "Top Rated".

### Module 3: Web3 Canvas Footer Animation
- **Visual Presentation:**
  - Placed at the bottom of the page above the developer credits and legal disclosures.
  - Interactive HTML5 Canvas / Three.js particle network rendering interconnected blockchain nodes that react to mouse position with subtle glowing wave oscillations.
  - "About E-Shop" narrative, developer contact links (GitHub, LinkedIn, Portfolio), newsletter signup, and Web3 aesthetic badges.

### Module 4: Multi-Identifier Authentication & Random Avatars
- **Login Options:**
  - Single input field accepting: Email ID, Phone Number, or Username.
  - Dynamic verification: Password-based authentication or OTP-based verification (Gmail OTP or SMS OTP).
  - Password visibility toggle with an interactive SVG eye button.
  - "Forgot Password?" modal initiating an OTP reset sequence to the verified email.
- **Registration Flow:**
  - Input fields: Full Name, Unique Username, Email ID, Phone Number, Password, Confirm Password.
  - **Live Password Strength Meter:** Evaluates length (>= 8 chars), mixed case, numbers, and symbols. Displays animated colored bar (Red = Weak, Yellow = Fair, Green = Strong, Cyan = Bulletproof) with helper advice.
  - Instant OTP dispatch to Email or Phone; on successful verification, redirect user directly to Login with a success toast.
- **Random Avatar Allocation:**
  - On registration, the backend assigns one of 10 distinct, vibrant avatar vectors (e.g., Cyberpunk Ninja, Space Voyager, Neon Fox, Pixel Robot) to `user.avatarUrl`.

### Module 5: Real-Time Notification Center with Swipe-to-Dismiss
- **Admin Broadcasts:**
  - Admin publishes deal alerts (e.g., *"Flash Sale: 40% off Sony Headphones for next 2 hours!"*).
  - WebSockets / Server-Sent Events (SSE) push the alert to all connected customer clients instantly.
- **Interactive Notification Drawer:**
  - Bell icon in navbar with unread count badge.
  - Clicking opens a slide-over panel listing notifications with timestamp, title, and link.
  - **Right-Swipe to Dismiss:** Users can drag/swipe a notification card to the right using touch or mouse drag. Beyond a 120px threshold, the card plays an exit fade animation, removes from client state, and marks dismissed on the server.

### Module 6: Left Sidebar Filters & Multi-Parameter Sorting
- **Filter Controls:**
  - **Category Hierarchy:** Multi-level checkbox selection with product count badges.
  - **Price Range Slider:** Dual-handle interactive slider with manual min & max numerical inputs (e.g., ₹500 to ₹150,000).
  - **Customer Rating Filter:** 4★ & above, 3★ & above, 2★ & above.
  - **Discount Percentage Filter:** 10%+, 20%+, 30%+, 50%+.
  - **Stock Status:** "In Stock Only" toggle.
- **Sorting Options:**
  - `featured`: Featured / Default
  - `newest`: Recently Added
  - `oldest`: Last Added / Oldest
  - `price_asc`: Price: Low to High
  - `price_desc`: Price: High to Low
  - `rating_desc`: Customer Rating
  - `discount_desc`: Highest Discount

### Module 7: Interactive Product Cards & 3D Hover Oversight
- **Card Elements:**
  - High-res product image with lazy loading and object-contain formatting.
  - Brand name, product title (truncated with tooltip), category badge.
  - Original price (strikethrough in subtle red/gray), discounted price (bold primary color), and discount percentage tag (e.g., `-35% OFF`).
  - **Heart Wishlist Button:** Positioned on the top-right of the image; clicking toggles wishlist state with a heart-burst micro-animation.
  - **Inline Quantity Counter:** "Add to Cart" button morphs upon click into an interactive `[-] [ quantity ] [+]` control, allowing instant cart adjustments without leaving the grid.
- **3D Pop-Up Hover Effect:**
  - On hover, the card elevates with a smooth 3D perspective transform (`transform: translateY(-8px) scale(1.02)`), casting a soft ambient drop shadow to provide an immediate tactile oversight preview.

### Module 8: Product Detail Page & 6-Second Auto-Slide Gallery
- **Dedicated View / New Tab:**
  - Clicking any product card opens the comprehensive Product Detail view in a new tab or dynamic route (`/product/[slug]`).
- **Interactive Media Gallery:**
  - **Left Vertical Thumbnail Strip:** Displays 4–6 small product angles. Hovering or clicking switches the active hero image.
  - **Main Projected Image Carousel:** Automatically slides to the next angle every 6 seconds. Pauses when cursor hovers over the viewer.
  - **Navigation Controls:** Prominent left and right SVG chevrons for manual cycling.
  - **Magnifier Zoom:** Hovering over the main projected image reveals an elevated 2.5× optical zoom lens.
- **Product Specifications:**
  - Tabbed interface: Full Description, Technical Specifications, In-the-Box items, Warranty terms, and Delivery timeline.

### Module 9: Smart Pincode Delivery Estimator (Default 560035)
- **Core Intelligence:**
  - The delivery section defaults to Indian pincode `560035` (Bengaluru, Karnataka).
  - Input field allows any customer to test their own 6-digit postal code.
  - The backend calculates distance from the central distribution center (`560001` - Bengaluru Central Hub) using a geo-coordinate/zone lookup table.
  - **Estimated Arrival Date:**
    - Same City (< 30 km): "Delivery Tomorrow by 9 PM" (Free).
    - Regional (< 300 km): "Delivery in 2 Days" (Free over ₹499, else ₹40).
    - National (> 300 km): "Delivery in 4–6 Days" (₹70 standard).
  - Dynamic display of "Cash on Delivery Available" and "7-Day Replacement Policy".

### Module 10: Verified-Purchaser Product Reviews & Ratings
- **Strict Verification Gate:**
  - Only authenticated users whose account has an order in `DELIVERED` status containing this `productId` can view and submit the "Write a Review" form.
  - Other users see: *"Only verified buyers who have received this product can leave a review."*
- **Review Display:**
  - Aggregate rating score (e.g., 4.7 / 5.0) with star visualization and breakdown histogram (5★, 4★, 3★, 2★, 1★).
  - Review cards include user name, avatar, "Verified Purchase" green checkmark badge, star rating, review title, detailed description, and submission date.

### Module 11: Real-Time Cart, Address Selector & Promo Engine
- **Navbar Live Badge:**
  - Dynamically updates item count badge with bounce animation upon any cart mutation.
- **Cart Page Architecture:**
  - **Top Address Selector:** Positioned above the item list. Displays the customer's saved shipping addresses with a radio selection button or an "Add New Address" modal.
  - **Item List:** Displays thumbnail, title, price, inline increment/decrement/delete buttons, and stock validation warnings.
  - **Admin Promo / Coupon Engine:**
    - Coupon input box with "Apply" button.
    - Validates against active, non-expired coupons created in the Admin Panel.
    - Applies percentage discount (e.g., `SAVE20` = 20% off subtotal).
    - Displays green savings confirmation banner or red error message ("Invalid or expired coupon").
  - **Order Summary:** Subtotal, Discount Savings, Shipping Fee, Estimated Tax, and Final Payable Amount.

### Module 12: Order Checkout, Payment Gateway & Automated PDF Invoicing
- **Checkout Sequence:**
  - Multi-step or accordion checkout: 1. Address Verification -> 2. Payment Method -> 3. Order Review.
  - Payment options: Credit/Debit Card, UPI / QR, Net Banking, and Cash on Delivery (COD). Integrated with simulated or real Stripe/Razorpay gateway.
- **Automated PDF Invoice Generation:**
  - On successful order placement, the system generates a unique Invoice Number (`INV-YYYYMMDD-XXXXX`).
  - Automatically compiles an invoice data payload: Company Details, Customer Details, Delivery Address, Items Table (Item, SKU, Qty, Price, Total), Subtotal, Coupon Discount, Tax, Grand Total, and Authorized Digital Signature.
  - Client-side and server-side PDF generator (`@react-pdf/renderer` or `jspdf`) provides an instant "Download Invoice (PDF)" button on the order confirmation screen and order history.

### Module 13: Order Lifecycle, History & Visual Order Tracking
- **Order History View (`/account/orders`):**
  - Chronological list of orders with Order ID, placement date, total price, and thumbnail previews.
- **5-Step Visual Tracking Stepper:**
  ```mermaid
  stateDiagram-v2
      [*] --> ORDER_PLACED: Customer Confirms Order
      ORDER_PLACED --> CONFIRMED: Admin Accepts Order
      CONFIRMED --> SHIPPED: Dispatched from Hub
      SHIPPED --> OUT_FOR_DELIVERY: Arrived at Local Facility
      OUT_FOR_DELIVERY --> DELIVERED: Reaches Customer Address
      
      ORDER_PLACED --> CANCELLED: Customer / Admin Action
      CONFIRMED --> CANCELLED: Customer / Admin Action
      SHIPPED --> CANCELLED: Customer / Admin Action
      OUT_FOR_DELIVERY --> [*]: Cancellation Locked
      DELIVERED --> [*]: Final State
  ```
- **Conditional Action Rules:**
  - **Cancel Order:** Allowed **only** while order status is `ORDER_PLACED`, `CONFIRMED`, or `SHIPPED`. The button disables automatically when the status reaches `OUT_FOR_DELIVERY` or `DELIVERED`.
  - **Modify Delivery Address:** Allowed **only** prior to `OUT_FOR_DELIVERY`. An "Edit Shipping Address" button opens a modal to select or enter a new address.

### Module 14: Customer Account Dashboard & Profile Lifecycle
- **Navigation Tabs:**
  - `Profile`: Edit full name, phone number, email address, view randomly assigned avatar.
  - `My Orders`: Comprehensive list of past orders with tracking links and PDF download buttons.
  - `Track Order`: Quick lookup by Order ID showing current status timeline.
  - `Manage Addresses`: Add, edit, or delete shipping destinations.
  - `Logout`: Clears auth cookie/token, resets client state, redirects to home.
  - `Delete Account`: Confirmation modal with password prompt; permanently purges personal data while anonymizing historical order transactions for legal accounting compliance.

### Module 15: Protected Admin Section & Operations Panel (Complete Touchpoint Governance)
- **Access & Security:**
  - Dedicated administrative modal and secure route guarded by `requireAuth` and `requireAdmin` middleware.
  - Strict RBAC restriction: Administrative accounts are strictly blocked from placing retail customer purchases (returns HTTP `403 Forbidden` on backend and displays locked checkout button with warning in frontend).
  - Fast 1-Click Demo Login (`admin@eshop.com`) provided for immediate access.
- **Admin Navigation Sidebar:**
  - Persistent left sidebar with fast switching buttons: Executive Overview, Orders (10 / page), Catalog Inventory, Categories & Deals, Hero Banners, Promo Codes, Storefront Announcement & Settings, Customer Reviews Moderation, Customer Accounts, Broadcast Deals, and Analytics & Reports.
- **Complete Administrative Touchpoint Control Suite:**
  - **1. Hero Promotional Posters Carousel (`/api/admin/banners`):**
    - View, add, edit, and delete auto-swiping hero posters.
    - Set headline, subtitle, promotional discount tag (e.g., `FLAT 50% OFF`), target category/product slug, and image URL with live interactive preview.
    - Real-time updates automatically broadcast to customer landing pages.
  - **2. Curated Categories & Visual Deal Tags (`/api/admin/categories`):**
    - Control all visual category boxes displayed in the customer header dropdown and landing page strip.
    - Edit category name, URL slug, thumbnail image, and promotional discount tags (e.g., changing `Up to 50% Off` to `Flat 70% Mega Deal`).
    - Delete categories or adjust display order.
  - **3. Promotional Discount Promo Codes (`/api/admin/coupons`):**
    - Generate custom discount promo codes with percentage discount, minimum order value, maximum discount cap, and expiry date.
    - Customer applies code in CartDrawer to receive instant mathematical discount on subtotal.
  - **4. Storefront Announcement Ticker & Settings (`/api/admin/settings`):**
    - Directly customize top announcement ticker text shown to all visitors.
    - Set featured active promo code hint prominently displayed in the ticker.
    - Configure dynamic free delivery minimum order threshold (e.g. ₹499, ₹699) and standard shipping fee.
    - Configure concierge support phone and email.
    - Real-time live preview box in Admin Portal mirrors customer storefront.
  - **5. Catalog Products, Pricing & Uniform 224px Images (`/api/admin/products`):**
    - Full CRUD over store products: name, brand, department, original price, discounted price, stock count, description, and specifications.
    - Image normalization guarantees uniform 224px visual presentation across catalog and landing page.
  - **6. Customer Review Moderation & Rating Integrity (`/api/admin/reviews`):**
    - Audit all customer reviews across the platform with star ratings, reviewer identity, comments, and verified buyer badges.
    - One-click deletion of inappropriate or spam reviews, with automatic recalculation of product average rating and count.
  - **7. 10-Per-Page Paginated Order Management (`/api/admin/orders`):**
    - High-density table displaying exactly 10 orders per page with Next / Previous pagination controls.
    - One-click order status transitions: `Accept`, `Reject`, `Mark Shipped`, `Mark Out for Delivery`, and `Mark Delivered`.
    - One-click CSV export of order settlements and payment modes.
  - **8. Real-Time WebSocket Flash Deals Broadcasting (`/api/admin/notifications/broadcast`):**
    - Input title, message, deal badge tag, and target URL to push live animated alerts to all active customer sessions simultaneously.
  - **9. Customer Accounts Governance (`/api/admin/users`):**
    - View customer details, registration date, and username. Deactivate and anonymize accounts while maintaining financial ledger integrity.

### Module 16: Sticky Glassmorphism AI Search & Personal Shopping Concierge
- **Floating UI Aesthetic:**
  - Positioned at the bottom-center of the viewport (`fixed bottom-6 left-1/2 -translate-x-1/2`).
  - Sleek frosted glass design (`backdrop-filter: blur(16px); background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(255, 255, 255, 0.15)`).
  - Remains pinned to the bottom during scrolling.
- **Conversational Concierge Capabilities:**
  - Expandable chat drawer allowing natural conversational inquiries:
    - *"Find me a gaming laptop under ₹75,000 with 16GB RAM."*
    - *"What running shoes do you have on sale right now?"*
  - The Gemini API matches buyer intent against active products in the database and embeds direct, interactive product cards within the conversation stream. Clicking any suggested card navigates straight to the product details page.
  - **Isolated Context:** Each user’s chat history is saved against their authenticated `userId`, ensuring conversation memory persists across browser refreshes without leaking into other accounts.

---

## 5. Non-Functional Requirements

### Performance & Core Web Vitals
- **LCP (Largest Contentful Paint):** <= 1.5 seconds on 4G connections. Optimized via Next.js `<Image>` component with AVIF/WebP formats, priority loading for the first hero banner, and responsive sizing.
- **INP (Interaction to Next Paint):** <= 100ms. All dropdowns, sliders, and button states trigger non-blocking micro-tasks.
- **CLS (Cumulative Layout Shift):** <= 0.05. Explicit aspect ratios on all carousel images, card thumbnails, and ad banners.
- **API Response Times:** 95th percentile (P95) latency < 180ms for catalog queries; < 800ms for AI streaming responses.

### Accessibility (a11y)
- Target: **WCAG 2.1 Level AA Compliance**.
- High contrast color ratios (minimum 4.5:1 for body text, 3:1 for large headers).
- Full keyboard navigability (`Tab`, `Shift+Tab`, `Enter`, `Escape`) across modals, dropdowns, and carousels.
- Proper ARIA attributes: `aria-expanded` on category dropdowns, `aria-live="polite"` on cart count updates, `role="region"` on carousels.

### Reliability, Availability & Fault Tolerance
- **Uptime Target:** 99.9% availability.
- **Graceful Fallbacks:** If the Gemini API experiences network interruption, the AI search bar degrades gracefully to full-text database fuzzy search.
- **Database Connection Pooling:** Managed via Prisma connection pooling / PgBouncer to prevent connection exhaustion.

### Browser & Device Compatibility
- Tested and optimized across:
  - Chrome / Chromium (v110+)
  - Safari & Mobile Safari (iOS 15+)
  - Firefox (v115+)
  - Microsoft Edge (v110+)
- Fluid responsive layouts across Mobile (360px–639px), Tablet (640px–1023px), Desktop (1024px–1439px), and Ultra-wide (1440px+).

### Localization & Currency Standards
- **Currency:** Indian Rupee (`₹` / INR) formatted according to Indian numbering system (e.g., `₹1,49,999.00`). Configurable via internationalization utilities.
- **Timezone:** Indian Standard Time (IST - UTC+5:30) for order timestamps, invoice generation, and deal countdowns.

---

## 6. UX/UI Requirements & Design System

### Information Architecture & Sitemap

```mermaid
graph TD
    Home["Landing Page (/)"] --> CategoryNav["Category Dropdown"]
    Home --> HeroBanner["Auto-Swipe Banner Carousel"]
    Home --> TopCats["Category Chips + Discount Button"]
    Home --> AIRecGrid["AI Recommendations (3x4 Grid)"]
    Home --> Web3Footer["Web3 Canvas Footer Animation"]
    
    Home --> Catalog["Catalog / Search Page (/products)"]
    Catalog --> SidebarFilters["Left Sidebar Filters (Price, Cat, Rating)"]
    Catalog --> ProductCard["Product Cards (3D Hover, Heart, Inline Qty)"]
    ProductCard --> ProductDetail["Product Detail Page (/product/[id]) - New Tab"]
    
    ProductDetail --> Gallery["6-Sec Auto-Slide Image Gallery"]
    ProductDetail --> Pincode["Pincode 560035 Delivery Calculator"]
    ProductDetail --> Reviews["Verified-Only Customer Reviews"]
    
    Home --> Cart["Cart Page (/cart)"]
    Cart --> AddressSelect["Top Address Selector"]
    Cart --> PromoEngine["Admin Promo Code Validator"]
    Cart --> Checkout["Checkout & Payment Gateway (/checkout)"]
    Checkout --> Confirmation["Order Placed + PDF Invoice Download"]
    
    Home --> Account["Account Section (/account)"]
    Account --> Profile["Profile & Random Avatar"]
    Account --> Orders["My Orders & PDF Invoices"]
    Account --> TrackOrder["5-Step Visual Track Order"]
    
    Home --> GlassAI["Sticky Glassmorphism AI Assistant (Bottom-Center)"]
    Home --> Notifications["Notifications Drawer (Right-Swipe Dismiss)"]
    
    AdminLogin["Admin Login (/admin/login)"] --> AdminPanel["Protected Admin Suite (/admin/dashboard)"]
    AdminPanel --> AdminProducts["Product & Stock CRUD"]
    AdminPanel --> AdminOrders["Paginated Orders (10/Page - Accept/Reject/Ship)"]
    AdminPanel --> AdminCoupons["Coupon Code Generator"]
    AdminPanel --> AdminUsers["User Governance & Deletion"]
```

### Design Tokens & Theming
- **Primary Color Palette:**
  - Brand Deep Blue: `#0F172A` (Slate 900)
  - Brand Electric Indigo: `#4F46E5` (Indigo 600)
  - Brand Accent Amber / Discount Orange: `#F59E0B` / `#EA580C`
  - Success Green: `#10B981` (Emerald 500)
  - Warning Red / Strikethrough: `#EF4444` (Rose 500)
  - Background Light: `#F8FAFC` (Slate 50)
  - Card Surface: `#FFFFFF`
  - Glass Surface: `rgba(15, 23, 42, 0.75)` with `backdrop-filter: blur(16px)`
- **Typography:**
  - Primary Font: `'Inter', sans-serif`
  - Heading Font: `'Outfit', 'Plus Jakarta Sans', sans-serif`
  - Monospace (Codes & Invoices): `'JetBrains Mono', monospace`
- **Elevation & Shadows:**
  - Card Rest: `0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)`
  - Card 3D Hover: `0 20px 25px -5px rgba(0,0,0,0.12), 0 8px 10px -6px rgba(0,0,0,0.08), 0 0 0 1px rgba(79,70,229,0.1)`
  - Glass Float: `0 25px 50px -12px rgba(0,0,0,0.35)`

### Micro-Interactions & Animation Specs
- **Category Dropdown:** `translateY(-10px) -> translateY(0)` with `opacity: 0 -> 1` (Duration: 220ms, Easing: `cubic-bezier(0.16, 1, 0.3, 1)`).
- **Product Card Hover:** `transform: translateY(-8px) scale(1.02)` (Duration: 250ms ease-out).
- **Wishlist Heart Click:** Scale pulse `scale(1.3) -> scale(1.0)` with color fill transition (Duration: 300ms spring).
- **Notification Swipe:** Horizontal translate tracking finger/pointer, turning red beyond 80px, collapsing height upon release at > 120px.
- **Gallery Auto-Slide:** Left/right sliding cross-fade every 6000ms.

### Component States
- **Loading:** Shimmer skeleton cards mirroring exact product card dimensions.
- **Empty States:** Custom SVG illustrations for "Empty Cart", "No Products Found matching filters", and "No Notifications".
- **Error States:** Floating toast notifications with retry buttons for failed network calls.

---

## 7. Technical Architecture

### Tech Stack Selection & Justification

| Layer | Recommended Technology | Justification |
|---|---|---|
| **Framework** | **Next.js 15 (App Router)** | Full-stack unified framework; Server Components for ultra-fast catalog SSR & SEO; Route Handlers for robust APIs. |
| **Language** | **TypeScript 5.x** | End-to-end type safety between database schema, API contracts, and UI components. |
| **Styling** | **TailwindCSS v3.4 + Vanilla CSS** | Utility-first rapid styling combined with custom CSS for glassmorphism, 3D card perspectives, and animations. |
| **Database** | **PostgreSQL 16** | Robust relational database ensuring ACID compliance for critical order, inventory, and payment transactions. |
| **ORM** | **Prisma ORM** | Type-safe query building, seamless migrations, and declarative relational data modeling. |
| **AI Engine** | **Google Gemini 2.5 Flash API** | Ultra-low latency, intelligent structured product matching, and cost-effective natural language chat. |
| **Animation & Web3** | **Framer Motion + Three.js / HTML5 Canvas** | Fluid layout transitions, touch gesture handling, and lightweight Web3 interactive particle mesh rendering. |
| **Invoicing** | **`@react-pdf/renderer` & `jspdf`** | Vector-sharp, downloadable PDF invoice generation with dynamic tables and barcodes. |
| **Authentication** | **JWT + HttpOnly Cookies + Bcrypt** | Stateless, tamper-proof user sessions with multi-identifier login and OTP verification. |
| **Email / SMS** | **Nodemailer / Resend SMTP** | Reliable transmission of OTP codes and order confirmation notifications. |

### System Architecture Diagram

> 📊 **Visual Architecture Navigator & Interactive Explorer Available:**  
> - 📄 **Complete Flow Specifications:** Read [ARCHITECTURE.md](file:///c:/Users/WIN%2011/Desktop/E%20commerce/E_Shop/ARCHITECTURE.md) for sequence flows and state machines.  
> - 🖥️ **Interactive Architecture Dashboard:** Open [architecture-diagram.html](file:///c:/Users/WIN%2011/Desktop/E%20commerce/E_Shop/architecture-diagram.html) in your browser for zoomable, tabbed visual exploration.  
> - 🖼️ **High-Resolution Architecture Infographic:** View [architecture-diagram.jpg](file:///c:/Users/WIN%2011/Desktop/E%20commerce/E_Shop/architecture-diagram.jpg).

![Modern E-Shop Platform Architecture](architecture-diagram.jpg)

```mermaid
flowchart TB
    subgraph ClientLayer ["Client Layer (Browser)"]
        Landing["Landing Page & Hero Carousel"]
        CatalogView["Catalog & Left Sidebar Filters"]
        ProductView["Product Detail (6s Auto-Gallery)"]
        CartCheckout["Cart & Checkout + Promo Engine"]
        AccountView["Account & 5-Step Order Tracking"]
        GlassAssistant["Sticky Glassmorphism AI Assistant"]
        Web3Canvas["Web3 Canvas Particle Animation"]
        AdminDashboard["Protected Admin Portal (/admin)"]
    end

    subgraph EdgeAndRouting ["Routing & Middleware Layer"]
        NextRouter["Next.js App Router"]
        AuthMiddleware["JWT & RBAC Middleware"]
        RateLimiter["Rate Limiting & Security Headers"]
    end

    subgraph ServerLayer ["Server Layer (Next.js Route Handlers)"]
        AuthService["Auth & OTP Service (Gmail / SMS)"]
        ProductService["Product & Category Service"]
        PincodeService["Pincode Distance Estimator"]
        OrderService["Order & Tracking Service"]
        InvoiceService["PDF Invoice Engine"]
        ReviewService["Verified Review Service"]
        CouponService["Coupon & Discount Service"]
        NotificationService["Real-Time Notification Service (SSE)"]
        AIService["AI Shopping Concierge (Gemini API)"]
    end

    subgraph DataAndExternal ["Data & External Services Layer"]
        PostgresDB[(PostgreSQL Primary DB via Prisma)]
        GeminiAPI["Google Gemini 2.5 Flash Model"]
        EmailService["Nodemailer / Resend SMTP"]
        CloudStorage["Cloudinary / S3 Image Storage"]
    end

    ClientLayer --> EdgeAndRouting
    EdgeAndRouting --> ServerLayer
    ServerLayer --> PostgresDB
    AIService --> GeminiAPI
    AuthService --> EmailService
    ProductService --> CloudStorage
    InvoiceService --> PostgresDB
```

### Frontend & Client State Architecture
- **State Management:**
  - `useCartStore` (Zustand): Persistent cart state synced with `localStorage` for guests and synced with PostgreSQL for logged-in accounts.
  - `useWishlistStore` (Zustand): Rapid toggling with optimistic UI updates.
  - `useAIStore` (Zustand): Per-user message history, open/minimized state, and active product card recommendations.
  - `useNotificationStore`: In-memory and SSE-fed notification drawer with swipe-to-dismiss handlers.

### Backend & API Architecture
- Clean modular design organized inside `app/api/*`:
  - `auth/`: Login, Register, Verify-OTP, Forgot-Password, Refresh, Logout.
  - `products/`: List, Filter, GetById, Recommendations (3×4 grid).
  - `pincode/`: Geo-distance & delivery arrival computation.
  - `cart/`: Add, Update, Remove, Sync.
  - `coupons/`: Validate, Apply.
  - `orders/`: Create, GetHistory, GetTracking, Cancel, UpdateAddress, GenerateInvoice.
  - `reviews/`: ListByProduct, Submit (verified buyer check).
  - `notifications/`: Broadcast (admin), List, Dismiss.
  - `ai/chat`: Streamed natural language chat with tool-calling for catalog search.
  - `admin/`: Product CRUD, Order state transitions, User deletion, Analytics summary.

### AI Concierge Architecture with Gemini API
- Utilizes Google Gemini 2.5 Flash through the official `@google/genai` SDK.
- **Workflow:**
  1. User enters natural language request in the sticky glass bar.
  2. Next.js Route Handler retrieves authenticated `userId` and loads past 10 message turns.
  3. Gemini is prompted with system instructions describing E-Shop's active product catalog categories and schema.
  4. Model invokes a structured tool `searchProducts(query, category, maxPrice)` which executes a filtered database lookup.
  5. The assistant returns conversational advice alongside structured product JSON cards.
  6. Client renders product cards with direct click-through links.

### Real-Time Event Architecture (SSE)
- A Server-Sent Events (SSE) stream at `/api/notifications/stream` maintains an open HTTP connection for authenticated users.
- When an admin triggers a deal broadcast, the server writes an SSE event `deal-alert`, immediately popping a toast on all active clients and updating the notification bell badge.

---

## 8. Database Design & Data Models

### Entity Relationship Diagram (Mermaid ERD)

```mermaid
erDiagram
    User ||--o{ Order : places
    User ||--o{ Review : writes
    User ||--o{ Address : saves
    User ||--o{ CartItem : holds
    User ||--o{ WishlistItem : saves
    User ||--o{ AIChatSession : owns
    User ||--o{ UserNotification : receives

    Category ||--o{ Product : categorizes
    Product ||--o{ ProductImage : contains
    Product ||--o{ Review : receives
    Product ||--o{ OrderItem : includes
    Product ||--o{ CartItem : referenced_in
    Product ||--o{ WishlistItem : referenced_in

    Order ||--|{ OrderItem : contains
    Order ||--|| Address : delivers_to
    Order ||--o| Coupon : applies

    Coupon ||--o{ Order : discounts
    Notification ||--o{ UserNotification : broadcasts

    User {
        string id PK
        string name
        string username UK
        string email UK
        string phone UK
        string passwordHash
        string role "CUSTOMER | ADMIN"
        string avatarUrl
        boolean isEmailVerified
        boolean isPhoneVerified
        string otpCode
        datetime otpExpiresAt
        datetime createdAt
        datetime updatedAt
    }

    Product {
        string id PK
        string title
        string slug UK
        string description
        decimal originalPrice
        decimal discountedPrice
        int discountPercent
        int stockQuantity
        string categoryId FK
        float ratingAverage
        int reviewCount
        boolean isFeatured
        json specifications
        datetime createdAt
        datetime updatedAt
    }

    ProductImage {
        string id PK
        string productId FK
        string imageUrl
        int sortOrder
        boolean isPrimary
    }

    Order {
        string id PK
        string invoiceNumber UK
        string userId FK
        string addressId FK
        string couponId FK
        decimal subtotalAmount
        decimal discountAmount
        decimal shippingFee
        decimal taxAmount
        decimal totalAmount
        string paymentMethod "CARD | UPI | NETBANKING | COD"
        string paymentStatus "PENDING | PAID | FAILED"
        string orderStatus "ORDER_PLACED | CONFIRMED | SHIPPED | OUT_FOR_DELIVERY | DELIVERED | CANCELLED"
        datetime createdAt
        datetime updatedAt
    }

    OrderItem {
        string id PK
        string orderId FK
        string productId FK
        int quantity
        decimal unitPrice
        decimal totalPrice
    }

    Address {
        string id PK
        string userId FK
        string fullName
        string phone
        string addressLine1
        string addressLine2
        string city
        string state
        string pincode
        boolean isDefault
    }

    Review {
        string id PK
        string productId FK
        string userId FK
        int rating
        string title
        string comment
        boolean isVerifiedPurchase
        datetime createdAt
    }

    Coupon {
        string id PK
        string code UK
        int discountPercentage
        decimal minOrderValue
        int maxUsageLimit
        int currentUsageCount
        datetime expiresAt
        boolean isActive
    }

    Notification {
        string id PK
        string title
        string message
        string targetUrl
        datetime createdAt
    }

    UserNotification {
        string id PK
        string notificationId FK
        string userId FK
        boolean isDismissed
        datetime dismissedAt
    }
```

### Database Schemas & Data Dictionary (Prisma Schema)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  CUSTOMER
  ADMIN
}

enum OrderStatus {
  ORDER_PLACED
  CONFIRMED
  SHIPPED
  OUT_FOR_DELIVERY
  DELIVERED
  CANCELLED
}

enum PaymentMethod {
  CARD
  UPI
  NETBANKING
  COD
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
}

model User {
  id               String             @id @default(cuid())
  name             String
  username         String             @unique
  email            String             @unique
  phone            String             @unique
  passwordHash     String
  role             Role               @default(CUSTOMER)
  avatarUrl        String
  isEmailVerified  Boolean            @default(false)
  isPhoneVerified  Boolean            @default(false)
  otpCode          String?
  otpExpiresAt     DateTime?
  orders           Order[]
  reviews          Review[]
  addresses        Address[]
  cartItems        CartItem[]
  wishlist         WishlistItem[]
  chatSessions     AIChatSession[]
  notifications    UserNotification[]
  createdAt        DateTime           @default(now())
  updatedAt        DateTime           @updatedAt

  @@index([email])
  @@index([phone])
  @@index([username])
}

model Category {
  id          String    @id @default(cuid())
  name        String    @unique
  slug        String    @unique
  imageUrl    String
  products    Product[]
  createdAt   DateTime  @default(now())
}

model Product {
  id              String         @id @default(cuid())
  title           String
  slug            String         @unique
  description     String
  originalPrice   Decimal        @db.Decimal(10, 2)
  discountedPrice Decimal        @db.Decimal(10, 2)
  discountPercent Int
  stockQuantity   Int            @default(0)
  categoryId      String
  category        Category       @relation(fields: [categoryId], references: [id])
  images          ProductImage[]
  reviews         Review[]
  orderItems      OrderItem[]
  cartItems       CartItem[]
  wishlistItems   WishlistItem[]
  ratingAverage   Float          @default(0.0)
  reviewCount     Int            @default(0)
  isFeatured      Boolean        @default(false)
  specifications  Json?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  @@index([categoryId])
  @@index([discountedPrice])
  @@index([ratingAverage])
}

model ProductImage {
  id        String   @id @default(cuid())
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  imageUrl  String
  sortOrder Int      @default(0)
  isPrimary Boolean  @default(false)

  @@index([productId])
}

model Address {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  fullName     String
  phone        String
  addressLine1 String
  addressLine2 String?
  city         String
  state        String
  pincode      String
  isDefault    Boolean  @default(false)
  orders       Order[]
  createdAt    DateTime @default(now())

  @@index([userId])
}

model Order {
  id              String        @id @default(cuid())
  invoiceNumber   String        @unique
  userId          String
  user            User          @relation(fields: [userId], references: [id])
  addressId       String
  address         Address       @relation(fields: [addressId], references: [id])
  couponId        String?
  coupon          Coupon?       @relation(fields: [couponId], references: [id])
  subtotalAmount  Decimal       @db.Decimal(10, 2)
  discountAmount  Decimal       @db.Decimal(10, 2) @default(0.00)
  shippingFee     Decimal       @db.Decimal(10, 2) @default(0.00)
  taxAmount       Decimal       @db.Decimal(10, 2) @default(0.00)
  totalAmount     Decimal       @db.Decimal(10, 2)
  paymentMethod   PaymentMethod
  paymentStatus   PaymentStatus @default(PENDING)
  orderStatus     OrderStatus   @default(ORDER_PLACED)
  items           OrderItem[]
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([userId])
  @@index([orderStatus])
  @@index([createdAt])
}

model OrderItem {
  id         String   @id @default(cuid())
  orderId    String
  order      Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId  String
  product    Product  @relation(fields: [productId], references: [id])
  quantity   Int
  unitPrice  Decimal  @db.Decimal(10, 2)
  totalPrice Decimal  @db.Decimal(10, 2)

  @@index([orderId])
}

model Review {
  id                 String   @id @default(cuid())
  productId          String
  product            Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  userId             String
  user               User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  rating             Int
  title              String
  comment            String
  isVerifiedPurchase Boolean  @default(false)
  createdAt          DateTime @default(now())

  @@index([productId])
  @@index([userId])
}

model CartItem {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  quantity  Int      @default(1)
  createdAt DateTime @default(now())

  @@unique([userId, productId])
}

model WishlistItem {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([userId, productId])
}

model Coupon {
  id                 String    @id @default(cuid())
  code               String    @unique
  discountPercentage Int
  minOrderValue      Decimal   @db.Decimal(10, 2) @default(0.00)
  maxUsageLimit      Int       @default(100)
  currentUsageCount  Int       @default(0)
  expiresAt          DateTime
  isActive           Boolean   @default(true)
  orders             Order[]
  createdAt          DateTime  @default(now())
}

model Notification {
  id          String             @id @default(cuid())
  title       String
  message     String
  targetUrl   String?
  createdAt   DateTime           @default(now())
  recipients  UserNotification[]
}

model UserNotification {
  id             String       @id @default(cuid())
  notificationId String
  notification   Notification @relation(fields: [notificationId], references: [id], onDelete: Cascade)
  userId         String
  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  isDismissed    Boolean      @default(false)
  dismissedAt    DateTime?

  @@unique([notificationId, userId])
}

model AIChatSession {
  id        String          @id @default(cuid())
  userId    String
  user      User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages  AIChatMessage[]
  createdAt DateTime        @default(now())
  updatedAt DateTime        @updatedAt

  @@index([userId])
}

model AIChatMessage {
  id        String        @id @default(cuid())
  sessionId String
  session   AIChatSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  sender    String        // "user" | "model"
  content   String
  metadata  Json?         // Stores recommended product IDs & cards
  createdAt DateTime      @default(now())

  @@index([sessionId])
}
```

---

## 9. API Specification

### RESTful Endpoints Matrix

| Module | Method | Endpoint | Auth Required | Description |
|---|:---:|---|:---:|---|
| **Auth** | `POST` | `/api/auth/register` | None | Register user; triggers email/phone OTP |
| **Auth** | `POST` | `/api/auth/verify-otp` | None | Validates OTP and activates account |
| **Auth** | `POST` | `/api/auth/login` | None | Multi-identifier login (Password or OTP) |
| **Auth** | `POST` | `/api/auth/forgot-password`| None | Dispatches password reset OTP |
| **Auth** | `POST` | `/api/auth/reset-password` | None | Sets new password with valid OTP |
| **Auth** | `GET` | `/api/auth/me` | Customer | Returns authenticated user profile |
| **Auth** | `POST` | `/api/auth/logout` | Customer | Clears authentication token |
| **Catalog** | `GET` | `/api/products` | None | Paginated, filtered & sorted product list |
| **Catalog** | `GET` | `/api/products/[slug]` | None | Full product details with gallery & specs |
| **Catalog** | `GET` | `/api/products/recommendations` | Optional | Returns 12 personalized products (3×4 grid)|
| **Catalog** | `GET` | `/api/categories` | None | Returns all active category cards & images |
| **Delivery**| `POST` | `/api/pincode/estimate` | None | Computes transit time & shipping fee from 560035 |
| **Cart** | `GET` | `/api/cart` | Customer | Retrieves user cart with live totals |
| **Cart** | `POST` | `/api/cart/add` | Customer | Adds product or increments quantity |
| **Cart** | `PATCH`| `/api/cart/item/[id]` | Customer | Modifies quantity (1–10) |
| **Cart** | `DELETE`| `/api/cart/item/[id]` | Customer | Removes item from cart |
| **Coupons** | `POST` | `/api/coupons/validate` | Customer | Verifies code and computes savings |
| **Orders** | `POST` | `/api/orders/checkout` | Customer | Places order & creates invoice record |
| **Orders** | `GET` | `/api/orders/history` | Customer | Returns past order list |
| **Orders** | `GET` | `/api/orders/[id]/track`| Customer | Returns 5-step visual tracking status |
| **Orders** | `PATCH`| `/api/orders/[id]/address`| Customer | Modifies address (locked if out-for-delivery)|
| **Orders** | `POST` | `/api/orders/[id]/cancel` | Customer | Cancels order (locked if out-for-delivery) |
| **Invoice** | `GET` | `/api/orders/[id]/invoice`| Customer | Generates and downloads PDF invoice |
| **Reviews** | `GET` | `/api/reviews/[productId]`| None | Retrieves verified reviews & rating breakdown |
| **Reviews** | `POST` | `/api/reviews` | Customer | Submits review (verified purchaser only) |
| **Notify** | `GET` | `/api/notifications` | Customer | Fetches broadcast deal notifications |
| **Notify** | `DELETE`| `/api/notifications/[id]`| Customer | Dismisses notification (swipe-to-dismiss) |
| **AI** | `POST` | `/api/ai/chat` | Customer | Conversational AI concierge with product cards |
| **Admin** | `GET` | `/api/admin/dashboard` | Admin | Overall KPIs: sales, stock alerts, activity |
| **Admin** | `GET` | `/api/admin/orders` | Admin | 10-per-page paginated order list |
| **Admin** | `PATCH`| `/api/admin/orders/[id]/status`| Admin | State transitions (Accept, Reject, Ship, Deliver) |
| **Admin** | `POST` | `/api/admin/products` | Admin | Creates new product with image gallery |
| **Admin** | `PUT` | `/api/admin/products/[id]`| Admin | Updates existing product and stock levels |
| **Admin** | `DELETE`| `/api/admin/products/[id]`| Admin | Deletes product |
| **Admin** | `POST` | `/api/admin/coupons` | Admin | Generates new discount promo code |
| **Admin** | `POST` | `/api/admin/notifications` | Admin | Broadcasts flash deal notification to all users |
| **Admin** | `DELETE`| `/api/admin/users/[id]` | Admin | Deactivates or removes customer account |

### Sample Request & Response JSON Shapes

#### 1. Delivery Estimate Request & Response
```json
// POST /api/pincode/estimate
// Request:
{
  "pincode": "560035",
  "cartSubtotal": 1499.00
}

// Response (200 OK):
{
  "success": true,
  "data": {
    "pincode": "560035",
    "city": "Bengaluru",
    "state": "Karnataka",
    "hubOrigin": "560001 (Bengaluru Central)",
    "distanceKm": 14.2,
    "estimatedDays": 1,
    "deliveryDate": "2026-10-02T21:00:00.000Z",
    "deliveryFormatted": "Tomorrow by 9:00 PM",
    "shippingFee": 0.00,
    "isFreeDelivery": true,
    "isCodAvailable": true
  }
}
```

#### 2. AI Shopping Concierge Stream Request & Response
```json
// POST /api/ai/chat
// Request:
{
  "message": "I'm looking for a premium noise-canceling headphone for flights under ₹15,000.",
  "sessionId": "cs_cm123xyz"
}

// Response (200 OK):
{
  "success": true,
  "reply": "I found 2 top-rated active noise-canceling headphones in our catalog under your ₹15,000 budget! The Sony WH-CH720N offers exceptional 35-hour battery life and dual noise sensor tech, currently on a 30% discount.",
  "recommendedProducts": [
    {
      "id": "prod_sony720",
      "title": "Sony WH-CH720N Wireless Over-Ear NC Headphones",
      "slug": "sony-wh-ch720n-wireless-headphones",
      "imageUrl": "/images/products/sony-720.webp",
      "originalPrice": 14990.00,
      "discountedPrice": 9990.00,
      "discountPercent": 33,
      "ratingAverage": 4.6,
      "inStock": true
    }
  ]
}
```

#### 3. Invoice Generation Response
```json
// GET /api/orders/ord_98765/invoice
// Response Headers:
// Content-Type: application/pdf
// Content-Disposition: attachment; filename="E-Shop_Invoice_INV-20261001-09876.pdf"
```

---

## 10. Security and Privacy

### Authentication & JWT Lifecycle
- **Session Tokens:** Stateless JSON Web Tokens (JWT) signed with `HS256` using a 512-bit private secret.
- **Storage:** Persisted exclusively in HTTP-only, `SameSite=Lax`, `Secure` cookies to thwart Cross-Site Scripting (XSS) extraction.
- **Token Expiry:** Access token expires in 15 minutes; refresh token rotated every 7 days.
- **Admin Verification:** Route handlers accessing `/api/admin/*` decrypt the JWT, verify `role === 'ADMIN'`, and confirm against database records to prevent stale privileges.

### Password & OTP Security
- **Hashing:** Passwords hashed with `bcryptjs` using a cost salt factor of 12.
- **Strength Validation:** Mandatory minimum 8 characters, requiring uppercase, lowercase, numbers, and symbols.
- **OTP Safeguards:**
  - 6-digit cryptographically secure numeric OTP (`crypto.randomInt(100000, 999999)`).
  - Short validity window: exactly 10 minutes (`otpExpiresAt`).
  - Rate limited to maximum 3 attempts per phone/email every 15 minutes to prevent brute-force attacks.

### OWASP Top 10 Mitigation
- **Injection:** Prisma ORM employs parameterized SQL queries natively, preventing SQL Injection.
- **Cross-Site Scripting (XSS):** React 19 / Next.js auto-escapes rendered text. HTML descriptions in specifications are sanitized using `DOMPurify`.
- **Cross-Site Request Forgery (CSRF):** HttpOnly cookies coupled with custom header validation (`X-Requested-With`) and strict CORS policies.
- **Rate Limiting:** IP and user-based token bucket rate limiting (100 requests per minute for public APIs; 10 requests per minute for auth and AI endpoints) via edge middleware.

### Order Modification Race Condition Protection
- Cancellation and address alterations execute within atomic PostgreSQL transactions (`prisma.$transaction`).
- The transaction verifies that `orderStatus` is strictly in `('ORDER_PLACED', 'CONFIRMED', 'SHIPPED')` before writing updates. If the order has transitioned to `OUT_FOR_DELIVERY`, the transaction rolls back immediately with HTTP 409 Conflict.

---

## 11. Development Plan & Directory Structure

### Repository Directory Tree

```
E_Shop/
├── .env.example
├── .gitignore
├── README.md                              # This single definitive architecture & guide
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── next.config.ts
├── prisma/
│   ├── schema.prisma                      # Complete relational schema
│   └── seed.ts                            # Seed script with default products, categories & admin
├── public/
│   ├── favicon.ico
│   ├── images/
│   │   ├── banners/                       # Auto-swipe discount hero posters
│   │   ├── categories/                    # Category box thumbnails
│   │   ├── avatars/                       # 10 random account vectors
│   │   └── products/                      # High-res product images
│   └── icons/
├── src/
│   ├── app/
│   │   ├── layout.tsx                     # Root layout, fonts, sticky glass AI container
│   │   ├── page.tsx                       # Landing page (Banners, Categories, 3x4 AI grid, Web3)
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx             # Multi-option login (Email/Phone/User + OTP/Password)
│   │   │   └── register/page.tsx          # Signup with live password meter & OTP
│   │   ├── products/
│   │   │   └── page.tsx                   # Catalog page with left sidebar filters & multi-sort
│   │   ├── product/
│   │   │   └── [slug]/page.tsx            # Product details (6s auto-slide gallery, reviews, pincode)
│   │   ├── cart/page.tsx                  # Cart drawer/page with top address selector & promo engine
│   │   ├── checkout/page.tsx              # Multi-step checkout & payment
│   │   ├── account/
│   │   │   ├── profile/page.tsx           # Profile info & random avatar
│   │   │   ├── orders/page.tsx            # Order history with downloadable PDF invoices
│   │   │   └── track/[id]/page.tsx        # 5-step visual tracking with address edit & cancellation
│   │   ├── admin/
│   │   │   ├── layout.tsx                 # Protected admin layout with persistent left navigation
│   │   │   ├── login/page.tsx             # Dedicated admin login route
│   │   │   ├── dashboard/page.tsx         # Executive KPI summary & sales charts
│   │   │   ├── products/page.tsx          # Full product & stock inventory CRUD
│   │   │   ├── orders/page.tsx            # 10-per-page paginated order fulfillment table
│   │   │   ├── coupons/page.tsx           # Discount promo code generation engine
│   │   │   ├── notifications/page.tsx     # Broadcast deal alerts to customers
│   │   │   └── users/page.tsx             # User management & account deletion
│   │   └── api/
│   │       ├── auth/                      # Login, Register, Verify-OTP, Reset-Password
│   │       ├── products/                  # Catalog, Recommendations (3x4 grid)
│   │       ├── pincode/                   # Distance & delivery calculation
│   │       ├── cart/                      # Cart operations
│   │       ├── coupons/                   # Coupon validation
│   │       ├── orders/                    # Orders, Tracking, Cancellation, Invoicing
│   │       ├── reviews/                   # Verified purchaser reviews
│   │       ├── notifications/             # Broadcast & swipe-to-dismiss
│   │       ├── ai/chat/                   # Gemini 2.5 Flash shopping concierge
│   │       └── admin/                     # Admin CRUD, KPIs, order transitions
│   ├── components/
│   │   ├── navigation/
│   │   │   ├── Navbar.tsx                 # Top bar, animated dropdown, logo, wishlist/cart badges
│   │   │   ├── AnimatedCategoryDrop.tsx   # Staggered animated dropdown menu
│   │   │   └── SearchBar.tsx              # Top bar smart search input
│   │   ├── home/
│   │   │   ├── AutoBannerCarousel.tsx     # Left-to-right auto-sliding discount posters
│   │   │   ├── CategoryStrip.tsx          # Category boxes + pulsating Mega Discount button
│   │   │   ├── AIRecGrid.tsx              # 3x4 (12 items) personalized product grid
│   │   │   └── Web3CanvasFooter.tsx       # Interactive Web3 canvas particle network
│   │   ├── product/
│   │   │   ├── ProductCard.tsx            # 3D pop-up hover card, wishlist heart, inline qty
│   │   │   ├── AutoSlideGallery.tsx       # Left thumbnail strip + 6-second auto-slide hero
│   │   │   ├── PincodeEstimator.tsx       # Indian pincode delivery calculator (default 560035)
│   │   │   └── VerifiedReviews.tsx        # Verified purchaser ratings & reviews
│   │   ├── cart/
│   │   │   ├── AddressSelector.tsx        # Top address selector above cart items
│   │   │   ├── CartItemList.tsx           # Cart item list with inline counters
│   │   │   └── PromoCouponInput.tsx       # Admin coupon code input & live calculation
│   │   ├── order/
│   │   │   ├── VisualOrderTracker.tsx     # 5-step interactive delivery stepper
│   │   │   └── InvoicePDFDocument.tsx     # Automated PDF invoice layout template
│   │   ├── notifications/
│   │   │   ├── NotificationDrawer.tsx     # Slide-over notification panel
│   │   │   └── SwipeableItem.tsx          # Right-swipe to dismiss gesture card
│   │   ├── ai/
│   │   │   └── StickyGlassAIAssistant.tsx # Floating bottom-center frosted glass concierge
│   │   └── ui/                            # Buttons, Dialogs, Sliders, Badges, Toast
│   ├── lib/
│   │   ├── prisma.ts                      # Global Prisma client instance
│   │   ├── auth.ts                        # JWT helpers, cookie setters, bcrypt utils
│   │   ├── pincodeDistance.ts             # Deterministic geo-distance calculator
│   │   ├── invoiceGenerator.ts            # PDF compilation & download utility
│   │   ├── gemini.ts                      # Google Gemini API client configuration
│   │   └── avatarPresets.ts               # 10 random avatar vector URLs & identifiers
│   ├── stores/
│   │   ├── cartStore.ts                   # Zustand cart store
│   │   ├── wishlistStore.ts               # Zustand wishlist store
│   │   ├── aiStore.ts                     # Zustand AI chat history store
│   │   └── notificationStore.ts           # Zustand notification state
│   └── types/
│       └── index.ts                       # Shared TypeScript interfaces
```

### Environment Variable Template (`.env.example`)

```bash
# ==============================================================================
# E-Shop — Environment Variables Template
# ==============================================================================

# Node Environment
NODE_ENV="development"
PORT=3000
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# PostgreSQL Database (via Prisma)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/eshop_db?schema=public"

# Authentication & Security
JWT_SECRET="eshop_super_secret_jwt_key_minimum_64_characters_long_for_security_12345"
JWT_EXPIRES_IN="7d"

# Google Gemini API (For Sticky Glass AI Shopping Concierge)
GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"

# Email Delivery (Gmail SMTP / Nodemailer for OTPs)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="eshop.notifications@gmail.com"
SMTP_PASS="your_gmail_app_password"
EMAIL_FROM="E-Shop <noreply@eshop.com>"

# Default Warehouse Pincode (Origin Hub for Distance Calculation)
ORIGIN_HUB_PINCODE="560001"
DEFAULT_CUSTOMER_PINCODE="560035"

# Initial Super Admin Credentials (for seed script)
INITIAL_ADMIN_EMAIL="admin@eshop.com"
INITIAL_ADMIN_PASSWORD="AdminPassword@123"
INITIAL_ADMIN_USERNAME="superadmin"
```

### Phased Implementation Roadmap
- **Phase 1: Project Scaffolding, Database & Auth Core**
  - Initialize Next.js 15 with TypeScript, TailwindCSS, and Prisma.
  - Implement Prisma schema, migrations, and seed script with mock products and categories.
  - Build multi-identifier auth (Email/Phone/Username), live password strength meter, Gmail OTP verification, and random avatar allocation.
- **Phase 2: Dynamic Landing Page, Navigation & Web3 Footer**
  - Build top navigation with animated category dropdown, search input, and reactive cart/wishlist counters.
  - Implement auto-swipe discount posters carousel (left-to-right auto sliding).
  - Create category strip with pulsating discount button, 3×4 AI recommendations grid, and the interactive Web3 particle canvas footer.
- **Phase 3: Catalog, Filters, Product Details & Delivery Estimator**
  - Implement left sidebar filters (price slider, categories, ratings) and multi-sort logic.
  - Construct 3D hover pop-up product cards with heart toggle and inline quantity adjusters.
  - Build dedicated product detail page with 6-second auto-slide gallery, specifications, and the default `560035` pincode delivery estimator.
- **Phase 4: Verified Reviews, Cart, Coupons & Invoicing**
  - Restrict product review submission strictly to verified purchasers.
  - Implement cart with top address selector and admin promo code engine.
  - Build checkout flow and automated downloadable PDF invoice generation.
- **Phase 5: Order Tracking, Customer Account & Notification Center**
  - Create 5-step visual tracking stepper with address update and order cancellation gates (locked at out-for-delivery).
  - Implement notification center with right-swipe to dismiss gesture.
  - Build customer account profile with avatar management.
- **Phase 6: Protected Admin Portal & Sticky Glass AI Concierge**
  - Implement hidden `/admin` portal with KPI metrics, product CRUD, 10-per-page paginated orders, and coupon creation.
  - Build the floating bottom-center sticky frosted glass AI concierge powered by Gemini 2.5 Flash with persistent per-user context.

---

## 12. Testing Strategy

### Testing Levels & Tools
- **Unit & Component Testing:** Vitest + React Testing Library for verifying pure functions (pincode distance, discount calculators, password strength) and isolated UI components (cart badge, 3D hover card).
- **API Integration Testing:** Supertest / Next.js test runner validating endpoint responses, auth token verification, OTP expiration, and database transactions.
- **End-to-End (E2E) Testing:** Playwright simulating real user journeys across desktop and mobile viewports.

### Critical Test Scenarios & Quality Gates
1. **Pincode Delivery Calculation:** Inputting `560035` returns correct city (*Bengaluru*), distance (*~14.2 km*), and formatted arrival (*Tomorrow by 9:00 PM*).
2. **Review Verification Gate:** Unauthenticated users or users who have not purchased the item are blocked with HTTP 403 when posting a review.
3. **Order Address Edit & Cancellation Gate:** Placing an order allows address modification and cancellation in `ORDER_PLACED`, `CONFIRMED`, and `SHIPPED` states. Attempting to modify or cancel when `orderStatus === 'OUT_FOR_DELIVERY'` returns HTTP 409 and disables the UI button.
4. **Swipe-to-Dismiss Gesture:** Dragging a notification card rightward past 120px successfully removes it from DOM and posts dismissal to `/api/notifications/[id]`.
5. **Admin Order Pagination:** Admin order list displays strictly 10 items per page with functioning Next/Previous buttons and correct total page count.
6. **AI Shopping Concierge:** Asking *"Find running shoes under ₹3000"* invokes Gemini tool calling and returns clickable product cards matching the criteria.

---

## 13. DevOps, Deployment & Infrastructure

### Containerization (Docker & Compose)

```dockerfile
# Production Dockerfile for E-Shop
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

FROM base AS dependencies
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

### CI/CD Pipeline (GitHub Actions)
- On pull request to `main`:
  1. Checkout repository & setup Node.js 20 LTS.
  2. Cache dependencies & run `npm ci`.
  3. Run TypeScript typecheck: `npm run type-check`.
  4. Run ESLint: `npm run lint`.
  5. Run unit & integration test suite: `npm run test`.
  6. Verify Prisma schema validity: `npx prisma validate`.
- On merge to `main`:
  1. Trigger automated deployment to Vercel / AWS ECS / Render.
  2. Run Prisma database migrations: `npx prisma migrate deploy`.
  3. Execute health check at `/api/health`.

### Cloud Hosting & Production Deployment
- **Frontend & Route Handlers:** Vercel Pro or AWS Amplify hosting Next.js standalone build with global Edge CDN caching.
- **Database:** Managed PostgreSQL on Supabase, AWS RDS, or Neon Serverless with automatic daily snapshots and connection pooling.
- **Object Storage:** Cloudinary or AWS S3 for product images and generated PDF invoice archives.
- **Monitoring & Error Tracking:** Sentry for frontend/backend runtime exceptions; Datadog or Vercel Analytics for Core Web Vitals telemetry.

---

## 14. Documentation Deliverables

- **Developer Setup Guide:**
  1. Clone repository: `git clone https://github.com/your-org/eshop.git`
  2. Install dependencies: `npm install`
  3. Configure environment: `cp .env.example .env` and insert valid `DATABASE_URL` and `GEMINI_API_KEY`.
  4. Run database migrations: `npx prisma migrate dev --name init`
  5. Seed database with mock products, categories & default admin: `npm run prisma:seed`
  6. Start development server: `npm run dev` (Access application at `http://localhost:3000`).
  7. Access Admin Portal at `http://localhost:3000/admin/login` (Email: `admin@eshop.com`, Password: `AdminPassword@123`).

---

## 15. Risks, Edge Cases & Mitigation

| Risk / Edge Case | Likelihood | Impact | Mitigation Strategy |
|---|:---:|:---:|---|
| **Pincode Lookup Failure** (Unknown or remote PIN code entered) | Medium | Low | Fallback to regional state distance matrix; displays standard delivery timeframe (5–7 days) with clear notice. |
| **Email OTP Delivery Delays** (SMTP server rate limit or queue) | Medium | High | Display resend countdown timer (60s); log OTP to console in development mode; support fallback phone OTP. |
| **Inventory Overselling Race Condition** (Simultaneous checkouts on last unit) | Low | High | Use database atomic decrement with SQL `WHERE stockQuantity >= qty` check within Prisma transaction. |
| **AI Hallucinations in Concierge** (Recommending unlisted products) | Medium | Medium | Strict Gemini system instructions constraining recommendations solely to catalog items returned by database search tools. |
| **Malicious Order Cancellation** (Canceling after truck dispatch) | Low | High | Strict state lock preventing cancellation once status transitions to `OUT_FOR_DELIVERY` or `DELIVERED`. |

---

## 16. AI Coding IDE Execution Prompts

*These tool-agnostic, self-contained implementation prompts are structured for incremental execution in AI coding environments (Cursor, Windsurf, Claude Code, Antigravity). Execute them in serial order.*

### Prompt 1: Project Setup, Database Schema & Database Seeding
```text
OBJECTIVE: Initialize the Next.js 15 project structure with TypeScript, TailwindCSS, Prisma ORM, and populate the database with comprehensive seed data.
RELEVANT FILES:
- package.json
- tsconfig.json
- tailwind.config.ts
- prisma/schema.prisma
- prisma/seed.ts
- src/lib/prisma.ts

REQUIREMENTS:
1. Initialize Next.js 15 App Router with TypeScript and TailwindCSS.
2. Configure Prisma with PostgreSQL provider matching the complete schema defined in Section 8 of README.md (User, Product, ProductImage, Category, Order, OrderItem, Address, Review, Coupon, Notification, UserNotification, AIChatSession, AIChatMessage).
3. Create `src/lib/prisma.ts` exporting a global singleton Prisma client.
4. Implement `prisma/seed.ts` seeding at least:
   - 1 Admin user (admin@eshop.com / AdminPassword@123) with role 'ADMIN'.
   - 6 Categories: Mobiles, Laptops, Audio, Fashion, Home, Watches.
   - At least 24 rich products with realistic pricing (originalPrice, discountedPrice, discountPercent), high-res placeholder image URLs, specifications JSON, and stock counts.
   - 2 active coupons (SAVE10 for 10% off, MEGA20 for 20% off).
5. Ensure `npm run prisma:seed` executes cleanly.

CONSTRAINTS: Do not skip any relational tables. Use proper Decimal and Enum types.
ACCEPTANCE CRITERIA: Database migrations apply without error and seeding script populates all tables with accessible test records.
```

### Prompt 2: Authentication Core, Multi-Identifier Login & Random Avatars
```text
OBJECTIVE: Implement the complete authentication system supporting multi-identifier login, live password strength meter, OTP verification, and random account avatars.
RELEVANT FILES:
- src/app/(auth)/login/page.tsx
- src/app/(auth)/register/page.tsx
- src/app/api/auth/register/route.ts
- src/app/api/auth/login/route.ts
- src/app/api/auth/verify-otp/route.ts
- src/app/api/auth/forgot-password/route.ts
- src/lib/auth.ts
- src/lib/avatarPresets.ts

REQUIREMENTS:
1. Create `src/lib/avatarPresets.ts` with 10 distinct, colorful SVG avatar URLs.
2. In `src/app/(auth)/register/page.tsx`:
   - Inputs: Name, Username, Email ID, Phone Number, Password, Confirm Password.
   - Build a live password strength indicator evaluating entropy (Weak, Fair, Strong, Bulletproof) with an animated color bar.
   - Randomly assign one of the 10 avatar URLs upon registration.
   - Support email OTP verification step; on success, redirect to login page.
3. In `src/app/(auth)/login/page.tsx`:
   - Allow login via Username, Email ID, or Phone Number.
   - Allow authentication via Password (with SVG eye toggle to show/hide) or via OTP.
   - Implement "Forgot Password" modal triggering an OTP reset.
4. In `src/lib/auth.ts`:
   - Password hashing with bcryptjs (salt factor 12).
   - JWT creation and verification.
   - Set JWT in HttpOnly, SameSite=Lax, Secure cookie.
5. Create route handlers for all auth actions with validation.

CONSTRAINTS: Strictly adhere to security standards. Fallback OTP to console logging in development.
ACCEPTANCE CRITERIA: User can register with live strength meter, receive avatar, verify OTP, and login using email, username, or phone.
```

### Prompt 3: Top Navigation, Animated Dropdown & Auto-Swipe Hero Carousel
```text
OBJECTIVE: Construct the responsive landing page header, animated category dropdown, smart search, and the left-to-right auto-swipe discount posters carousel.
RELEVANT FILES:
- src/components/navigation/Navbar.tsx
- src/components/navigation/AnimatedCategoryDrop.tsx
- src/components/navigation/SearchBar.tsx
- src/components/home/AutoBannerCarousel.tsx
- src/app/page.tsx

REQUIREMENTS:
1. Build `Navbar.tsx`:
   - Top-left: E-Shop brand logo (clicking navigates to '/').
   - Animated category dropdown with smooth slide-down animation on click/hover.
   - Middle: Centered smart AI search bar with SVG search button.
   - Top-right: Wishlist heart icon with count badge, cart icon with dynamic item count badge, and login/profile button (shows "Login" button for guests, or the user's allocated avatar when authenticated).
2. Build `AutoBannerCarousel.tsx`:
   - Renders high-impact discount promotional posters.
   - Automatically slides from left to right every 4 seconds.
   - Smooth CSS / Framer Motion slide transitions.
   - Left and right navigation arrows and pagination dot indicators.
   - Clicking a poster navigates directly to the featured product or discount page.
   - Pauses auto-sliding when hovered.

CONSTRAINTS: Ensure fully responsive layout across mobile and desktop. Prevent Cumulative Layout Shift (CLS) on banners.
ACCEPTANCE CRITERIA: Hero carousel auto-slides continuously, banners are clickable, category dropdown animates smoothly, and navbar reflects real-time badge counts.
```

### Prompt 4: Category Strip, 3×4 AI Recommendations & Web3 Footer
```text
OBJECTIVE: Build the top category chips with discount button, the 3×4 (12 items) AI recommendations grid, and the interactive Web3 canvas particle footer.
RELEVANT FILES:
- src/components/home/CategoryStrip.tsx
- src/components/home/AIRecGrid.tsx
- src/components/home/Web3CanvasFooter.tsx
- src/components/product/ProductCard.tsx
- src/app/page.tsx

REQUIREMENTS:
1. Build `CategoryStrip.tsx`:
   - Circular/boxed category cards with images.
   - Prominent pulsating "🔥 Mega Discounts" button filtering for deals > 30% off.
2. Build `AIRecGrid.tsx`:
   - Renders exactly 12 recommended products in a 3-column by 4-row layout on desktop.
   - Products feature "AI Recommended" badges.
3. Build `ProductCard.tsx`:
   - High-res image, title, category, original price (strikethrough), discounted price, discount percentage tag.
   - Top-right heart button for toggling wishlist with micro-animation.
   - Add to Cart button that morphs into inline `[-] [qty] [+]` controls upon click.
   - 3D pop-up hover effect: transforms slightly upward (`translateY(-8px) scale(1.02)`) with ambient drop shadow on hover.
4. Build `Web3CanvasFooter.tsx`:
   - Interactive HTML5 Canvas / Three.js node mesh reacting to mouse movement with subtle oscillating waves.
   - "About E-Shop" description, developer contact links, and newsletter signup.

CONSTRAINTS: Product card click must open product detail in a new tab or dedicated route.
ACCEPTANCE CRITERIA: 12-item grid renders properly, 3D hover effect works smoothly, and Web3 canvas interacts with cursor position.
```

### Prompt 5: Catalog View, Left Sidebar Filters & Multi-Sorting
```text
OBJECTIVE: Implement the comprehensive product catalog page with left sidebar filters, min-to-max price range, and multi-parameter sorting.
RELEVANT FILES:
- src/app/products/page.tsx
- src/components/catalog/SidebarFilters.tsx
- src/components/catalog/ProductGrid.tsx
- src/app/api/products/route.ts

REQUIREMENTS:
1. Create `SidebarFilters.tsx`:
   - Category tree with checkboxes and product counts.
   - Dual-input price range slider (min to max values) with manual text inputs.
   - Customer rating filters (4★ & above, 3★ & above).
   - Discount percentage filters (10%+, 20%+, 30%+, 50%+).
   - "In Stock Only" toggle.
2. Implement sorting dropdown:
   - Recently Added (Newest), Last Added (Oldest), Price: Low to High, Price: High to Low, Customer Rating, Discount %.
3. In `src/app/api/products/route.ts`:
   - Query Prisma with dynamic `where` filters (price range, categoryId, minRating) and `orderBy` sort criteria.
   - Return paginated results with total product count.

CONSTRAINTS: Update URL search params (`?category=...&minPrice=...&sort=...`) on filter change so searches are shareable and bookmarkable.
ACCEPTANCE CRITERIA: Filtering updates product grid without full page reload; sorting criteria reorder items correctly.
```

### Prompt 6: Product Details, 6-Second Auto-Slide Gallery, Pincode Estimator & Verified Reviews
```text
OBJECTIVE: Construct the dedicated product detail page featuring thumbnail strip, 6-second auto-slide gallery, default 560035 pincode distance calculator, and verified-only customer reviews.
RELEVANT FILES:
- src/app/product/[slug]/page.tsx
- src/components/product/AutoSlideGallery.tsx
- src/components/product/PincodeEstimator.tsx
- src/components/product/VerifiedReviews.tsx
- src/app/api/pincode/estimate/route.ts
- src/app/api/reviews/route.ts

REQUIREMENTS:
1. Build `AutoSlideGallery.tsx`:
   - Left-hand vertical strip with multiple small thumbnails.
   - Main projected hero image that slides automatically every 6 seconds.
   - Prominent left and right chevrons for manual switching.
   - 2.5× optical zoom magnification on hover.
2. Build `PincodeEstimator.tsx`:
   - Pre-fills default pincode `560035` (Bengaluru).
   - Allows user to input any 6-digit postal code.
   - Calls `/api/pincode/estimate` to calculate distance from hub `560001` and display delivery date (e.g. "Tomorrow by 9 PM") and shipping fee.
3. Build `VerifiedReviews.tsx`:
   - Displays star ratings breakdown and review list.
   - "Write a Review" form visible and active ONLY if the logged-in user has purchased this item and received it (`orderStatus === 'DELIVERED'`). Otherwise displays verification requirement notice.

CONSTRAINTS: Pincode lookup must handle invalid codes gracefully.
ACCEPTANCE CRITERIA: Gallery slides automatically every 6s, pincode calculates delivery date accurately, and unverified users cannot submit reviews.
```

### Prompt 7: Cart, Admin Promo Engine, Checkout & Automated PDF Invoicing
```text
OBJECTIVE: Implement the shopping cart with top address selector, admin coupon validation, checkout gateway, and automated downloadable PDF invoice generation.
RELEVANT FILES:
- src/app/cart/page.tsx
- src/components/cart/AddressSelector.tsx
- src/components/cart/PromoCouponInput.tsx
- src/app/checkout/page.tsx
- src/lib/invoiceGenerator.ts
- src/app/api/orders/checkout/route.ts
- src/app/api/orders/[id]/invoice/route.ts

REQUIREMENTS:
1. In `cart/page.tsx`:
   - Place `AddressSelector.tsx` at the top of the cart, allowing selection of saved addresses or adding a new address.
   - Render cart items with inline quantity adjustment and removal buttons.
   - Navbar top cart counter badge updates reactively.
2. In `PromoCouponInput.tsx`:
   - Input for coupon code created by admin.
   - Validates code against database, calculates percentage discount, and updates cart total.
3. In `checkout/page.tsx`:
   - Payment method selection (Cards, UPI, Netbanking, COD).
   - Completing order generates unique invoice number (`INV-YYYYMMDD-XXXXX`).
4. In `src/lib/invoiceGenerator.ts`:
   - Generate vector-clean downloadable PDF invoice including order details, customer info, address, items table, tax, coupon discount, and authorized signature.
   - Provide "Download Invoice (PDF)" button immediately on order confirmation.

CONSTRAINTS: Orders and invoice numbers must be created inside atomic transactions.
ACCEPTANCE CRITERIA: Applying coupons reduces total correctly; completing checkout generates valid downloadable PDF invoice.
```

### Prompt 8: Visual Order Tracking, Address Modification & Notification Swipe-to-Dismiss
```text
OBJECTIVE: Build the 5-step visual order tracking stepper with conditional cancellation/address alteration gates, and the broadcast notification drawer with right-swipe deletion.
RELEVANT FILES:
- src/app/account/orders/page.tsx
- src/app/account/track/[id]/page.tsx
- src/components/order/VisualOrderTracker.tsx
- src/components/notifications/NotificationDrawer.tsx
- src/components/notifications/SwipeableItem.tsx
- src/app/api/notifications/route.ts

REQUIREMENTS:
1. In `VisualOrderTracker.tsx`:
   - Render 5-step visual tracking progress bar: `Order Placed` -> `Confirmed` -> `Shipped` -> `Out for Delivery` -> `Delivered`.
   - Provide "Change Delivery Address" and "Cancel Order" buttons.
   - CRITICAL RULE: Both buttons must be active ONLY while status is `ORDER_PLACED`, `CONFIRMED`, or `SHIPPED`. When status reaches `OUT_FOR_DELIVERY` or `DELIVERED`, buttons must be disabled with a notice: *"Order is out for delivery; address changes and cancellations are locked."*
2. In `NotificationDrawer.tsx` & `SwipeableItem.tsx`:
   - Bell icon in navbar opens notification panel.
   - Shows deal alerts broadcasted by admin.
   - Users can swipe a notification card to the right using touch or mouse drag; dragging past 120px triggers exit animation and permanently dismisses it from user's view.

CONSTRAINTS: Ensure swipe gesture is smooth without page jitter.
ACCEPTANCE CRITERIA: Visual tracker accurately reflects status; cancellation locks out-for-delivery; right-swipe dismisses notifications cleanly.
```

### Prompt 9: Protected Admin Suite, 10-per-Page Orders, Product CRUD & Coupon Generator
```text
OBJECTIVE: Implement the hidden administrative dashboard with KPI cards, 10-per-page paginated order fulfillment, product CRUD, coupon generator, and deal broadcast.
RELEVANT FILES:
- src/app/admin/layout.tsx
- src/app/admin/dashboard/page.tsx
- src/app/admin/orders/page.tsx
- src/app/admin/products/page.tsx
- src/app/admin/coupons/page.tsx
- src/app/admin/notifications/page.tsx
- src/app/api/admin/orders/route.ts
- src/app/api/admin/products/route.ts

REQUIREMENTS:
1. In `admin/layout.tsx`:
   - Guarded by server check (`user.role === 'ADMIN'`).
   - Left navigation sidebar with buttons: Dashboard, Products, Orders, Users, Coupons, Notifications, Analytics.
2. In `admin/dashboard/page.tsx`:
   - Summary KPI cards: Total Revenue, Orders Today, Low Stock alerts (< 5 units), Registered Users.
3. In `admin/orders/page.tsx`:
   - High-density table displaying strictly 10 orders per page.
   - Next and Previous pagination controls.
   - Order action buttons: `Accept`, `Reject`, `Mark Shipped`, `Mark Out for Delivery`, `Mark Delivered`.
4. In `admin/products/page.tsx`:
   - Full CRUD: Add product with multiple images, title, price, discount %, stock, specs; edit existing; delete.
5. In `admin/coupons/page.tsx`:
   - Generate coupons with discount percentage, expiry date, and usage limits.
6. In `admin/notifications/page.tsx`:
   - Input to broadcast instant deal notifications to all customers.

CONSTRAINTS: Admin portal must not be linked in regular customer navigation.
ACCEPTANCE CRITERIA: Only admin can access; order list paginates 10 per page; order state transitions function; product CRUD works.
```

### Prompt 10: Sticky Glassmorphism AI Shopping Concierge with Gemini API
```text
OBJECTIVE: Implement the floating bottom-center frosted glass AI search and personal shopping assistant with isolated per-user conversation memory and direct product card recommendations.
RELEVANT FILES:
- src/components/ai/StickyGlassAIAssistant.tsx
- src/app/api/ai/chat/route.ts
- src/lib/gemini.ts
- src/stores/aiStore.ts

REQUIREMENTS:
1. Build `StickyGlassAIAssistant.tsx`:
   - Fixed at bottom-center of the viewport (`fixed bottom-6 left-1/2 -translate-x-1/2 z-50`).
   - Frosted glassmorphism design (`backdrop-filter: blur(16px); background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(255, 255, 255, 0.15)`).
   - Stays pinned during scrolling.
   - Collapsible input bar that expands into a conversational chat drawer.
2. In `src/app/api/ai/chat/route.ts`:
   - Authenticate customer and associate session with `userId`.
   - Pass conversation history and user query to Google Gemini 2.5 Flash via `@google/genai`.
   - Configure system instructions to act as E-Shop's intelligent shopping concierge.
   - Use function calling / catalog search tool to fetch active matching products from PostgreSQL.
   - Return conversational advice alongside structured product card data.
3. Render interactive product cards inside the chat window with direct links to the product detail page.
4. Save chat turns in `AIChatSession` and `AIChatMessage` so context persists across sessions for each individual account.

CONSTRAINTS: Maintain isolated context per user account. Ensure frosted glass styling renders crisply across browsers.
ACCEPTANCE CRITERIA: Floating glass bar remains sticky at bottom-center; chatting with AI returns helpful shopping advice with clickable product cards; context is preserved per user.
```

### Enhanced 20-Phase Implementation Roadmap (P1 to P20)

> 📖 **Full Specification Reference:** For line-by-line acceptance criteria, unit tests, and constraints for each of these 20 phases, see [EShop_Project_Planning_Document.md](file:///c:/Users/WIN%2011/Desktop/E%20commerce/E_Shop/EShop_Project_Planning_Document.md#16-ai-coding-ide-execution-prompts).

| Phase | Module / Task | Key Deliverables & Files | Acceptance Criteria |
|---|---|---|---|
| **P1** | **Project Setup & Tooling** | `package.json`, `tsconfig.json`, `eslint`, `prettier` | Strict linting, type-checking passes, clean script execution. |
| **P2** | **Database Models & Seeds** | `prisma/schema.prisma` / `models/*`, seed script | 13 models created, admin seeded, sample products & categories populated. |
| **P3** | **Auth Backend** | `routes/auth.*`, JWT, bcrypt, Gmail OTP | Multi-identifier login (email/phone/username), OTP verification, refresh token. |
| **P4** | **Auth Frontend** | `(auth)/login`, `(auth)/register`, eye toggle | Live password strength meter, SVG eye toggle, random avatar allocation. |
| **P5** | **Admin Auth & RBAC** | `middleware/auth.*`, `/admin` route guard | Unlisted admin route, HTTP 403 on non-admin access, role-based security. |
| **P6** | **Home Page & Navigation** | `Navbar`, `AutoBannerCarousel`, `Web3Footer` | 4s auto-swiping posters, animated category dropdown, Web3 particle footer. |
| **P7** | **Catalogue & Filter Sidebar**| `products/page`, `SidebarFilters`, multi-sort | Min-max price slider, category tree, rating filter, responsive grid. |
| **P8** | **Product Detail Page (PDP)** | `product/[slug]`, `AutoSlideGallery` | 6s auto-slide gallery, vertical thumbnail strip, hover zoom magnifier. |
| **P9** | **Pincode Delivery Estimator**| `PincodeEstimator`, Haversine formula | Default `560035` lookup, distance from hub `560001`, arrival ETA badge. |
| **P10**| **Cart & Wishlist** | `cart/page`, `useCartStore`, navbar badge | Live reactive count badge, inline quantity adjusters (+/-), wishlist toggle. |
| **P11**| **Coupons & Checkout** | `checkout/page`, `PromoCouponInput`, Razorpay | Address selector at top, admin coupon percentage discount, payment flow. |
| **P12**| **Automated Invoicing** | `invoiceGenerator.*`, PDF template | Unique `INV-YYYYMMDD-XXXXX` counter, downloadable vector PDF invoice. |
| **P13**| **Order Tracking & Account** | `account/orders`, `VisualOrderTracker` | 5-step stepper, address edit & cancellation locked at `OUT_FOR_DELIVERY`. |
| **P14**| **Admin Backend APIs** | `api/admin/*`, 10/page pagination | Product CRUD, 10 orders per page, status transitions (Accept/Reject/Ship/Deliver). |
| **P15**| **Admin Frontend Console** | `admin/dashboard`, `admin/orders`, sidebar | Left navigation bar, KPI summary cards, coupon generator, deal broadcast. |
| **P16**| **Real-Time Deals & Reviews**| SSE / Socket.IO, `SwipeableItem`, reviews | Deal notification push, swipe-to-dismiss gesture, verified buyer review gate. |
| **P17**| **AI Search & Recommendations**| `ai/search`, 3x4 grid (12 products) | Candidate retrieval, LLM ranking, whitelist filtering, 12-item affinity grid. |
| **P18**| **Sticky Glass AI Concierge** | `StickyGlassAIAssistant`, Gemini API | Floating bottom-center frosted glass bar, isolated user memory, product cards. |
| **P19**| **Hardening & Accessibility** | Helmet, rate limits, WCAG 2.1 AA | Zero critical a11y issues, Core Web Vitals LCP < 1.8s, CSRF/XSS protection. |
| **P20**| **CI/CD, Docs & Deployment** | GitHub Actions, Dockerfile, live deploy | Passing CI pipeline, Docker build, environment variables configured, smoke tests. |

---

*This concludes the unified, authoritative project planning document and architectural specification for **E-Shop**.*
