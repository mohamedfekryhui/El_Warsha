"use client";
import { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import { API_ENDPOINTS } from "@/config/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Send,
  Bot,
  Sparkles,
  HelpCircle,
  TrendingUp,
  Users,
  Wrench,
  ChevronLeft
} from "lucide-react";

const containerVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut", staggerChildren: 0.08 } }
};
const itemVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "bot",
      text: "أهلاً بك في صفحة المساعد الذكي! 🦷 أنا بوت التحليلات والمساعدة الخاص بورشة صيانة الأسنان. كيف يمكنني خدمتك اليوم؟ يمكنك اختصار الوقت وسؤالي عن إجمالي الأرباح، عدد الأطباء، أو الأجهزة قيد الصيانة حالياً.",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [stats, setStats] = useState({ profits: null, doctorsCount: 0, activeOrdersCount: 0 });
  const messagesEndRef = useRef(null);

  // Fetch real-time dashboard data for the AI response engine
  useEffect(() => {
    const fetchStats = async () => {
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
        console.error("Error loading stats for chat page:", error);
      }
    };
    fetchStats();
  }, []);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const generateBotResponse = (text) => {
    const cleanText = text.trim().toLowerCase();

    if (cleanText.includes("أرباح") || cleanText.includes("ارباح") || cleanText.includes("فلوس") || cleanText.includes("دخل") || cleanText.includes("ايراد") || cleanText.includes("إيرادات")) {
      const gross = stats.profits?.grossRevenue || 0;
      const net = stats.profits?.netProfit || 0;
      return `إجمالي إيرادات الورشة حالياً هو ${gross} ج.م، وصافي الأرباح بعد خصم المصاريف هو ${net} ج.م. 💰`;
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

  const handleSendMessage = (textToSend) => {
    if (!textToSend.trim()) return;

    const newUserMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: textToSend,
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputText("");
    setIsTyping(true);

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

  const promptSuggestions = [
    { label: "أرباح الورشة الحالية", desc: "استعلم عن إجمالي الإيرادات وصافي الأرباح", icon: <TrendingUp size={16} />, query: "ما هي أرباح الورشة الإجمالية وصافي الربح؟" },
    { label: "عدد الأطباء والعملاء", desc: "استعلم عن عدد العملاء والأطباء المسجلين بالكامل", icon: <Users size={16} />, query: "كم عدد الدكاترة المسجلين؟" },
    { label: "الأجهزة على الرف", desc: "استعلم عن الأجهزة التي هي قيد الصيانة حالياً", icon: <Wrench size={16} />, query: "كم عدد الأجهزة والمعدات قيد الصيانة حالياً؟" },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-gray-900 dark:bg-[#0B1120] dark:text-gray-100 transition-colors duration-300 font-sans">
      <Sidebar />

      <main className="flex-1 p-8 lg:p-12 overflow-y-auto flex flex-col h-screen">
        <motion.div
          initial="initial"
          animate="animate"
          variants={containerVariants}
          className="flex-1 flex flex-col space-y-6 max-w-6xl w-full mx-auto"
        >
          {/* الهيدر */}
          <div className="mb-2 shrink-0">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
              المساعد الذكي <MessageSquare className="text-indigo-500" size={28} />
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">
              تحدث مع المساعد الذكي لإسترجاع التحليلات، الإحصائيات، ومتابعة أشغال الورشة بسرعة.
            </p>
          </div>

          {/* البانل الرئيسي */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8 min-h-0 overflow-hidden pb-4">
            
            {/* العمود الجانبي - معلومات ومقترحات */}
            <motion.div variants={itemVariants} className="lg:col-span-1 flex flex-col space-y-6">
              {/* كارت معلومات البوت */}
              <div className="bg-white dark:bg-[#1E293B] p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800/60 shadow-sm text-right">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
                    <Bot size={20} />
                  </div>
                  <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">دليل المساعد الذكي</h4>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                  تمت برمجة هذا المساعد للربط مباشرة بقاعدة بيانات الورشة. يمكنك الاستعلام عن الأرقام والبيانات بمجرد كتابة سؤال بسيط باللغة العربية.
                </p>

                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800/40 space-y-4">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-gray-400">الأطباء المسجلين:</span>
                    <span className="text-indigo-500">{stats.doctorsCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-gray-400">معدات على الرف:</span>
                    <span className="text-amber-500">{stats.activeOrdersCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-gray-400">صافي الأرباح:</span>
                    <span className="text-emerald-500">{stats.profits ? `${stats.profits.netProfit} ج.م` : "0 ج.م"}</span>
                  </div>
                </div>
              </div>

              {/* الأسئلة الشائعة كأزرار مقترحة */}
              <div className="bg-white dark:bg-[#1E293B] p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800/60 shadow-sm text-right flex-1 overflow-y-auto">
                <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                  <HelpCircle size={16} className="text-indigo-500" /> أسئلة شائعة
                </h4>
                <div className="space-y-3">
                  {promptSuggestions.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(item.query)}
                      className="w-full p-3.5 bg-gray-50 dark:bg-gray-900/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/10 border border-gray-100 dark:border-gray-800 rounded-2xl text-right transition-all cursor-pointer block hover:-translate-y-0.5 group"
                    >
                      <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1 leading-normal group-hover:text-gray-500 dark:group-hover:text-gray-300 font-medium">
                        {item.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* صندوق الدردشة الرئيسي */}
            <motion.div variants={itemVariants} className="lg:col-span-3 flex flex-col bg-white dark:bg-[#1E293B] rounded-[2rem] border border-gray-100 dark:border-gray-800/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] overflow-hidden min-h-[500px]">
              
              {/* هيدر صندوق الدردشة */}
              <div className="p-5 border-b border-gray-100 dark:border-gray-800/60 bg-gray-50/50 dark:bg-gray-900/10 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100/50 dark:border-indigo-500/10 shadow-sm">
                    <Bot size={22} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 dark:text-gray-200">الدردشة التفاعلية مع المساعد</h4>
                    <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">البوت يستمع للأسئلة حالياً</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-xl animate-pulse">
                  متصل
                </div>
              </div>

              {/* منطقة الرسائل */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50/30 dark:bg-gray-900/5">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === "user" ? "justify-start" : "justify-end"}`}
                  >
                    <div className={`flex items-start gap-3.5 max-w-[75%] ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold border ${
                        msg.sender === "user" 
                          ? "bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20" 
                          : "bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700/60 text-indigo-500"
                      }`}>
                        {msg.sender === "user" ? "أنا" : <Bot size={16} />}
                      </div>
                      <div className={`p-4 rounded-2xl text-xs leading-relaxed font-semibold ${
                        msg.sender === "user"
                          ? "bg-indigo-600 text-white rounded-tr-none shadow-sm shadow-indigo-500/10"
                          : "bg-white dark:bg-[#2A3547] text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-800 rounded-tl-none shadow-sm"
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-end">
                    <div className="flex items-start gap-3.5 flex-row">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700/60 text-indigo-500 shrink-0">
                        <Bot size={16} />
                      </div>
                      <div className="bg-white dark:bg-[#2A3547] border border-gray-100 dark:border-gray-800 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* فورم الإرسال السفلي */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputText);
                }}
                className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10 flex items-center gap-3 shrink-0"
              >
                <input
                  type="text"
                  placeholder="اكتب رسالتك للمساعد الذكي هنا..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 px-5 py-3.5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-xs outline-none font-bold"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all transform hover:-translate-y-0.5 shadow-md shadow-indigo-500/20 cursor-pointer h-[50px]"
                >
                  إرسال <Send size={14} />
                </button>
              </form>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
