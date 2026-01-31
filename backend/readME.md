Based on the Barcode IMS requirements and pages we have designed, here is the recommended PostgreSQL Database Schema.
I have organized this by module (Inventory, Menu, Transfers, etc.) to match the pages.

1. Global / Users Module - This handles authentication and defining the locations. 

Table: branches
- id (PK, BigInt)
- name (String): e.g., "Restaurant Branch 1", "Resto Café" 
- type (String): e.g., "kitchen", "cafe_only" 
- address (String)

Table: users (Extends Django AbstractUser)
- id (PK, BigInt)
- username (String)
- password (String)
- role (String): "admin", "branch_manager", "staff" 
- branch_id (FK -> branches.id): Links a user to a specific location. // ADD THIS TO EXISTING SCHEMA

2. Inventory Module
￼
Table: categories
- id (PK, BigInt)
- name (String): "Raw Ingredients", "Packaging", "Prepared Food" 

Table: inventory_items (Master List)
- id (PK, BigInt)
- sku (String, Unique): e.g., "RM-001" 
- name (String): e.g., "Beef Sirloin", "Eco Bags"
- category_id (FK -> categories.id)
- uom (String): Unit of Measure (kg, pcs, L) 
- min_stock_level (Decimal): Threshold for alerts 

Table: stock_levels (The real-time count)
- id (PK, BigInt)
- branch_id (FK -> branches.id): Specific stock per branch 
- item_id (FK -> inventory_items.id)
- quantity (Decimal): Current available stock.
- last_updated (Timestamp)
- Table: stock_adjustments (Wastage Logs)
- id (PK, BigInt)
- stock_id (FK -> stock_levels.id)
- type (String): "wastage", "spoilage", "manual_correction" 
- quantity_change (Decimal): Negative for loss.
- reason (Text)
- date (Timestamp)

Menu & Recipes Module (BOM)
This connects "Sales" to "Inventory" for auto-deduction.
Table: menu_categories
- id (PK, BigInt)
- name (String): "Silog Express", "Beef Viands", "Cater to Go" 

Table: menu_items
- id (PK, BigInt)
- sku (String): Menu SKU e.g., "MN-BF-01" 
- name (String): "Beef Curry"
- menu_category_id (FK -> menu_categories.id)
- price (Decimal): Selling Price 
- is_available_cafe (Boolean): Defines if sold at Café.

Table: recipes (Bill of Materials)
- id (PK, BigInt)
- menu_item_id (FK -> menu_items.id)
- inventory_item_id (FK -> inventory_items.id): The raw 

ingredient link 
quantity_required (Decimal): Amount used per 1 order.

4. Transfers Module
Specifically for moving items from Kitchens to the Café.
Table: transfer_requests
- id (PK, BigInt)
- source_branch_id (FK -> branches.id): Where stock comes from (Kitchen) 
- dest_branch_id (FK -> branches.id): Where stock goes (Café) 
- status (String): "pending", "approved", "completed", "rejected" 
- requested_by (FK -> users.id)
- created_at (Timestamp)
- Table: transfer_items
- id (PK, BigInt)
- transfer_id (FK -> transfer_requests.id)
- item_id (FK -> inventory_items.id)
- quantity (Decimal)

5. Sales & Catering Module
Tracks what was sold to trigger the recipe logic.
Table: sales_orders
- id (PK, BigInt)
- branch_id (FK -> branches.id)
- order_date (Timestamp)
- total_amount (Decimal)
- type (String): "dine_in", "takeout", "catering"

Table: sales_items
- id (PK, BigInt)
- sales_id (FK -> sales_orders.id)
- menu_item_id (FK -> menu_items.id)
- quantity (Integer): How many ordered.

Table: catering_events (Extension for bulk orders)
- id (PK, BigInt)
- sales_id (FK -> sales_orders.id)
- client_name (String)
- event_date (Timestamp)
- status (String): "draft", "confirmed", "completed" 
- prep_branch_id (FK -> branches.id): Which kitchen is cooking.

6. Suppliers & Receiving Module
Tracks external deliveries.
Table: suppliers
- id (PK, BigInt)
- name (String): "Zamboanga Meat Market" 
- contact_info (String)

Table: deliveries
- id (PK, BigInt)
- supplier_id (FK -> suppliers.id)
- branch_id (FK -> branches.id)
- dr_number (String): Delivery Receipt #
- received_date (Date)

Table: delivery_items
- id (PK, BigInt)
- delivery_id (FK -> deliveries.id)
- item_id (FK -> inventory_items.id)
- quantity_received (Decimal)
- cost (Decimal)
 

There's a problem that keeps occuring at: 