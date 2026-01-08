import Stripe from 'stripe';
import paypal from '@paypal/checkout-server-sdk';
import Order from '../models/Order.js';
import Transaction from '../models/Transaction.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function paypalClient() {
  const environment = process.env.PAYPAL_MODE === 'production'
    ? new paypal.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
    : new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);
  
  return new paypal.core.PayPalHttpClient(environment);
}

export const createStripePaymentIntent = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100),
      currency: 'usd',
      metadata: {
        orderId: order._id.toString(),
        userId: req.user._id.toString()
      }
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const confirmStripePayment = async (req, res) => {
  try {
    const { paymentIntentId, orderId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      order.paymentStatus = 'completed';
      order.orderStatus = 'processing';
      order.paymentResult = {
        id: paymentIntent.id,
        status: paymentIntent.status,
        update_time: new Date().toISOString()
      };

      await order.save();

      await Transaction.create({
        user: order.user,
        order: order._id,
        amount: order.totalAmount,
        currency: 'USD',
        paymentMethod: 'card',
        paymentGateway: 'stripe',
        transactionId: paymentIntent.id,
        status: 'completed',
        paymentDetails: {
          paymentSource: 'stripe',
          cardLast4: paymentIntent.charges.data[0]?.payment_method_details?.card?.last4,
          cardBrand: paymentIntent.charges.data[0]?.payment_method_details?.card?.brand
        }
      });

      res.status(200).json({
        success: true,
        message: 'Payment confirmed successfully',
        order
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment not completed'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const createPayPalOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: order.totalAmount.toFixed(2)
        },
        description: `Digital Dudes Order #${order._id}`
      }],
      application_context: {
        brand_name: 'Digital Dudes',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: `${process.env.FRONTEND_URL}/payment/success`,
        cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`
      }
    });

    const paypalOrder = await paypalClient().execute(request);

    res.status(200).json({
      success: true,
      orderId: paypalOrder.result.id,
      approvalUrl: paypalOrder.result.links.find(link => link.rel === 'approve').href
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const capturePayPalOrder = async (req, res) => {
  try {
    const { paypalOrderId, orderId } = req.body;

    const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
    request.requestBody({});

    const capture = await paypalClient().execute(request);

    if (capture.result.status === 'COMPLETED') {
      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      order.paymentStatus = 'completed';
      order.orderStatus = 'processing';
      order.paymentResult = {
        id: capture.result.id,
        status: capture.result.status,
        update_time: capture.result.update_time,
        email_address: capture.result.payer.email_address
      };

      await order.save();

      await Transaction.create({
        user: order.user,
        order: order._id,
        amount: order.totalAmount,
        currency: 'USD',
        paymentMethod: 'paypal',
        paymentGateway: 'paypal',
        transactionId: capture.result.id,
        status: 'completed',
        paymentDetails: {
          payerId: capture.result.payer.payer_id,
          payerEmail: capture.result.payer.email_address,
          paymentSource: 'paypal'
        }
      });

      res.status(200).json({
        success: true,
        message: 'Payment captured successfully',
        order
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment not completed'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getStripeConfig = async (req, res) => {
  res.status(200).json({
    success: true,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
  });
};

export const getPayPalConfig = async (req, res) => {
  res.status(200).json({
    success: true,
    clientId: process.env.PAYPAL_CLIENT_ID
  });
};
