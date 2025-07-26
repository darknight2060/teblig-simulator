import { initializeChat } from "@/botLogic";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Sadece POST istekleri kabul edilir." });
  }

  const { character, tone } = req.body;

  if (!character || !tone) {
    return res.status(400).json({ error: "Karakter ve üslup belirtilmeli." });
  }

  try {
    await initializeChat(character, tone);
    res.status(200).json({ message: `${character} karakteri ve ${tone} üslubu seçildi.` });
  } catch (err) {
    console.error("Başlatma hatası:", err);
    res.status(500).json({ error: "Sohbet başlatılamadı." });
  }
}
