import  axios from  "axios";
import dotenv from "dotenv";

dotenv.config();
const baseURL = process.env.PAYMOB_API_URL
  ? process.env.PAYMOB_API_URL
  : "https://accept.paymob.com/api";


export const createPayment = async (req, res) => {
  try {
    const { price, ticketId, quantity, paymentMethod, user } = req.body;

    const auth = await axios.post(`${baseURL}/auth/tokens`, {
      api_key: process.env.PAYMOB_API_KEY,
    });

    const token = auth.data.token;

    // 💳 2. Create Order
    const order = await axios.post(`${baseURL}/ecommerce/orders`, {
      auth_token: token,
      delivery_needed: false,
      amount_cents: (price * 100).toString(), 
      currency: "EGP",
      items: [
        {
          name: `Ticket #${ticketId}`,
          amount_cents: parseInt(price * 100).toString(),
          quantity: quantity || 1,
        },
      ],
    });

    const orderId = order.data.id;

    let integrationId;
    if (paymentMethod === "wallet") {
      integrationId = process.env.PAYMOB_WALLET_INTEGRATION_ID;
    } else {
      integrationId = process.env.PAYMOB_CARD_INTEGRATION_ID;
    }

    // 🔑 3. Generate Payment Key
    const paymentKey = await axios.post(`${baseURL}/acceptance/payment_keys`, {
      auth_token: token,
      amount_cents: parseInt(price * 100).toString(),
      expiration: 3600,
      order_id: orderId,
      billing_data: {
        apartment: "NA",
        email: user.email,
        floor: "NA",
        first_name: user.firstName,
        street: "NA",
        building: "NA",
        phone_number: user.phone,
        shipping_method: "NA",
        postal_code: "NA",
        city: "Cairo",
        country: "EG",
        last_name: user.lastName,
        state: "Cairo",
      },
      currency: "EGP",
      integration_id: integrationId,
    });

    res.json({
      iframe_url: `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentKey.data.token}`,
    });
  } catch (err) {
    console.error(err.response?.data || err);
    res.status(500).json({ error: "Something went wrong" });
  }
};



