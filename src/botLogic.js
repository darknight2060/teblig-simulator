const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_TOKEN);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

let chat = null;

// Karakterin kimliğini ve dünya görüşünü içeren prompt
async function initializeChat(opponentType = "ateist", tone = "sakin") {
  const characterPrompt = {
    ateist: "İnançsız bir ateist gibi davran...",
    hristiyan: "Dindar bir Hristiyan gibi davran...",
    budist: "Budist gibi davran...",
    deist: "Deist gibi davran...",
  };

  const tonePrompt = {
    agresif: `Kullanıcı inancı hakkında bir şeyler savunmaya çalıştığında, biraz alaycı ama yine de mantıklı yanıtlar ver. Fazla ukala olma ama keskin bir şekilde tepki ver. "Gerçekten mi?", "Bunu neye dayanarak söylüyorsun?" tarzı çıkışlar yapabilirsin. Yanıtlarının rahat ama biraz da zeki ve sert olmasını sağla. Ancak yine de her cevap bir anlam taşımalı.`,
    sakin: `Kullanıcı inancı hakkında konuştuğunda, sabırlı ve dengeli bir şekilde yaklaş. Yanıtlarında her zaman anlayışlı ve nazik ol. Karşındakini yargılamadan dinleyerek açıklamalar yap. Gerginlik yaşanırsa, sesini yükseltmek yerine mantıklı bir açıklama yaparak sakin kalmaya özen göster. Cevaplarında ciddi, ama arkadaşça ve içten bir ton kullan.`,
    meraklı: `İnanç konusunu duyduğunda hemen derinlemesine sorular sorar. Karşındakini anlamaya çalışarak sürekli "Neden böyle düşünüyorsun?" tarzında açık uçlu sorular sorar. Merakını asla gizlemez, ama bazı konularda çok fazla detaya girmemek gerekir. Yine de her cevaba yeni bir soruyla yaklaş ve karşındakinin düşüncelerini anlamaya çalış.`,
    orali_olmayan: `Kullanıcı dini konuları açtığında, ilgisiz ama kaba olmayan bir şekilde, sanki başka bir şeyle meşgulmüş gibi davran. Kısa cevaplar ver, "Bilmiyorum", "Fikrim yok" gibi ama hemen başka bir konuda söze gir. Mesela "Geçen gün çok tuhaf bir rüya gördüm, inanmazsın" gibi bir şeyler söyleyebilirsin. Bazen yalnızca geçiştirici ama doğrudan cevaplar verirken normalde rahat bir tavır sergile.`,
  };


  const selectedCharacterPrompt = characterPrompt[opponentType] || characterPrompt["ateist"];
  const selectedTonePrompt = tonePrompt[tone] || "";

  const fullPrompt = `${selectedCharacterPrompt}\n${selectedTonePrompt}\nGünlük Türkçe ile kısa ama bilgili cevaplar ver.`;

  chat = model.startChat({
    history: [
      { role: "user", parts: [{ text: fullPrompt }] },
      { role: "model", parts: [{ text: "Tamam, bu şekilde davranacağım." }] },
    ],
    generationConfig: {
      maxOutputTokens: 2048,
    },
  });
}

function checkIfConvertedToIslam(text) {
  const lower = text.toLowerCase();

  const triggers = [
    "müslüman oluyorum",
    "müslüman oldum",
    "islam doğru",
    "kuran doğru",
    "kelime-i şehadet",
    "şehadet getiriyorum",
    "artık müslümanım",
  ];

  return triggers.some(trigger => lower.includes(trigger));
}

async function getBotResponse(message) {
  if (!chat) {
    console.error("Chat başlatılmadı. Önce initializeChat() çağırılmalı.");
    return "Tartışmaya başlamadan önce bir karakter seçmelisin.";
  }

  let lastError = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const result = await chat.sendMessage(message);
      const response = await result.response;
      const botReply = response.text();

      // Müslüman olma tespiti
      if (checkIfConvertedToIslam(botReply)) {
        return botReply + "\n\n🎉 Tebrikler! Tebliğ simülatörünü başarıyla bitirdin.";
      }

      return botReply;
    } catch (err) {
      lastError = err;
      console.error(`API hatası (deneme ${attempt + 1}):`, err);
      // 2. denemede de hata olursa aşağıdaki mesaj dönecek
    }
  }
  return "[Bir hata oluştu]";
}


module.exports = {
  initializeChat,
  getBotResponse,
};
