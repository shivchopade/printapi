import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { Cashfree } from 'cashfree-pg';

dotenv.config();

if (!process.env.CASHFREE_ENV || !process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
  throw new Error("Cashfree environment variables are not set properly in .env");
}

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

const cashfree = new Cashfree(
  process.env.CASHFREE_ENV,
  process.env.CASHFREE_APP_ID,
  process.env.CASHFREE_SECRET_KEY
);

app.post('/create_order', async (req, res) => {
  const { order_amount, order_id, customer_id, customer_phone, return_url } = req.body;

  const request = {
    order_amount,
    order_currency: 'INR',
    order_id,
    customer_details: {
      customer_id,
      customer_phone
    },
    order_meta: {
      return_url
    }
  };

  try {
    const response = await cashfree.PGCreateOrder(request);
    res.json(response.data);
  } catch (error) {
    const errData = error?.response?.data || error?.message || error;
    console.error('Error creating order:', errData);
    res.status(500).json({ error: 'Failed to create order', details: errData });
  }
});

app.listen(port, () => {
  console.log(`✅ Backend server listening at http://localhost:${port}`);
});
