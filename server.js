import express from 'express';
import bodyParser from 'body-parser';
import { Cashfree } from 'cashfree-pg';
require('dotenv').config();


const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(express.json());

// Enable CORS for all origins, you might want to restrict this in production
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

// Cashfree Configuration

const cashfree = new Cashfree(
  process.env.CASHFREE_ENV,
  process.env.CASHFREE_APP_ID,
  process.env.CASHFREE_SECRET_KEY
);


app.post('/create_order', async (req, res) => {
  const { order_amount, order_id, customer_id, customer_phone, return_url } = req.body;

  const request = {
    "order_amount": order_amount,
    "order_currency": "INR",
    "order_id": order_id,
    "customer_details": {
      "customer_id": customer_id,
      "customer_phone": customer_phone
    },
    "order_meta": {
      "return_url": return_url
    }
  };

  try {
    const response = await cashfree.PGCreateOrder(request);
    res.json(response.data);
  } catch (error) {
    console.error('Error creating order:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
