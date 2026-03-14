# 📦 Core Inventory — Inventory Management System

A modular Inventory Management System (IMS) built with **Django** that digitizes and streamlines all stock-related operations. Replace manual registers, Excel sheets, and scattered tracking methods with a centralized, real-time web app.

---

## ✨ Features

### 🔐 Authentication
- User signup / login / logout
- Role-based users: **Inventory Manager** & **Warehouse Staff**
- OTP-based password reset via **email** (Gmail SMTP)
- Profile management

### 📊 Dashboard
- KPI cards: Total Products, Low Stock, Out of Stock, Pending Receipts, Pending Deliveries, Scheduled Transfers
- **Document Explorer** — filter all operations by type, status, and warehouse
- **Stock Alerts** — real-time table of low stock and out-of-stock products
- **Activity Feed** — recent stock movements with timestamps
- Quick action buttons for common operations

### 📦 Product Management
- Full CRUD for products with SKU, category, and unit of measure
- Search & filter by name, SKU, or category
- Product detail with stock-per-location breakdown and recent move history
- Initial stock setup during product creation
- Category management (CRUD)
- Reorder rules — set min quantity and reorder quantity per product/warehouse

### 🏭 Warehouse & Locations
- Create warehouses with addresses
- Add multiple locations per warehouse (e.g., Rack A, Shelf 1)
- Nested warehouse/location display

### 📥 Receipts (Incoming Stock)
- Create receipts with product lines (inline formset)
- Validate → auto-increases stock at destination + creates ledger entry
- Cancel option for draft receipts

### 📤 Delivery Orders (Outgoing Stock)
- Create delivery orders with product lines
- Validate → checks stock availability → auto-decreases stock + ledger entry
- Prevents delivery if insufficient stock

### 🔄 Internal Transfers
- Move stock between locations within warehouses
- Validate → decreases source, increases destination + ledger entry
- Validation prevents same-location transfers

### ⚖️ Stock Adjustments
- Enter physical count → system auto-calculates difference
- Auto-corrects stock level and logs the adjustment
- Reason tracking (damage, theft, correction, etc.)

### 📋 Move History (Stock Ledger)
- Complete audit trail of all stock movements
- Filter by type (receipt, delivery, transfer, adjustment)
- Search by product name, SKU, or reference

---

## 🛠️ Tech Stack

| Layer           | Technology                |
|-----------------|---------------------------|
| Backend         | Django 6.0.3              |
| Database        | PostgreSQL                |
| Frontend        | HTML, CSS, JavaScript     |
| Email           | Gmail SMTP (App Password) |
| Icons           | Font Awesome 6            |
| Package Manager | uv                        |
| Env Management  | python-dotenv             |

---

## 🚀 Getting Started

### Prerequisites
- **Python 3.10+**
- **PostgreSQL** (with pgAdmin or CLI access)
- **Git**
- **uv** — fast Python package & project manager

### 1. Install uv

If you don't have `uv` installed:

```bash
# Windows (PowerShell)
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"

# macOS / Linux
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Verify installation:
```bash
uv --version
```

### 2. Clone the repository

```bash
git clone https://github.com/your-username/Odoo-Core-Inventory.git
cd Odoo-Core-Inventory
```

### 3. Sync dependencies (creates venv + installs everything)

```bash
uv sync
```

This single command:
- Creates a `.venv` virtual environment (if it doesn't exist)
- Reads `pyproject.toml` and `uv.lock`
- Installs all dependencies at the exact locked versions

> **No activation needed!** Just prefix commands with `uv run` and it auto-uses the venv.

### 4. Set up PostgreSQL

Create the database using **pgAdmin** (GUI) or the CLI:

```sql
-- In pgAdmin Query Tool or psql
CREATE DATABASE core_inventory_db;
```

### 5. Configure environment variables

Create a `.env` file in the **project root** (same level as `README.md`):

```env
# Django
SECRET_KEY=django-insecure-your-secret-key-here
DEBUG=True

# Database
DB_NAME=core_inventory_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432

# Email (Gmail SMTP)
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

> **Gmail App Password:** Go to [Google Account → Security → 2-Step Verification → App passwords](https://myaccount.google.com/apppasswords) and generate one. Use that 16-character password (with spaces) for `EMAIL_HOST_PASSWORD`.

> ⚠️ The `.env` file is already in `.gitignore` — your credentials won't be committed.

### 6. Run migrations

```bash
cd core_inventory
uv run python manage.py migrate
```

### 7. Create superuser

```bash
uv run python manage.py createsuperuser
```

### 8. Start the development server

```bash
uv run python manage.py runserver
```

Visit **http://127.0.0.1:8000/** 🎉

---

## 🔄 Application Workflow

Here's how the app is used end-to-end:

### Step 1: Initial Setup
```
Sign Up → Create Warehouse → Add Locations → Create Categories → Add Products (with initial stock)
```

1. **Sign up** with your role (Inventory Manager or Warehouse Staff)
2. Go to **Warehouses** → create your warehouse (e.g., "Main Warehouse")
3. **Add locations** inside the warehouse (e.g., "Receiving Dock", "Rack A", "Shelf B")
4. Go to **Categories** → create product categories (e.g., "Electronics", "Raw Materials")
5. Go to **Products** → create products with SKU, category, and optionally set initial stock at a location

### Step 2: Receiving Stock (Receipts)
```
Supplier ships goods → Create Receipt → Add product lines → Validate → Stock increases
```

1. Go to **Receipts** → click **New Receipt**
2. Enter supplier name, destination location, and scheduled date
3. Add product lines (which products and how many)
4. Click **Validate** → stock automatically increases at that location
5. A **Stock Move** entry is created in the ledger

### Step 3: Shipping Stock (Deliveries)
```
Customer orders → Create Delivery → Add product lines → Validate → Stock decreases
```

1. Go to **Deliveries** → click **New Delivery**
2. Enter customer name and source location
3. Add product lines
4. Click **Validate** → system checks if there's enough stock
   - ✅ Sufficient → stock decreases, move logged
   - ❌ Insufficient → error, delivery blocked

### Step 4: Moving Stock (Internal Transfers)
```
Need to reorganize? → Create Transfer → From Location A → To Location B → Validate
```

1. Go to **Transfers** → click **New Transfer**
2. Select product, source location, destination location, and quantity
3. **Validate** → stock moves from one location to another

### Step 5: Physical Count (Stock Adjustments)
```
Count inventory → Create Adjustment → Enter counted qty → System auto-corrects
```

1. Go to **Adjustments** → click **New Adjustment**
2. Select product and location
3. Enter the **counted quantity** (what you physically counted)
4. System calculates: `difference = counted − recorded`
5. Stock is auto-corrected and the difference is logged

### Step 6: Monitor Everything
```
Dashboard → KPIs + Stock Alerts + Document Explorer + Activity Feed
```

- **Dashboard** shows real-time KPIs and alerts
- **Move History** provides a full audit trail of every stock change
- **Reorder Rules** alert you when stock drops below thresholds

---

## 📁 Project Structure

```
Odoo-Core-Inventory/
├── .env                    # Secrets (git-ignored)
├── .gitignore
├── README.md
├── ACTIONS.md              # Detailed user roles & actions guide
└── core_inventory/         # Django project root
    ├── manage.py
    ├── core_inventory/     # Project settings
    │   ├── settings.py     # Django config (reads from .env)
    │   ├── urls.py         # Root URL routing
    │   └── wsgi.py
    ├── accounts/           # Authentication app
    │   ├── models.py       # Custom User (role, phone)
    │   ├── views.py        # signup, login, logout, OTP, profile
    │   ├── forms.py        # Auth forms
    │   ├── otp.py          # OTP generate / verify / clear
    │   └── urls.py
    ├── inventory/          # Core inventory app
    │   ├── models.py       # 14 models (Product, Warehouse, Receipt, etc.)
    │   ├── views.py        # 30+ views (CRUD + operations + validation)
    │   ├── forms.py        # All forms + inline formsets
    │   ├── admin.py        # Django admin registration
    │   └── urls.py
    ├── dashboard/          # Dashboard app
    │   ├── views.py        # KPIs, filters, alerts, activity
    │   └── urls.py
    ├── templates/          # HTML templates
    │   ├── base.html       # Main layout (sidebar + topbar)
    │   ├── auth_base.html  # Auth page layout
    │   ├── accounts/       # signup, login, OTP, profile
    │   ├── dashboard/      # Dashboard with KPIs & filters
    │   └── inventory/      # Product, warehouse, operations templates
    └── static/
        ├── css/style.css   # Design system (dark theme, 1000+ lines)
        └── js/main.js      # Sidebar toggle, notifications
```

---

## 🔧 uv Quick Reference

This project uses **uv** as the package manager with a lockfile (`uv.lock`).

```bash
# Sync all dependencies from lockfile (also creates .venv)
uv sync

# Add a new package (updates pyproject.toml + uv.lock)
uv add <package-name>

# Remove a package
uv remove <package-name>

# Run a command inside the venv (without activating)
uv run python manage.py runserver

# Update all packages to latest compatible versions
uv lock --upgrade
uv sync

# List installed packages
uv pip list
```

> **Why uv?** It's 10-100x faster than `pip`. With `uv.lock`, every developer gets the exact same dependency versions — reproducible builds out of the box.

---

## 🔑 Key URLs

| Page               | URL                              |
|--------------------|----------------------------------|
| Dashboard          | `/`                              |
| Signup             | `/accounts/signup/`              |
| Login              | `/accounts/login/`               |
| Password Reset     | `/accounts/otp/request/`         |
| Profile            | `/accounts/profile/`             |
| Products           | `/inventory/products/`           |
| Categories         | `/inventory/categories/`         |
| Warehouses         | `/inventory/warehouses/`         |
| Receipts           | `/inventory/receipts/`           |
| Deliveries         | `/inventory/deliveries/`         |
| Transfers          | `/inventory/transfers/`          |
| Adjustments        | `/inventory/adjustments/`        |
| Move History       | `/inventory/moves/`              |
| Reorder Rules      | `/inventory/reorder-rules/`      |
| Django Admin       | `/admin/`                        |

---

## 👥 Target Users

- **Inventory Managers** — Manage incoming & outgoing stock, set reorder rules, monitor KPIs
- **Warehouse Staff** — Perform transfers, picking, shelving, physical counts

For a detailed breakdown of every action each role can perform, see **[ACTIONS.md](ACTIONS.md)**.

---

## 📄 License

This project is for educational and internal use.
