const express = require("express");
const mysql = require("mysql8");
const app = express();
app.use(express.json());
app.use(express.static("public"));

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root", // Change this to your MySQL password
    database: "laundry_service"
});
db.connect(err => {
    if (err) { console.log("MySQL connection failed:", err.message); return; }
    console.log("Connected to MySQL");
});

// List customers
app.get("/customers", (req,res) => db.query("SELECT * FROM customers ORDER BY customer_id",
    (err,rows) => err ? res.status(500).send(err.message) : res.json(rows)));

// Add customer
app.post("/customers", (req,res) => {
    const {name,phone,email,address}=req.body;
    if(!name || !phone) return res.status(400).send("Customer name and phone are required.");
    db.query("INSERT INTO customers(name,phone,email,address) VALUES(?,?,?,?)",
        [name,phone,email||null,address||null],
        err => err ? res.status(500).send(err.message) : res.send("Customer Added Successfully"));
});

// List services
app.get("/services", (req,res) => db.query("SELECT * FROM services ORDER BY service_id",
    (err,rows) => err ? res.status(500).send(err.message) : res.json(rows)));

// Create order and calculate total from service price x clothes weight
app.post("/orders", (req,res) => {
    const {customer_id,service_id,clothes_weight,order_date,delivery_date}=req.body;
    if(!customer_id || !service_id || !clothes_weight || !order_date || !delivery_date)
        return res.status(400).send("All order fields are required.");
    if(Number(clothes_weight)<=0) return res.status(400).send("Weight must be greater than zero.");
    if(delivery_date<order_date) return res.status(400).send("Delivery date cannot be before order date.");
    db.query("SELECT price_per_kg FROM services WHERE service_id=?",[service_id],(err,rows)=>{
        if(err) return res.status(500).send(err.message);
        if(!rows.length) return res.status(400).send("Service not found.");
        const total=Number(rows[0].price_per_kg)*Number(clothes_weight);
        db.query("INSERT INTO orders(customer_id,service_id,clothes_weight,order_date,delivery_date,total_amount,status) VALUES(?,?,?,?,?,?,'Received')",
            [customer_id,service_id,clothes_weight,order_date,delivery_date,total.toFixed(2)],
            e=>e ? res.status(500).send(e.message) : res.send("Order Created Successfully. Total: ₹"+total.toFixed(2)));
    });
});

// List orders with customer and service names
app.get("/orders", (req,res) => db.query(
    `SELECT o.*,c.name AS customer_name,s.service_name
     FROM orders o JOIN customers c ON o.customer_id=c.customer_id
     JOIN services s ON o.service_id=s.service_id ORDER BY o.order_id DESC`,
    (err,rows) => err ? res.status(500).send(err.message) : res.json(rows)));

// Update order status
app.put("/orders/:id/status", (req,res) => {
    const allowed=["Received","Washing","Ironing","Dry Cleaning","Ready for Delivery","Delivered","Cancelled"];
    const {status}=req.body;
    if(!allowed.includes(status)) return res.status(400).send("Invalid order status.");
    db.query("UPDATE orders SET status=? WHERE order_id=?",[status,req.params.id],(err,result)=>{
        if(err) return res.status(500).send(err.message);
        if(!result.affectedRows) return res.status(404).send("Order Not Found");
        res.send("Order Status Updated Successfully");
    });
});

// Add payment
app.post("/payments", (req,res) => {
    const {order_id,amount,payment_date,payment_method,status}=req.body;
    if(!order_id || !amount || !payment_date || !payment_method || !status)
        return res.status(400).send("All payment fields are required.");
    if(Number(amount)<=0) return res.status(400).send("Payment amount must be greater than zero.");
    if(!["Paid","Pending"].includes(status)) return res.status(400).send("Invalid payment status.");
    db.query("INSERT INTO payments(order_id,amount,payment_date,payment_method,status) VALUES(?,?,?,?,?)",
        [order_id,amount,payment_date,payment_method,status],
        err=>err ? res.status(500).send(err.message) : res.send("Payment Record Saved Successfully"));
});

// List payments
app.get("/payments", (req,res) => db.query(
    `SELECT p.*,c.name AS customer_name FROM payments p
     JOIN orders o ON p.order_id=o.order_id
     JOIN customers c ON o.customer_id=c.customer_id ORDER BY p.payment_id DESC`,
    (err,rows) => err ? res.status(500).send(err.message) : res.json(rows)));

app.listen(3000,()=>console.log("Server running at http://localhost:3000"));
