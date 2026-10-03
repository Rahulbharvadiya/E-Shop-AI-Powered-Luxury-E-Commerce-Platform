# E-Shop — Complete Technical Architecture & Flow Specifications

> **System Blueprint, Micro-Flows, State Machines & Integration Topologies**  
> *Engineered for high-throughput, low-latency e-commerce with integrated Google Gemini AI and Web3 aesthetics.*

---

### 📚 Project Architecture & Planning Suite

| Document / Asset | File Path | Focus Area |
|---|---|---|
| 📋 **Enhanced Master Planning Document** | [EShop_Project_Planning_Document.md](file:///c:/Users/WIN%2011/Desktop/E%20commerce/E_Shop/EShop_Project_Planning_Document.md) | Provenance tags `[U]`/`[R]`, Assumptions A1–A10, and 20 Phased Incremental Prompts (P1–P20). |
| 📖 **Master Project Specification** | [README.md](file:///c:/Users/WIN%2011/Desktop/E%20commerce/E_Shop/README.md) | The single authoritative full-stack blueprint covering all 16 planning sections. |
| 🖥️ **Interactive Architecture Dashboard** | [architecture-diagram.html](file:///c:/Users/WIN%2011/Desktop/E%20commerce/E_Shop/architecture-diagram.html) | Interactive visual navigator with real-time Mermaid diagrams, tabbed flows, and zoom controls. |
| 🖼️ **System Architecture Blueprint** | [architecture-diagram.jpg](file:///c:/Users/WIN%2011/Desktop/E%20commerce/E_Shop/architecture-diagram.jpg) | High-resolution infographic displaying multi-tier services, Edge gateway, and persistence layers. |

---

## Table of Contents
1. [Global System Architecture](#1-global-system-architecture)
2. [Flow Architecture 1: Customer E-Commerce Purchase & Invoicing Flow](#2-flow-architecture-1-customer-e-commerce-purchase--invoicing-flow)
3. [Flow Architecture 2: Smart Pincode Delivery Estimator Flow (Default 560035)](#3-flow-architecture-2-smart-pincode-delivery-estimator-flow-default-560035)
4. [Flow Architecture 3: Sticky Glassmorphism AI Concierge & Gemini Tool Calling Flow](#4-flow-architecture-3-sticky-glassmorphism-ai-concierge--gemini-tool-calling-flow)
5. [Flow Architecture 4: 5-Step Order State Machine & Conditional Modification Gate](#5-flow-architecture-4-5-step-order-state-machine--conditional-modification-gate)
6. [Flow Architecture 5: Admin Operations, 10-per-Page Orders & Stock Analytics Flow](#6-flow-architecture-5-admin-operations-10-per-page-orders--stock-analytics-flow)
7. [Flow Architecture 6: Broadcast Notifications & Swipe-to-Dismiss Gesture Flow](#7-flow-architecture-6-broadcast-notifications--swipe-to-dismiss-gesture-flow)
8. [Flow Architecture 7: Multi-Identifier Authentication, OTP & Random Avatar Flow](#8-flow-architecture-7-multi-identifier-authentication-otp--random-avatar-flow)
9. [Entity Relationship & Data Flow Architecture](#9-entity-relationship--data-flow-architecture)
10. [Infrastructure, Network & Security Topology](#10-infrastructure-network--security-topology)

---

## 1. Global System Architecture

The following diagram illustrates the complete end-to-end topological layout of E-Shop across the Client Tier, Edge & Middleware Tier, Application Service Layer, and Persistence / Third-Party Tier.

```mermaid
flowchart TB
    subgraph ClientTier ["🖥️ Client Tier (Responsive Web & Mobile Browser)"]
        Landing["Landing Page<br/>• Auto-Swipe Discount Carousel<br/>• Staggered Category Dropdown<br/>• Category Strip + Mega Discount<br/>• 3x4 AI Recommendations Grid<br/>• Web3 Canvas Particle Footer"]
        Catalog["Catalog & Filtering<br/>• Left Sidebar (Price Slider, Rating, Cat)<br/>• Multi-sort (Newest, Price, Rating)<br/>• 3D Pop-Up Hover Cards<br/>• Inline Qty (+/-) & Heart Wishlist"]
        ProductDetail["Product Detail View<br/>• Vertical Thumbnail Strip<br/>• 6s Auto-Slide Hero Gallery<br/>• Default 560035 Pincode Estimator<br/>• Verified-Only Customer Reviews"]
        CartCheckout["Cart & Checkout<br/>• Top Address Selector<br/>• Admin Promo Code Engine<br/>• Payment Gateway (Cards, UPI, COD)<br/>• Downloadable PDF Invoice"]
        AccountTrack["Account & Tracking<br/>• 5-Step Visual Order Stepper<br/>• Conditional Address Edit / Cancel<br/>• Random Avatar Display<br/>• Swipe-to-Dismiss Notifications"]
        StickyAI["Sticky Glassmorphism AI Concierge<br/>• Bottom-Center Floating Frosted Glass<br/>• Natural Language Conversational Search<br/>• Direct Clickable Product Cards"]
        AdminPortal["Protected Admin Portal (/admin)<br/>• Executive KPI Summary Dashboard<br/>• 10-per-Page Paginated Orders Table<br/>• Product & Stock Inventory CRUD<br/>• Coupon Generator & Deal Broadcast"]
    end

    subgraph EdgeRouting ["🛡️ Edge Routing & Security Middleware"]
        CDN["Edge CDN / Reverse Proxy<br/>(Asset Caching, SSL Termination)"]
        NextMW["Next.js Middleware<br/>• JWT Decryption & Verification<br/>• RBAC Guard (/admin/* restricted)<br/>• IP Rate Limiting (Token Bucket)<br/>• Security Headers (CSP, CORS, CSRF)"]
    end

    subgraph AppServices ["⚙️ Application Service Layer (Next.js 15 Route Handlers)"]
        AuthSvc["Auth & Security Service<br/>• Multi-ID Login (Email, Phone, Username)<br/>• Gmail OTP (SMTP) / Phone OTP<br/>• Live Password Strength Evaluator<br/>• 10 Random Avatar Vector Allocator"]
        CatalogSvc["Catalog & Product Service<br/>• Dynamic Filter & Pagination Engine<br/>• 3x4 AI Personalized Affinity Scorer<br/>• Product Media & Specs Provider"]
        DeliverySvc["Delivery Intelligence Service<br/>• Pincode Coordinate Distance Matrix<br/>• Bengaluru Hub (560001) Baseline<br/>• Transit ETA & Shipping Cost Engine"]
        CartCouponSvc["Cart & Promotion Service<br/>• Atomic Cart State Sync<br/>• Promo Code Validator (Discount %)"]
        OrderInvoiceSvc["Order & Invoicing Service<br/>• Checkout Orchestrator<br/>• Unique Invoice No. (INV-YYYYMMDD-XXXXX)<br/>• Vector PDF Invoice Compiler"]
        OrderStateSvc["Order State Machine Engine<br/>• 5-Step Status Transitioner<br/>• Out-for-Delivery Policy Enforcer"]
        ReviewSvc["Verified Review Service<br/>• Delivered-Order Buyer Verification Gate<br/>• Aggregate Star Rating Calculator"]
        NotifySvc["Real-Time Notification Service<br/>• Server-Sent Events (SSE) Stream<br/>• Swipe-to-Dismiss State Sync"]
        AISvc["AI Shopping Concierge Engine<br/>• Gemini 2.5 Flash SDK Integration<br/>• Catalog Search Tool Calling<br/>• Isolated User Session Memory"]
    end

    subgraph DataExternalTier ["💾 Persistence & External Ecosystem"]
        PostgresDB[("PostgreSQL 16 Database<br/>(Prisma ORM - 13 Relational Tables)")]
        RedisCache[("Redis In-Memory Cache<br/>(OTP Tokens, Rate Limits, SSE PubSub)")]
        GeminiCloud["Google Gemini 2.5 Flash API<br/>(Natural Language Intent & Embeddings)"]
        EmailSMTP["Nodemailer / Gmail SMTP<br/>(OTP Codes & Order Invoices)"]
        CloudStorage["Cloudinary / S3 Object Storage<br/>(Banners, Product Images, PDF Invoices)"]
    end

    ClientTier --> CDN
    CDN --> NextMW
    NextMW --> AppServices
    
    AuthSvc --> PostgresDB
    AuthSvc --> RedisCache
    AuthSvc --> EmailSMTP

    CatalogSvc --> PostgresDB
    DeliverySvc --> PostgresDB

    CartCouponSvc --> PostgresDB
    OrderInvoiceSvc --> PostgresDB
    OrderInvoiceSvc --> CloudStorage
    OrderStateSvc --> PostgresDB

    ReviewSvc --> PostgresDB
    NotifySvc --> RedisCache
    NotifySvc --> PostgresDB

    AISvc --> GeminiCloud
    AISvc --> PostgresDB
```

---

## 2. Flow Architecture 1: Customer E-Commerce Purchase & Invoicing Flow

This sequence diagrams the end-to-end purchasing lifecycle: browsing, 3D card oversight, pincode check, address selection, coupon application, payment, and instantaneous PDF invoice generation.

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Customer
    participant UI as Next.js 15 Client UI
    participant CatalogAPI as /api/products
    participant PincodeAPI as /api/pincode/estimate
    participant CartAPI as /api/cart
    participant CouponAPI as /api/coupons/validate
    participant OrderAPI as /api/orders/checkout
    participant InvoiceAPI as /api/orders/[id]/invoice
    participant DB as PostgreSQL (Prisma)

    Customer->>UI: Lands on Home / Catalog
    UI->>CatalogAPI: GET /api/products?category=...&sort=...
    CatalogAPI->>DB: Query filtered products + images
    DB-->>CatalogAPI: Returns products list
    CatalogAPI-->>UI: Renders products with 3D Hover & Inline (+/-)

    Customer->>UI: Clicks product card -> Opens in new tab
    UI->>PincodeAPI: POST /api/pincode/estimate (pincode: 560035)
    PincodeAPI-->>UI: Returns ETA: "Tomorrow by 9 PM", Shipping: ₹0
    
    Customer->>UI: Clicks "Add to Cart"
    UI->>CartAPI: POST /api/cart/add (productId, qty: 1)
    CartAPI->>DB: Upsert CartItem
    DB-->>CartAPI: CartItem updated
    CartAPI-->>UI: Navbar Cart counter badge animates

    Customer->>UI: Navigates to /cart
    UI->>UI: Displays saved addresses at top of cart
    Customer->>UI: Enters Promo Code "SAVE20"
    UI->>CouponAPI: POST /api/coupons/validate (code: "SAVE20")
    CouponAPI->>DB: Check validity & expiry
    DB-->>CouponAPI: Coupon active, 20% discount
    CouponAPI-->>UI: Subtotal discounted by 20%

    Customer->>UI: Proceeds to Checkout & selects payment (UPI/Card)
    Customer->>UI: Submits Order
    UI->>OrderAPI: POST /api/orders/checkout (addressId, couponId, items)
    OrderAPI->>DB: prisma.$transaction [Verify Stock, Decrement Stock, Insert Order, Insert OrderItems, Clear Cart]
    DB-->>OrderAPI: Order created (Invoice No: INV-20261001-08142)
    OrderAPI-->>UI: Order confirmation response

    UI->>InvoiceAPI: GET /api/orders/{id}/invoice
    InvoiceAPI->>DB: Query Order + User + Items + Address
    InvoiceAPI->>InvoiceAPI: Generate Vector PDF using @react-pdf/renderer
    InvoiceAPI-->>UI: Streams PDF Binary (Downloadable file)
    Customer->>Customer: Downloads & views official PDF Invoice
```

---

## 3. Flow Architecture 2: Smart Pincode Delivery Estimator Flow (Default 560035)

E-Shop defaults to `560035` (Bengaluru, Karnataka) and computes delivery transit times from the central logistics distribution hub located at `560001`.

```mermaid
flowchart TD
    StartInput["Customer enters Pincode<br/>(Default: 560035)"] --> FormatCheck{"Valid 6-Digit<br/>Indian Postal Code?"}
    
    FormatCheck -- "No" --> ErrorRes["Display Error: 'Please enter a valid 6-digit PIN code'"]
    
    FormatCheck -- "Yes" --> CacheCheck{"Pincode cached in<br/>Redis memory?"}
    CacheCheck -- "Yes" --> GetGeo["Retrieve Geo Coordinates & Distance from Cache"]
    CacheCheck -- "No" --> DBGeo["Lookup Pincode Directory in PostgreSQL"]
    
    DBGeo --> CalcDist["Calculate Haversine Distance from Hub (560001 - Bengaluru Central)"]
    CalcDist --> SetCache["Store (Pincode -> Distance) in Redis (TTL: 30 days)"]
    SetCache --> ClassifyDistance
    GetGeo --> ClassifyDistance{"Classify Distance (km)"}

    ClassifyDistance -- "< 30 km (Intra-City / Same City)" --> ZoneSame["Same-City Fast Track<br/>• Transit: Same Day / Next Day<br/>• ETA: Tomorrow by 9:00 PM<br/>• Shipping: Free on all orders<br/>• COD: Available"]
    ClassifyDistance -- "30 km - 300 km (Regional Zone)" --> ZoneRegion["Regional Hub Track<br/>• Transit: 2 Business Days<br/>• Shipping: Free over ₹499 (else ₹40)<br/>• COD: Available"]
    ClassifyDistance -- "> 300 km (National Express)" --> ZoneNational["National Express Track<br/>• Transit: 4 to 6 Business Days<br/>• Shipping: Standard ₹70<br/>• COD: Prepaid preferred / COD eligible"]

    ZoneSame --> ReturnJSON["Return JSON Payload:<br/>{ estimatedDays, deliveryFormatted, shippingFee, isCodAvailable }"]
    ZoneRegion --> ReturnJSON
    ZoneNational --> ReturnJSON
    ReturnJSON --> UpdateUI["Client updates Delivery Badge & Checkout Summary in Real-Time"]
```

---

## 4. Flow Architecture 3: Sticky Glassmorphism AI Concierge & Gemini Tool Calling Flow

The conversational shopping concierge hovers at the bottom-center with frosted glass (`backdrop-filter: blur(16px)`). It remembers individual customer context and uses Gemini function calling to pull live products.

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Customer
    participant UI as Sticky Glass Bar (Bottom-Center)
    participant AISvc as /api/ai/chat (Route Handler)
    participant DB as PostgreSQL (Prisma)
    participant Gemini as Google Gemini 2.5 Flash API

    Customer->>UI: Types: "I need a light laptop for college with 16GB RAM under ₹60,000"
    UI->>AISvc: POST /api/ai/chat (userId, message, sessionId)
    AISvc->>DB: Load last 10 messages from AIChatSession (userId isolated)
    DB-->>AISvc: Returns chat history context

    AISvc->>Gemini: Call gemini-2.5-flash with Tools: [searchProducts(query, maxPrice, specs)]
    Note over Gemini: Gemini evaluates user prompt & triggers tool call
    Gemini-->>AISvc: Tool Call Request: searchProducts(query="laptop 16GB", maxPrice=60000)

    AISvc->>DB: Execute query: SELECT * FROM Product WHERE category='Laptops' AND discountedPrice <= 60000 AND stockQuantity > 0
    DB-->>AISvc: Returns 3 matching laptop records
    AISvc->>Gemini: Return Tool Call Result: JSON of 3 products

    Note over Gemini: Gemini crafts natural response referencing the 3 products
    Gemini-->>AISvc: Conversational response text + product reference IDs
    AISvc->>DB: Save User & Model messages in AIChatMessage
    AISvc-->>UI: Return { reply: "...", recommendedProducts: [ProductCard1, ProductCard2] }

    UI->>UI: Render streaming conversational bubbles with interactive Product Cards
    Customer->>UI: Clicks recommended Product Card -> Navigates straight to Product Details!
```

---

## 5. Flow Architecture 4: 5-Step Order State Machine & Conditional Modification Gate

Orders follow a deterministic 5-stage lifecycle. The business rules enforce that **address modifications** and **cancellations** can occur **only prior to dispatch (`OUT_FOR_DELIVERY`)**.

```mermaid
stateDiagram-v2
    [*] --> ORDER_PLACED: Customer places order at Checkout
    
    state "Can Modify Address & Cancel" as ModifiableState {
        ORDER_PLACED --> CONFIRMED: Admin reviews & clicks 'Accept'
        CONFIRMED --> SHIPPED: Packed & Dispatched from Warehouse
    }

    state "Locked State (No Modifications / No Cancellation)" as LockedState {
        SHIPPED --> OUT_FOR_DELIVERY: Local Courier Hub scans package
        OUT_FOR_DELIVERY --> DELIVERED: Reaches Customer Doorstep
    }

    ORDER_PLACED --> CANCELLED: Customer clicks 'Cancel Order'
    CONFIRMED --> CANCELLED: Customer clicks 'Cancel Order'
    SHIPPED --> CANCELLED: Customer clicks 'Cancel Order'

    OUT_FOR_DELIVERY --> [*]: Cancellation Disabled in UI & API (HTTP 409)
    DELIVERED --> [*]: Verified Buyer status granted for Product Reviews
    CANCELLED --> [*]: Stock returned to inventory & refund initiated
```

### Policy Gate Table
| Current Order Status | Can Customer Modify Address? | Can Customer Cancel Order? | API Validation Rule |
|---|:---:|:---:|---|
| `ORDER_PLACED` | ✅ Yes | ✅ Yes | Status check passes; executes address update / cancellation. |
| `CONFIRMED` | ✅ Yes | ✅ Yes | Status check passes; notifies logistics queue. |
| `SHIPPED` | ✅ Yes | ✅ Yes | Allowed if manifest update sent to courier before loading. |
| `OUT_FOR_DELIVERY` | ❌ **LOCKED** | ❌ **LOCKED** | UI disables action buttons; API rejects with `409 Conflict`. |
| `DELIVERED` | ❌ **LOCKED** | ❌ **LOCKED** | Terminal status. Opens verified review submission rights. |
| `CANCELLED` | ❌ **LOCKED** | ❌ **LOCKED** | Terminal status. Re-credits inventory quantity. |

---

## 6. Flow Architecture 5: Admin Operations, 10-per-Page Orders & Stock Analytics Flow

The admin portal is strictly protected and hidden from front-end customer navigation (`/admin/*`).

```mermaid
flowchart TD
    AdminUser["Admin User navigates to /admin/login"] --> AuthCheck{"Valid Admin Credentials?<br/>(role === 'ADMIN')"}
    AuthCheck -- "No" --> Deny["Redirect to Home / Return 403 Forbidden"]
    
    AuthCheck -- "Yes" --> AdminDashboard["Admin Dashboard (/admin/dashboard)<br/>• Left Persistent Navigation Sidebar<br/>• Executive KPI Cards: Total Revenue, Orders Today, Low Stock Alert"]

    AdminDashboard --> Opt1["📦 10-per-Page Paginated Orders Table"]
    AdminDashboard --> Opt2["🏷️ Product & Inventory CRUD"]
    AdminDashboard --> Opt3["🎟️ Coupon Generator"]
    AdminDashboard --> Opt4["🔔 Broadcast Deal Alerts"]
    AdminDashboard --> Opt5["👥 User Account Governance"]

    subgraph OrderManagement ["10-per-Page Order Fulfillment Pipeline"]
        Opt1 --> FetchOrders["Query Orders: SELECT * FROM Order ORDER BY createdAt DESC LIMIT 10 OFFSET (page - 1) * 10"]
        FetchOrders --> RenderTable["Render 10 orders with status badges & customer info"]
        RenderTable --> ActionButtons{"Admin clicks Action Button"}
        ActionButtons -- "Accept" --> SetConfirmed["Update status to CONFIRMED"]
        ActionButtons -- "Reject" --> SetCancelled["Update status to CANCELLED + Restock items"]
        ActionButtons -- "Mark Shipped" --> SetShipped["Update status to SHIPPED"]
        ActionButtons -- "Mark Delivered" --> SetDelivered["Update status to DELIVERED (Enables customer review)"]
    end

    subgraph CouponPipeline ["Coupon Generation Engine"]
        Opt3 --> InputCoupon["Enter Code (e.g., FESTIVE25), Discount % (25%), Expiry Date, Min Order"]
        InputCoupon --> SaveCoupon["Prisma: INSERT INTO Coupon"]
        SaveCoupon --> ActiveCoupons["Coupon active for real-time customer cart validation"]
    end
```

---

## 7. Flow Architecture 6: Broadcast Notifications & Swipe-to-Dismiss Gesture Flow

Admin broadcasts flash deals to all active users via Server-Sent Events (SSE). Customers can view them in the notification drawer and dismiss them with an interactive right-swipe gesture.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Store Admin
    participant AdminUI as Admin Notification Manager
    participant NotifyAPI as /api/notifications
    participant SSE as SSE Stream (/api/notifications/stream)
    actor Customer as Customer Client
    participant ClientUI as Notification Drawer (Swipeable)
    participant DB as PostgreSQL (Prisma)

    Customer->>SSE: Connect to SSE Stream with auth cookie
    SSE-->>Customer: Connection established (keep-alive)

    Admin->>AdminUI: Enters Title: "Flash Sale: 50% off Sony Headphones!" & URL
    Admin->>AdminUI: Clicks "Broadcast Deal to All Users"
    AdminUI->>NotifyAPI: POST /api/admin/notifications
    NotifyAPI->>DB: INSERT INTO Notification (title, message, targetUrl)
    DB-->>NotifyAPI: Notification recorded (id: notif_789)
    NotifyAPI->>SSE: Emit Event 'deal-alert' with notification payload

    SSE-->>Customer: Push Event 'deal-alert'
    Customer->>ClientUI: Bell badge increments & toast notification slides in

    Customer->>ClientUI: Opens Notification Drawer & views deal card
    Customer->>ClientUI: Drags/Swipes notification card to the RIGHT (> 120px threshold)
    ClientUI->>ClientUI: Card triggers exit fade transition & removes from local view
    ClientUI->>NotifyAPI: DELETE /api/notifications/notif_789
    NotifyAPI->>DB: UPSERT UserNotification SET isDismissed = true
    DB-->>NotifyAPI: Dismissal confirmed
    NotifyAPI-->>ClientUI: 200 OK (Notification permanently removed)
```

---

## 8. Flow Architecture 7: Multi-Identifier Authentication, OTP & Random Avatar Flow

Customers can log in using either Email ID, Phone Number, or Username, authenticated either via Password (with SVG eye toggle) or OTP (Gmail SMTP / Phone). Signup assigns one of 10 distinct, vibrant random avatar vectors.

```mermaid
flowchart TD
    UserAction["User accesses /login or /register"] --> ModeDecision{"Login or Register?"}

    subgraph RegistrationPath ["Registration & Avatar Allocation"]
        ModeDecision -- "Register" --> RegForm["Fill: Name, Username, Email, Phone, Password, Confirm Password"]
        RegForm --> PwdMeter["Live Password Strength Meter evaluates length, uppercase, numbers, symbols<br/>(Weak / Fair / Strong / Bulletproof bar)"]
        PwdMeter --> SubmitReg["Click 'Create Account'"]
        SubmitReg --> GenAvatar["System randomly selects 1 of 10 Avatar Vectors<br/>(e.g., /images/avatars/avatar_07.svg)"]
        GenAvatar --> GenOTP["Generate 6-digit cryptographic OTP"]
        GenOTP --> SendMail["Send OTP via Gmail SMTP (Nodemailer)"]
        SendMail --> VerifyRegOTP{"User enters OTP correctly within 10 mins?"}
        VerifyRegOTP -- "No" --> RetryReg["Prompt re-entry / Resend OTP"]
        VerifyRegOTP -- "Yes" --> CreateUser["PostgreSQL: INSERT INTO User (isEmailVerified=true, avatarUrl=...)"]
        CreateUser --> DirectLogin["Redirect directly to /login with success notification"]
    end

    subgraph LoginPath ["Multi-Identifier Login Flow"]
        ModeDecision -- "Login" --> InputIdentifier["Enter Identifier: Email ID, Phone Number, OR Username"]
        InputIdentifier --> AuthMethod{"Choose Auth Method"}
        
        AuthMethod -- "Password" --> InputPwd["Enter Password (Toggle SVG Eye button to view/hide)"]
        InputPwd --> VerifyHash["Bcrypt compares password against passwordHash"]
        
        AuthMethod -- "OTP" --> SendLoginOTP["Send 6-digit OTP to registered Email/Phone"]
        SendLoginOTP --> EnterLoginOTP["Enter OTP"]
        EnterLoginOTP --> VerifyLoginOTP{"OTP valid & unexpired?"}

        VerifyHash -- "Valid" --> IssueJWT["Generate signed JWT Access Token (HS256)"]
        VerifyLoginOTP -- "Valid" --> IssueJWT

        VerifyHash -- "Invalid" --> FailLogin["Display 'Invalid credentials' error"]
        VerifyLoginOTP -- "Invalid" --> FailLogin

        IssueJWT --> SetCookie["Set HTTP-only, Secure, SameSite=Lax Session Cookie"]
        SetCookie --> LoadApp["Redirect to Home / Dashboard with assigned Random Avatar in Navbar"]
    end
```

---

## 9. Entity Relationship & Data Flow Architecture

The data flow mapping connects customers, products, reviews, carts, coupons, orders, and AI chat sessions.

```mermaid
erDiagram
    USER ||--o{ ORDER : "places"
    USER ||--o{ REVIEW : "writes"
    USER ||--o{ ADDRESS : "maintains"
    USER ||--o{ CART_ITEM : "stores"
    USER ||--o{ WISHLIST_ITEM : "bookmarks"
    USER ||--o{ AI_CHAT_SESSION : "holds"
    USER ||--o{ USER_NOTIFICATION : "receives"

    CATEGORY ||--o{ PRODUCT : "classifies"
    PRODUCT ||--o{ PRODUCT_IMAGE : "displays"
    PRODUCT ||--o{ REVIEW : "evaluated_by"
    PRODUCT ||--o{ ORDER_ITEM : "purchased_in"
    PRODUCT ||--o{ CART_ITEM : "added_to"
    PRODUCT ||--o{ WISHLIST_ITEM : "saved_in"

    ORDER ||--|{ ORDER_ITEM : "contains"
    ORDER ||--|| ADDRESS : "ships_to"
    ORDER ||--o| COUPON : "discounts"

    COUPON ||--o{ ORDER : "applied_to"
    NOTIFICATION ||--o{ USER_NOTIFICATION : "broadcasted_as"
    AI_CHAT_SESSION ||--|{ AI_CHAT_MESSAGE : "records"

    USER {
        string id PK
        string username UK
        string email UK
        string phone UK
        string passwordHash
        string role "CUSTOMER | ADMIN"
        string avatarUrl "1 of 10 presets"
    }

    PRODUCT {
        string id PK
        string title
        string slug UK
        decimal originalPrice
        decimal discountedPrice
        int discountPercent
        int stockQuantity
        float ratingAverage
    }

    ORDER {
        string id PK
        string invoiceNumber UK
        string userId FK
        decimal totalAmount
        string orderStatus "5-step state"
    }

    REVIEW {
        string id PK
        string productId FK
        string userId FK
        int rating
        boolean isVerifiedPurchase "Strict check"
    }

    COUPON {
        string id PK
        string code UK
        int discountPercentage
        datetime expiresAt
    }
```

---

## 10. Infrastructure, Network & Security Topology

```mermaid
flowchart LR
    subgraph PublicInternet ["🌐 Public Internet"]
        Browser["User Browser / Client App"]
    end

    subgraph CloudflareEdge ["☁️ Edge CDN & Security"]
        WAF["Web Application Firewall (WAF)"]
        DDoS["DDoS Mitigation"]
        SSL["TLS 1.3 Termination"]
    end

    subgraph VercelCloud ["🚀 Compute Cluster (Next.js 15 Standalone)"]
        StaticAssets["Edge Static Cache (/public, banners, avatars)"]
        NodeServer["Node.js Server Runtime (SSR & Route Handlers)"]
        CronJobs["Scheduled Jobs (Coupon expiry, stock sweep)"]
    end

    subgraph DataVPC ["🔒 Private VPC & Data Tier"]
        PG["Managed PostgreSQL 16 (Primary)"]
        PG_Replica["Read Replica (Analytics & Catalog queries)"]
        RedisCluster["Redis Cluster (OTP, Session tokens, Rate limits)"]
    end

    subgraph ExternalAPIs ["🔌 External Cloud Integrations"]
        GeminiCloud["Google Gemini AI API (Flash 2.5)"]
        GmailService["Gmail SMTP / Nodemailer"]
        S3Bucket["Cloud Storage (Images & PDF Invoices)"]
    end

    Browser --> SSL
    SSL --> WAF
    WAF --> DDoS
    DDoS --> StaticAssets
    DDoS --> NodeServer

    NodeServer --> PG
    NodeServer --> PG_Replica
    NodeServer --> RedisCluster

    NodeServer --> GeminiCloud
    NodeServer --> GmailService
    NodeServer --> S3Bucket
```

---

*This concludes the complete, official Technical Architecture Specification and Flow Diagrams for **E-Shop**.*
