export const CONTACT_REPLY_TEMPLATES = [
  {
    id: "received",
    label: "Acknowledgement",
    body: "Thank you for your message. We've received it and will review it shortly.",
  },
  {
    id: "vote_help",
    label: "Voting help",
    body: "Thanks for reaching out. For voting, please visit our Vote page during an active voting period. If you're still having trouble, let us know which device and browser you're using.",
  },
  {
    id: "competition",
    label: "Competition enquiry",
    body: "Thanks for your interest in our competitions. You can find current competitions on the Competitions page. If your question is about a specific contest, please reply with the competition name.",
  },
  {
    id: "merch",
    label: "Merch / orders",
    body: "Thanks for contacting us about the store. Please include your order number if you have one, and we'll look into it as soon as possible.",
  },
] as const
