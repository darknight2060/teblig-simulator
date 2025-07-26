import { useEffect, useState, useRef } from "react";

export default function index() {
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [selectedTone, setSelectedTone] = useState(null);
  const [userAvatar, setUserAvatar] = useState("");
  const [botAvatar, setBotAvatar] = useState("");
  const [chatStarted, setChatStarted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const chatRef = useRef(null);

  useEffect(() => {
    const fetchRandomAvatar = async () => {
      const res = await fetch("https://randomuser.me/api/?gender=male");
      const data = await res.json();
      return data.results[0].picture.medium;
    };

    (async () => {
      setUserAvatar(await fetchRandomAvatar());
      setBotAvatar(await fetchRandomAvatar());
    })();
  }, []);

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [messages]);

  const startConversation = async () => {
    if (!selectedCharacter || !selectedTone) {
      alert("Lütfen hem karakteri hem de üslubu seçin.");
      return;
    }

    await fetch("api/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ character: selectedCharacter, tone: selectedTone }),
    });

    setChatStarted(true);
    setMessages([{ type: "bot", text: "Selam!", avatar: botAvatar }]);
  };

  const sendMessage = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    setMessages(prev => [
      ...prev,
      { type: "user", text: trimmed, avatar: userAvatar },
      { type: "bot", text: "typing", avatar: botAvatar },
    ]);

    setInputValue("");

    try {
      const res = await fetch("api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();

      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          type: "bot",
          text: data.reply,
          avatar: botAvatar,
        };
        return updated;
      });
    } catch {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          type: "bot",
          text: "Bir hata oluştu. Lütfen tekrar deneyin.",
          avatar: botAvatar,
        };
        return updated;
      });
    }
  };

  return (
    <div className="font-inter bg-gradient-to-b from-[#15171c] to-[#1a1c22] text-[#e3e3e3] min-h-screen">
      {!chatStarted ? (
<div className="w-full sm:max-w-[430px] mx-auto sm:absolute sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 bg-gradient-to-br from-[#23242b] to-[#232b3a] rounded-none sm:rounded-[28px] shadow-[0_8px_32px_#000b] p-6 sm:p-10 text-center border border-[#2c2d36]">

  <h1 className="text-white text-3xl sm:text-[2.3rem] font-extrabold mb-2">Tebliğ Simülatör</h1>
  <h3 className="text-[#bfc6d5] text-base sm:text-[1.15rem] mb-6">Farklı inançlara sahip insanlarla tebliğ pratiği yap!</h3>

  <h3 className="text-[#4f8cff] font-semibold text-base mb-2 mt-4">Tebliğ yapacağın kişiyi seç:</h3>
  <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-2">
    {["ateist", "hristiyan", "budist", "deist"].map(type => (
      <button
        key={type}
        onClick={() => setSelectedCharacter(type)}
        className={`px-4 py-2 rounded-lg border font-semibold text-sm sm:text-base w-full sm:w-auto transition duration-200 cursor-pointer hover:border-[#4f8cff] hover:text-[#4f8cff] hover:bg-[#2e3240] ${
          selectedCharacter === type
            ? "bg-gradient-to-r from-[#2e3240] to-[#4f8cff33] text-[#4f8cff] border-[#4f8cff]"
            : "bg-[#23242b] text-[#e3e3e3] border-[#35363c]"
        }`}
      >
        👤 {type}
      </button>
    ))}
  </div>

  <h3 className="text-[#4f8cff] font-semibold text-base mb-2 mt-4">Bu kişinin üslubunu seç:</h3>
  <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
    {["agresif", "sakin", "meraklı", "orali_olmayan"].map(tone => (
      <button
        key={tone}
        onClick={() => setSelectedTone(tone)}
        className={`px-4 py-2 rounded-lg border font-semibold text-sm sm:text-base w-full sm:w-auto transition duration-200 cursor-pointer hover:border-[#4f8cff] hover:text-[#4f8cff] hover:bg-[#2e3240] ${
          selectedTone === tone
            ? "bg-gradient-to-r from-[#2e3240] to-[#4f8cff33] text-[#4f8cff] border-[#4f8cff]"
            : "bg-[#23242b] text-[#e3e3e3] border-[#35363c]"
        }`}
      >
        💬 {tone.replace("_", " ")}
      </button>
    ))}
  </div>

<button
  onClick={startConversation}
  disabled={!selectedCharacter || !selectedTone}
  className={`mt-6 w-full py-3 rounded-xl text-white font-bold bg-gradient-to-r from-[#4f8cff] to-[#2563eb] transition-transform ${
    selectedCharacter && selectedTone ? "hover:scale-[1.03] cursor-pointer" : "opacity-50 cursor-not-allowed"
  }`}
>
  Sohbete Başla
</button>

  <div className="text-center text-sm text-[#bfc6d5] mt-6 pb-6">
    Bu proje <a href="https://github.com/darknight2060/teblig-simulator" target="_blank" rel="noopener noreferrer" className="text-[#4f8cff] underline hover:text-[#82aaff]">açık kaynaklıdır</a> ve Vercel üzerinde barındırılmaktadır.
  </div>
</div>
      ) : (
        <>
          <div
            ref={chatRef}
            className="max-w-[480px] mx-auto mt-4 p-4 sm:p-6 bg-[#1a1c22] rounded-[20px] shadow-lg border border-[#23242b] max-h-[calc(100vh-220px)] overflow-y-auto"
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex mb-3 items-end ${msg.type === "user" ? "flex-row-reverse ml-auto" : "mr-auto"}`}
              >
                <img src={msg.avatar} className="w-10 h-10 rounded-full ring-2 ring-[#4f8cff] shadow mr-2" />
                <span className="bg-gradient-to-r from-[#23242b] to-[#1a1c22] px-4 py-3 rounded-xl border border-[#35363c] text-sm">
                  {msg.text === "typing" ? (
                    <span className="flex gap-1">
                      <span className="w-2 h-2 bg-[#bfc6d5] rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-[#bfc6d5] rounded-full animate-bounce delay-200"></span>
                      <span className="w-2 h-2 bg-[#bfc6d5] rounded-full animate-bounce delay-400"></span>
                    </span>
                  ) : (
                    msg.text
                  )}
                </span>
              </div>
            ))}
          </div>

          <div className="max-w-[480px] mx-auto mt-4 flex flex-col sm:flex-row gap-3 px-2 pb-8">
            <input
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              className="flex-grow px-4 py-3 rounded-xl bg-[#23242b] text-[#e3e3e3] border border-[#35363c] focus:outline-none focus:border-[#4f8cff]"
              placeholder="Mesaj"
            />
            <button
              onClick={sendMessage}
              className="px-5 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-[#4f8cff] to-[#2563eb] hover:scale-[1.04] transition-transform"
            >
              Gönder
            </button>
          </div>

          <div className="text-center text-sm text-[#bfc6d5] mt-6 pb-6">
            Bu proje <a href="https://github.com/darknight2060/teblig-simulator" target="_blank" rel="noopener noreferrer" className="text-[#4f8cff] underline hover:text-[#82aaff]">açık kaynaklıdır</a> ve Vercel üzerinde barındırılmaktadır.
          </div>
        </>
      )}
    </div>

  );
}
