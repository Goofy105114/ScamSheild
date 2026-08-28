export interface DemoExample {
  id: string;
  title: string;
  category: string;
  type: "text" | "url";
  content: string;
}

export const DEMO_EXAMPLES: DemoExample[] = [
  {
    id: "job-scam",
    title: "Work-From-Home Job Offer",
    category: "Job Scam",
    type: "text",
    content:
      "Congratulations! You have been selected for a ₹75,000 work-from-home position. To confirm your position, pay ₹1,499 registration charges within 10 minutes using the link below. No experience needed, easy money guaranteed.",
  },
  {
    id: "banking-phishing",
    title: "Bank Account Suspension Alert",
    category: "Banking Scam",
    type: "text",
    content:
      "Dear Customer, your account will be suspended within 24 hours due to suspicious activity detected. Verify your account immediately by confirming your net banking password and OTP to avoid permanent deactivation. Do not share this with anyone.",
  },
  {
    id: "delivery-scam",
    title: "Delivery Customs Fee",
    category: "Delivery Scam",
    type: "text",
    content:
      "Your package is held at customs due to an unpaid customs duty of $4.99. Please pay immediately within 12 hours to reschedule your delivery, or the shipment will be returned to sender.",
  },
  {
    id: "investment-scam",
    title: "Guaranteed Crypto Returns",
    category: "Investment Scam",
    type: "text",
    content:
      "Exclusive investment opportunity! Double your money in 7 days with guaranteed returns of 300%. Risk-free investment backed by our crypto trading algorithm. Limited slots available, act now before this offer expires.",
  },
  {
    id: "account-takeover",
    title: "Suspicious Login Verification",
    category: "Account Takeover",
    type: "text",
    content:
      "We detected suspicious activity on your account from a new device. Confirm your identity now by replying with the verification code sent to your phone, or your account will be permanently locked within 30 minutes.",
  },
  {
    id: "lookalike-url",
    title: "Lookalike Banking Link",
    category: "Phishing",
    type: "url",
    content: "http://secure-login.icicibank.verify-account.top/session?token=abc123",
  },
];
