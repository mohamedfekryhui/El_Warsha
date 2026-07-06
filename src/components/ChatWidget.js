"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "@/config/api";
import { MessageSquare, X, Send, Bot, Maximize2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatWidget() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "bot",
      text: "أهلاً بك في الورشة! 🦷 أنا مساعدك الذكي. كيف يمكنني خدمتك اليوم؟ يمكنك سؤالي عن إجمالي الأرباح، عدد الأطباء، أو الأجهزة قيد الصيانة حالياً.",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [stats, setStats] = useState({ profits: null, doctorsCount: 0, activeOrdersCount: 0 });
  const messagesEndRef = useRef(null);

  // Fetch real-time dashboard figures to feed the bot answer engine
  useEffect(() => {
    const fetchStatsForBot = async () => {
      try {
        const [profRes, docRes, ordRes] = await Promise.all([
          fetch(API_ENDPOINTS.profits).catch(() => ({ json: async () => ({ grossRevenue: 0, netProfit: 0 }) })),
          fetch(API_ENDPOINTS.doctors).catch(() => ({ json: async () => [] })),
          fetch(API_ENDPOINTS.activeOrders).catch(() => ({ json: async () => [] })),
        ]);
        const profits = await profRes.json();
        const docs = await docRes.json();
        const ords = await ordRes.json();
        setStats({
          profits,
          doctorsCount: Array.isArray(docs) ? docs.length : 0,
          activeOrdersCount: Array.isArray(ords) ? ords.length : 0,
        });
      } catch (error) {
        console.error("Failed to load statistics for AI assistant:", error);
      }
    };

    fetchStatsForBot();
  }, []);

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const generateBotResponse = (text) => {
    const cleanText = text.trim().toLowerCase();

    if (cleanText.includes("أرباح") || cleanText.includes("ارباح") || cleanText.includes("أرباح الورشة") || cleanText.includes("فلوس") || cleanText.includes("دخل") || cleanText.includes("ايراد")) {
      const gross = stats.profits?.grossRevenue || 0;
      const net = stats.profits?.netProfit || 0;
      return `إجمالي إيرادات الورشة حالياً هو ${gross} ج.م، وصافي الأرباح بعد المصاريف هو ${net} ج.م. 💰`;
    }

    if (cleanText.includes("دكتور") || cleanText.includes("أطباء") || cleanText.includes("اطباء") || cleanText.includes("طبيب") || cleanText.includes("عميل") || cleanText.includes("العملاء")) {
      return `لدينا حالياً ${stats.doctorsCount} طبيب مسجل في سجلات الورشة. يمكنك تصفحهم وإدارتهم بالكامل من قائمة الأطباء. 🩺`;
    }

    if (cleanText.includes("صيانة") || cleanText.includes("معدة") || cleanText.includes("جهاز") || cleanText.includes("هاندبيس") || cleanText.includes("الرف") || cleanText.includes("رف")) {
      return `يوجد حالياً ${stats.activeOrdersCount} أجهزة ومعدات أسنان قيد الصيانة على الرف حالياً. يمكنك متابعتها أو تسليمها في صفحة الصيانة. 🛠️`;
    }

    if (cleanText.includes("مرحبا") || cleanText.includes("أهلاً") || cleanText.includes("اهلاً") || cleanText.includes("سلام") || cleanText.includes("هيلو")) {
      return "أهلاً بك! أنا مساعد الورشة الذكي. كيف يمكنني مساعدتك اليوم؟ يمكنك الاستفسار عن الأرباح، الدكاترة المسجلين، أو الأجهزة قيد الإصلاح. 🦷🤖";
    }

    if (cleanText.includes("شحن") || cleanText.includes("توصيل") || cleanText.includes("عنوان")) {
      return "يتم تحديد عناوين الشحن والعيادات لكل طبيب، ويمكنك قيد مصاريف الشحن وتحديث حسابات الأطباء من صفحة التقارير والمالية. 🚚";
    }

    return "عذراً، لم أفهم سؤالك بدقة. يمكنك سؤالي عن الأرباح الإجمالية، عدد الأطباء المسجلين، أو حالة الأجهزة المعلقة على الرف! ⚙️";
  };

  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim()) return;

    const newUserMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: textToSend,
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputText("");
    setIsTyping(true);

    // Simulate typing delay for a premium AI assistant feel
    setTimeout(() => {
      const botReplyText = generateBotResponse(textToSend);
      const newBotMessage = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: botReplyText,
      };
      setMessages((prev) => [...prev, newBotMessage]);
      setIsTyping(false);
    }, 750);
  };

  const suggestionChips = [
    { text: "أرباح الورشة حالياً 💰", query: "ما هي أرباح الورشة الإجمالية؟" },
    { text: "كم دكتور مسجل؟ 🩺", query: "كم عدد الدكاترة المسجلين؟" },
    { text: "الأجهزة قيد الصيانة 🛠️", query: "كم جهاز قيد الصيانة على الرف؟" },
  ];

  return (
    <>
      {/* Floating trigger button */}
      <div className="fixed bottom-6 left-6 z-50">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-14 h-14 bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-indigo-500/20 cursor-pointer border border-indigo-400/20 focus:outline-none"
        >
          {isOpen ? <X size={22} /> : <MessageSquare size={22} />}
          {!isOpen && (
            <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </span>
          )}
        </motion.button>
      </div>

      {/* Floating Chat Panel overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 50, x: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 50, x: -10 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="fixed bottom-24 left-6 w-96 h-[520px] max-h-[85vh] bg-white dark:bg-[#1E293B] border border-gray-150 dark:border-gray-800/80 rounded-[2rem] shadow-2xl flex flex-col z-50 overflow-hidden font-sans text-right"
            dir="rtl"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white flex items-center justify-between shadow-sm shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">مساعد الورشة الذكي</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-[10px] text-indigo-100 font-medium">نشط الآن</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    router.push("/chat");
                  }}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-indigo-100 hover:text-white"
                  title="فتح بصفحة كاملة"
                >
                  <Maximize2 size={16} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-indigo-100 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-gray-50/50 dark:bg-gray-900/20">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "user" ? "justify-start" : "justify-end"}`}
                >
                  <div className={`flex items-start gap-2.5 max-w-[80%] ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                      msg.sender === "user" 
                        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400" 
                        : "bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700/60 text-indigo-500"
                    }`}>
                      {msg.sender === "user" ? "أنا" : <Bot size={14} />}
                    </div>
                    <div className={`p-3 rounded-2xl text-xs leading-relaxed font-medium ${
                      msg.sender === "user"
                        ? "bg-indigo-600 text-white rounded-tr-none"
                        : "bg-white dark:bg-[#2A3547] text-gray-800 dark:text-gray-150 border border-gray-100 dark:border-gray-800 rounded-tl-none shadow-sm"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-end">
                  <div className="flex items-start gap-2.5 flex-row">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700/60 text-indigo-500 shrink-0">
                      <Bot size={14} />
                    </div>
                    <div className="bg-white dark:bg-[#2A3547] border border-gray-100 dark:border-gray-800 p-3.5 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                      <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                      <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestion Chips */}
            <div className="px-4 py-2 border-t border-gray-150/50 dark:border-gray-800/40 bg-white dark:bg-[#1E293B] flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none shrink-0">
              {suggestionChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip.query)}
                  className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/5 hover:bg-indigo-100 dark:hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/10 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <Sparkles size={10} className="text-indigo-400" />
                  {chip.text}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputText);
              }}
              className="p-3 bg-white dark:bg-[#1E293B] border-t border-gray-150/80 dark:border-gray-800/80 flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                placeholder="اسأل المساعد الذكي عن أي شيء..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-xs outline-none font-medium"
              />
              <button
                type="submit"
                className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-md shadow-indigo-500/10 transition-colors cursor-pointer"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
