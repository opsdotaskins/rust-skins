import { VALUES, CONTACT_EMAIL } from "./config";

export const FAQ: { q: string; a: string }[] = [
  {
    q: "How fast is delivery?",
    a: `${VALUES.deliveryPromise}. Once your payment is confirmed, your Rust skins are delivered to your Steam inventory by trade offer in seconds — there is no waiting and nothing to ship.`,
  },
  {
    q: "Are these authentic Rust skins?",
    a: "Yes. Runevault sells authentic Rust skins — weapon finishes, apparel, base, deployables and tools. Every skin is delivered to your Steam inventory via a standard trade offer.",
  },
  {
    q: "How do I link my Steam account?",
    a: "Before you can buy, sign in through Steam on your account page and paste your Steam trade URL. We pull your Steam nickname and avatar automatically and deliver every skin to that account.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept Visa and Mastercard through a PCI DSS compliant payment process. Prices already include any applicable tax.",
  },
  {
    q: "Can I get a refund?",
    a: `You can request a refund within ${VALUES.refundWindowDays} days, subject to our Refund Policy. Because delivery is instant and digital, some conditions apply — see the policy for full details.`,
  },
  {
    q: "Is there a fee at checkout?",
    a: "No. The price you see is the price you pay. Tax is included and there is no service fee added at checkout.",
  },
  {
    q: "How do I contact support?",
    a: `Our support team is available ${VALUES.supportHours}. Email us at ${CONTACT_EMAIL} and we'll help you with any order, delivery or account question.`,
  },
  {
    q: "How does the store wallet work?",
    a: "You can top up your Runevault balance and use it to purchase skins instantly. Your transaction history records every top-up and purchase in your account.",
  },
  {
    q: "What do the rarity colours mean?",
    a: "Runevault sorts skins onto a colour rarity scale — from Common and Uncommon up through Rare and Mythical — so you can read a skin's tier at a glance.",
  },
];
