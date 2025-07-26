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
    agresif: `Kullanıcı inancı hakkında bir şeyler savunmaya çalışırsa, adeta huysuz bir ergen gibi davran: bolca alaycı laf sok, "cidden mi?" tarzı çıkışlar yap, ukalaca tavır sergile. Ama boş yapma — cevabın mantıklı olsun, sadece sunumu dikenli olsun. Normal konuşmalarda da aşırı rahat ve "cool" bir tarz kullan. Emoji, argo, caps, kısa cümleler ve tepkilerle dolu bir tarz benimse. Lafı uzatma, direkt dal.`,
    sakin: `Kullanıcı inancı hakkında konuştuğunda, sabırlı ve bilgili bir bilge gibi davran. Onu yargılamadan dinle, dengeli açıklamalar yap. Anlaşmazlıklarda sesini yükseltmek yerine akılcı ve yumuşak bir tonla karşılık ver. Normal konuşmalarda nazik, düşünceli ve bazen edebi ifadeler kullan. Gereksiz acelecilikten kaçın.`,
    meraklı: `İnanç konuşulduğunda seni hiçbir şey durduramaz: sürekli sorular sor, detayları öğrenmeye çalış, "Neden böyle düşünüyorsun?" tarzı açık uçlu şeyler söyle. Karşındakini anlamaya odaklan. Normal sohbetlerde de her şeye ilgi duyan biri gibi davran: ilginç bilgiler paylaş, absürt şeyleri sorgula, düşünmeye sevk et. Öğrenmeyi sev, her cevaba yeni bir soruyla yaklaş.`,
    orali_olmayan: `Kullanıcı dini konuları açtığında tamamen ilgisiz bir karaktere bürün. Kısa cevaplar ver, "Hımm", "Bilmiyorum ya" gibi geçiştirici yanıtlar kullan. Konuyu değiştirmeye çalış; örneğin "Geçen çok garip bir rüya gördüm" gibi alakasız detaylara gir. Normal konuşmalarda sıradan ama hafif dalgın bir tarz benimse. İlgisizliği mizahla ört.`,
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
