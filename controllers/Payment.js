import SSLCommerzPayment from "sslcommerz";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { User } from "../models/User.js";
import Stripe from "stripe";
import { Payment } from "../models/Payment.js";

const stripe = new Stripe("sk_test_51LlypyFAN2w87ew5537wKXCQIXz3pyucbZVA0HfDcMZsMGOKFbRbCw0no2VrnEYwGJ52abB24yJ2NPMJlRdExap600bZD5iUt3");
export const buySubscription = catchAsyncError(async (req, res, next) => {
  const {name,email,priceId,paymentMethod} = req.body
  const user = await User.findById(req.user._id);
  if (user.role === "admin")
  return next(new ErrorHandler("Admin can't buy a Subscription"));
  const customer = await stripe.customers.create({
    name:user.name,
    email:user.email,
    payment_method:paymentMethod,
    invoice_settings: {
      default_payment_method: paymentMethod,
    },
  });
  
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: process.env.STRIPE_PLAN_ID }],
    payment_settings: {
      payment_method_options: {
        card: {
          request_three_d_secure: 'automatic',
        },
      },
      payment_method_types: ['card'],
      save_default_payment_method: 'on_subscription',
    },
    expand: ['latest_invoice.payment_intent'],
  });
  user.subscription.id = subscription.id;
  user.subscription.status = subscription.status;
  await user.save();
  await Payment.create({
    customerId:customer.id,
    payment_intent:subscription.latest_invoice.payment_intent.id,
    subscriptionId:subscription.id,
    created:Date.now(),
  })
  res.status(201).json({
    success:true,
    subscriptionId:subscription.id,
    message:"Subscribed successfully."
  })
});
export const cancelSubscription = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const subscriptionId = user.subscription.id
  let refund = false
   await stripe.subscriptions.del(subscriptionId)
 
  const payment = await Payment.findOne({
    subscriptionId
  });
  const gap = Date.now() - payment.created;

  const refundTime = process.env.REFUND_DAYS * 24 * 60 * 60 * 1000;
  if (refundTime > gap) {
    await stripe.refunds.create({
      payment_intent:payment.payment_intent
    })
    refund = true;
  }
  await payment.remove();
  user.subscription.id = undefined;
  user.subscription.status = undefined;
  await user.save();
  res.status(200).json({
    success: true,
    message: refund
    ? "Subscription cancelled, You will receive full refund within 7 days."
    : "Subscription cancelled, No refund initiated as subscription was cancelled after 7 days.",
  });
});