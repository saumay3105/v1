import { useState, useRef, useEffect } from "react";
import { IoChatbubbleEllipsesSharp, IoClose } from "react-icons/io5";

const API_URL = "http://localhost:5000/chat";

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  // Each message can now have: { from, text, products }
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! How can I assist you today?", products: [] },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current)
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, open]);

  const sendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;
    setMessages((old) => [...old, { from: "user", text: trimmedInput }]);
    setInput("");
    setIsLoading(true);
    setMessages((old) => [
      ...old,
      { from: "bot", text: "Thinking...", products: [] },
    ]);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmedInput,
          user_id: "default",
        }),
      });
      const data = await res.json();
      setMessages((old) => {
        // Replace last "thinking..." with the response and its products!
        const updated = [...old];
        updated[updated.length - 1] = {
          from: "bot",
          text: data.result,
          products: data.products || [],
        };
        return updated;
      });
    } catch (error) {
      setMessages((old) => {
        const updated = [...old];
        updated[updated.length - 1] = {
          from: "bot",
          text: "Sorry, I couldn't reach the server.",
          products: [],
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          aria-label="Open chatbot"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-black text-white rounded-full p-4 shadow-lg hover:bg-gray-900 transition-colors"
        >
          <IoChatbubbleEllipsesSharp size={28} />
        </button>
      )}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 shadow-2xl">
          <div className="w-96 h-[32rem] bg-white rounded-2xl overflow-hidden border border-gray-200 flex flex-col">
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-gray-50">
              <span className="font-bold text-gray-900 tracking-wide text-lg">
                Luxe Chat
              </span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close chatbot"
                className="p-1 text-2xl text-gray-400 hover:text-gray-800 rounded transition"
              >
                <IoClose />
              </button>
            </div>
            <div className="flex-1 px-6 py-3 overflow-y-auto bg-white text-sm">
              {messages.map((msg, idx) => (
                <div key={idx}>
                  <div
                    className={`flex ${
                      msg.from === "user" ? "justify-end" : "justify-start"
                    } mb-2`}
                  >
                    <span
                      className={`px-3 py-2 rounded-xl ${
                        msg.from === "user"
                          ? "bg-black text-white"
                          : msg.text === "Thinking..."
                          ? "bg-gray-200 text-gray-500 italic"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      {msg.text}
                    </span>
                  </div>
                  {/* If this bot message has products, show product cards WITH it */}
                  {msg.from === "bot" &&
                    msg.products &&
                    msg.products.length > 0 && (
                      <div className="mt-2 space-y-3">
                        {msg.products.map((prod, idx2) => (
                          <div
                            key={prod.name + idx2}
                            className="flex items-center space-x-3 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 shadow-sm hover:shadow-md transition"
                          >
                            <img
                              src={prod.image}
                              alt={prod.name}
                              className="w-14 h-14 object-cover rounded-lg border"
                            />
                            <div className="flex flex-col flex-1">
                              <span className="font-medium text-gray-900 text-sm">
                                {prod.name}
                              </span>
                              <a
                                href={prod.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 mt-1 hover:underline"
                              >
                                View Details
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
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
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    isLoading
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-black text-white hover:bg-gray-900"
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? "..." : "Send"}
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
