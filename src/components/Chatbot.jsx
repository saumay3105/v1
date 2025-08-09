import { useState, useRef, useEffect } from "react";
import { IoChatbubbleEllipsesSharp, IoClose } from "react-icons/io5";

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! How can I assist you today?" },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current)
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages((old) => [
      ...old,
      { from: "user", text: input },
      { from: "bot", text: "hello" },
    ]);
    setInput("");
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        aria-label="Open chatbot"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-black text-white rounded-full p-4 shadow-lg hover:bg-gray-900 transition-colors"
      >
        <IoChatbubbleEllipsesSharp size={28} />
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 shadow-2xl">
          <div className="w-80 bg-white rounded-2xl overflow-hidden border border-gray-200 flex flex-col h-96">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
              <span className="font-bold text-gray-900 tracking-wide">
                Luxe Chat
              </span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close chatbot"
                className="p-1 text-xl text-gray-400 hover:text-gray-800 rounded transition"
              >
                <IoClose />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 px-4 py-3 overflow-y-auto space-y-3 bg-white text-sm">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.from === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <span
                    className={`px-3 py-2 rounded-xl ${
                      msg.from === "user"
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    {msg.text}
                  </span>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  placeholder="Type your message…"
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-gray-400 bg-white"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  autoFocus
                />
                <button
                  type="submit"
                  className="bg-black text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-900 transition"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
