import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "vetementscart",
  isDev: process.env.NODE_ENV !== "production",
});
