import { VALUES, CONTACT_EMAIL, MIN_AGE } from "./config";

export const FAQ: { q: string; a: string }[] = [
  {
    q: "How fast is delivery?",
    a: `Once your payment is confirmed and your Steam account can receive trades, we send your skins by Steam trade offer — ${VALUES.deliveryEstimate}. This is an estimate: payment checks, Steam outages or account restrictions can cause delays. Delivery is complete when you accept the trade in Steam. If your order has not arrived within 24 hours, email ${CONTACT_EMAIL} with your order reference — you can also contact us sooner.`,
  },
  {
    q: "Are these authentic Rust skins?",
    a: "Yes. rust-skins.com sells authentic Rust skins — weapon finishes, apparel, base, deployables and tools. Every skin is delivered to your Steam inventory via a standard trade offer. We are not affiliated with Valve or Facepunch Studios.",
  },
  {
    q: "Who can buy?",
    a: `You must be at least ${MIN_AGE} and legally able to enter into a contract. We do not serve customers in the restricted countries listed in our Terms & Conditions.`,
  },
  {
    q: "How do I link my Steam account?",
    a: "Before you can buy, sign in through Steam on your account page and paste your Steam trade URL. We pull your Steam nickname and avatar automatically and deliver every skin to that account. We never need your Steam password or Steam Guard codes.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept Visa and Mastercard, with purchases in EUR, GBP or USD. Payments are handled by third-party payment service providers. The total, currency and any charges are shown before you pay.",
  },
  {
    q: "Can I get a refund?",
    a: `If a skin is not delivered, is incorrect or only part of an order arrives, contact us and we will fix it or refund you. Where the law gives you a cooling-off right, it is explained in our Refund & Cancellation Policy. We do not offer refunds for a change of mind after a correct skin has been delivered. Email ${CONTACT_EMAIL} — we aim to give an ${VALUES.supportResponse}.`,
  },
  {
    q: "Is there a fee at checkout?",
    a: "No. The price you see is the price you pay. Tax is included and there is no service fee added at checkout. Your bank may apply its own currency-conversion charges.",
  },
  {
    q: "How do I contact support?",
    a: `Email us at ${CONTACT_EMAIL} about any order, delivery, refund or account question. We aim to give an ${VALUES.supportResponse}.`,
  },
  {
    q: "How does the store wallet work?",
    a: `You can top up your rust-skins.com balance and use it to purchase skins. Unused paid balance can be refunded at any time — email ${CONTACT_EMAIL} with your account email and top-up reference. Refunds normally go back to the original payment method.`,
  },
  {
    q: "What do the rarity colours mean?",
    a: "rust-skins.com sorts skins onto a colour rarity scale — from Common and Uncommon up through Rare and Mythical — so you can read a skin's tier at a glance.",
  },
];
