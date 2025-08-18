import { ChatOpenAI } from "@langchain/openai";
import { Event } from "../models/Event.js";
import Booking from "../models/Booking.js";
import { Ticket } from "../models/Ticket.js";

const model = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  apiKey: process.env.OPENAI_API_KEY,
});

export const chatBot = async (req, res) => {
  const { message } = req.body;

  try {
    let reply = "";

    if (message.toLowerCase().includes("اخر") && message.toLowerCase().includes("ايفينت")) {
      const lastEvent = await Event.findOne().sort({ date: -1 });
      reply = lastEvent
        ? `آخر إيفينت هو: ${lastEvent.name} بتاريخ ${lastEvent.date}`
        : "مافيش إيفينتات مسجلة حالياً.";
    }

    else if (message.toLowerCase().includes("كود") || message.toLowerCase().includes("تذكرة") || message.toLowerCase().includes("حجز")) {
      const codeMatch = message.match(/\b[A-Za-z0-9]+\b/);
      if (codeMatch) {
        const code = codeMatch[0];

        const booking = await Booking.findOne({ bookingCode: code });
        const ticket = await Ticket.findOne({ ticketCode: code });

        if (booking) {
          reply = `✅ فيه حجز بالكود ${code}`;
        } else if (ticket) {
          reply = `🎟️ التذكرة موجودة بالكود ${code} (النوع: ${ticket.type}, السعر: ${ticket.price} ${ticket.currency})`;
        } else {
          reply = `❌ مفيش بيانات مرتبطة بالكود ${code}`;
        }
      } else {
        reply = "من فضلك اكتب كود الحجز أو التذكرة للتحقق.";
      }
    }

    else {
      const response = await model.invoke(message);
      reply = response.content;
    }

    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "حدث خطأ في السيرفر" });
  }
};
