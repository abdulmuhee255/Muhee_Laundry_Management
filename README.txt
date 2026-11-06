LAUNDRY SERVICE MANAGEMENT SYSTEM

SETUP
1. Run database.sql in MySQL Workbench.
2. Open this folder in VS Code.
3. Run: npm install
4. In app.js, change password: "root" to your actual MySQL password.
5. Run: npm start
6. Open: http://localhost:3000/

FILES
app.js - Node.js / Express backend
database.sql - Creates database and four tables, and inserts sample services
public/index.html - Dashboard
public/customers.html - Add and view customers
public/services.html - View laundry services
public/newOrder.html - Create laundry orders
public/orders.html - View all orders
public/updateOrder.html - Update order status
public/payments.html - Record and view payments

Keep app.js in the main project folder and all HTML files inside public.
Order total is calculated by the server: service price per kg x clothes weight.
Change the MySQL password in app.js to match your local setup.
This is an academic CRUD project and does not include login or role-based access control.
