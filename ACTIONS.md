# Core Inventory — User Roles & Actions Guide

## 👥 User Types

### 1. Inventory Manager
Manages the overall inventory — products, stock levels, reorder rules, and all incoming/outgoing operations.

| Area | Actions |
|---|---|
| **Products** | Create, edit, delete products and categories |
| **Reorder Rules** | Set minimum stock thresholds per product/warehouse |
| **Receipts** | Create receipts from suppliers, validate to add stock |
| **Deliveries** | Create delivery orders for customers, validate to deduct stock |
| **Transfers** | Move stock between warehouse locations |
| **Adjustments** | Correct stock after physical counts |
| **Dashboard** | View KPIs, filter operations, monitor stock alerts |
| **Move History** | Audit all stock movements across the system |

### 2. Warehouse Staff
Handles day-to-day physical operations — picking, shelving, counting, and transferring stock.

| Area | Actions |
|---|---|
| **Receipts** | Receive goods, validate incoming shipments |
| **Deliveries** | Pick and pack items, validate outgoing orders |
| **Transfers** | Move products between locations (e.g., Rack A → Shelf B) |
| **Adjustments** | Perform physical counts and record discrepancies |
| **Products** | View product details and stock levels per location |
| **Move History** | Track recent moves related to their operations |

---

## 🔐 Authentication Actions

| Action | URL | Description |
|---|---|---|
| **Sign Up** | `/accounts/signup/` | Create a new account (username, email, name, role, phone, password) |
| **Log In** | `/accounts/login/` | Authenticate with username + password |
| **Log Out** | `/accounts/logout/` | End session, redirect to login |
| **Request OTP** | `/accounts/otp/request/` | Enter email → receive a 6-digit OTP via Gmail |
| **Verify OTP** | `/accounts/otp/verify/` | Enter OTP to prove identity |
| **Reset Password** | `/accounts/reset-password/` | Set a new password after OTP verification |
| **Edit Profile** | `/accounts/profile/` | Update first name, last name, email, phone |

---

## 📊 Dashboard Actions

| Action | How |
|---|---|
| **View KPIs** | See total products, low stock, out of stock, pending receipts/deliveries, scheduled transfers |
| **Filter Documents** | Use Document Explorer — filter by type (receipt/delivery/transfer/adjustment), status (draft/waiting/ready/done/cancelled), warehouse |
| **View Stock Alerts** | Table of products below reorder threshold (low stock + out of stock) |
| **Quick Actions** | One-click buttons to create receipt, delivery, transfer, product, adjustment, or view history |
| **Recent Activity** | Feed of the last 8 stock movements with timestamps |

---

## 📦 Product Management Actions

| Action | URL | Description |
|---|---|---|
| **List Products** | `/inventory/products/` | View all products, search by name/SKU, filter by category |
| **Create Product** | `/inventory/products/create/` | Add product with name, SKU, category, UoM + optional initial stock at a location |
| **View Product** | `/inventory/products/<id>/` | See details, stock-per-location breakdown, and last 20 stock moves |
| **Edit Product** | `/inventory/products/<id>/edit/` | Update product details |
| **Delete Product** | `/inventory/products/<id>/delete/` | Remove product (confirmation required) |

### Categories
| Action | URL | Description |
|---|---|---|
| **List** | `/inventory/categories/` | View all categories |
| **Create / Edit / Delete** | `/inventory/categories/create/` | Manage product categories |

### Reorder Rules
| Action | URL | Description |
|---|---|---|
| **List** | `/inventory/reorder-rules/` | View all reorder rules |
| **Create** | `/inventory/reorder-rules/create/` | Set min quantity + reorder quantity per product/warehouse |
| **Edit / Delete** | Via list page | Modify or remove rules |

---

## 🏭 Warehouse & Location Actions

| Action | URL | Description |
|---|---|---|
| **List Warehouses** | `/inventory/warehouses/` | View warehouses with nested locations |
| **Create Warehouse** | `/inventory/warehouses/create/` | Add name + address |
| **Edit / Delete Warehouse** | Via list page | Modify or remove |
| **Create Location** | `/inventory/locations/create/` | Add a location to a warehouse (e.g., "Rack A") |
| **Delete Location** | Via warehouse list | Remove a location |

---

## 📥 Receipt Actions (Incoming Stock)

| Action | URL | What Happens |
|---|---|---|
| **List Receipts** | `/inventory/receipts/` | View all, filter by status |
| **Create Receipt** | `/inventory/receipts/create/` | Add reference, supplier, destination location, date + product lines (product + qty) |
| **View Receipt** | `/inventory/receipts/<id>/` | See receipt details and product lines |
| **Validate** | Button on detail page | Stock **increases** at destination → move logged in ledger |
| **Cancel** | Button on detail page | Marks as cancelled, no stock change |

---

## 📤 Delivery Order Actions (Outgoing Stock)

| Action | URL | What Happens |
|---|---|---|
| **List Deliveries** | `/inventory/deliveries/` | View all, filter by status |
| **Create Delivery** | `/inventory/deliveries/create/` | Add reference, customer, source location, date + product lines |
| **View Delivery** | `/inventory/deliveries/<id>/` | See details and product lines |
| **Validate** | Button on detail page | **Checks availability** first → stock **decreases** → move logged |
| **Cancel** | Button on detail page | Marks as cancelled, no stock change |

> ⚠️ Validation **fails** if there isn't enough stock at the source location.

---

## 🔄 Internal Transfer Actions

| Action | URL | What Happens |
|---|---|---|
| **List Transfers** | `/inventory/transfers/` | View all, filter by status |
| **Create Transfer** | `/inventory/transfers/create/` | Select product, from location → to location, quantity |
| **View Transfer** | `/inventory/transfers/<id>/` | See transfer details |
| **Validate** | Button on detail page | **Decreases source** + **increases destination** → move logged |
| **Cancel** | Button on detail page | Marks as cancelled, no stock change |

> ⚠️ Source and destination locations cannot be the same.

---

## ⚖️ Stock Adjustment Actions

| Action | URL | What Happens |
|---|---|---|
| **List Adjustments** | `/inventory/adjustments/` | View all with recorded vs counted and difference |
| **Create Adjustment** | `/inventory/adjustments/create/` | Select product + location, enter counted quantity, select reason |

**Auto-correction:** System computes `difference = counted − recorded`, updates stock to match count, and logs the adjustment in the ledger.

**Reasons:** Damaged Goods, Inventory Correction, Loss/Shrinkage, Other.

---

## 📋 Move History (Stock Ledger)

| Action | URL | Description |
|---|---|---|
| **View All Moves** | `/inventory/moves/` | Full audit trail of every stock change |
| **Filter by Type** | Dropdown | Receipt, Delivery, Transfer, Adjustment |
| **Search** | Text input | Search by product name, SKU, or reference |

Each entry shows: date, type, reference, product, from/to location, quantity, and who performed it.
