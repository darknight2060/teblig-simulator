import { getBotResponse } from "@/botLogic";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Sadece POST istekleri kabul edilir." });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Mesaj boş olamaz." });
  }

  try {
    const reply = await getBotResponse(message);
    res.status(200).json({ reply });
  } catch (err) {
    console.error("Mesaj hatası:", err);
    res.status(500).json({ error: "Yanıt alınamadı." });
  }
}
