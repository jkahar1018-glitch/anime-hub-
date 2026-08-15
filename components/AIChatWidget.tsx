"use client";

import { useEffect, useRef, useState } from "react";
import {
  FaRobot,
  FaTrash,
  FaPaperPlane,
  FaTimes,
  FaMagic,
} from "react-icons/fa";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

const suggestions = [
  "Anime like Solo Leveling",
  "Best action anime",
  "Best anime for beginners",
];

const welcomeMessage =
  "Hi! I'm AnimeHub AI 🤖\nTell me what kind of anime you're looking for!";

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content: welcomeMessage,
    },
  ]);

  const messagesRef = useRef<HTMLDivElement>(null);
  const messageIdRef = useRef(2);

  const getMessageId = () => {
    const id = messageIdRef.current;
    messageIdRef.current += 1;
    return id;
  };

  useEffect(() => {
    const container = messagesRef.current;

    if (!container) {
      return;
    }

    container.scrollTop = container.scrollHeight;
  }, [messages, loading]);

  const clearChat = () => {
    setMessages([
      {
        id: getMessageId(),
        role: "assistant",
        content: welcomeMessage,
      },
    ]);
  };

  const sendMessage = async (customMessage?: string) => {
    const message = (customMessage ?? input).trim();

    if (!message || loading) {
      return;
    }

    setInput("");

    const userMessage: Message = {
      id: getMessageId(),
      role: "user",
      content: message,
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "AI request failed"
        );
      }

      setMessages((prev) => [
        ...prev,
        {
          id: getMessageId(),
          role: "assistant",
          content:
            data?.reply ||
            "Sorry, I couldn't generate a response.",
        },
      ]);
    } catch (error) {
      console.error("AI chat error:", error);

      setMessages((prev) => [
        ...prev,
        {
          id: getMessageId(),
          role: "assistant",
          content:
            "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {open && (
        <div
          className="
            fixed
            bottom-[92px]
            left-3
            right-3
            z-[9998]
            overflow-hidden
            rounded-3xl
            border
            border-white/10
            bg-[#090909]
            shadow-2xl
            shadow-black/70
            sm:left-auto
            sm:right-6
            sm:w-[420px]
            md:w-[460px]
          "
        >
          <div className="flex h-[min(680px,75vh)] flex-col">
            {/* HEADER */}

            <header className="shrink-0 bg-gradient-to-br from-orange-400 to-orange-500 px-5 py-5 text-black">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-black/15">
                    <FaRobot size={20} />
                  </div>

                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-black">
                      AnimeHub AI
                    </h2>

                    <p className="mt-0.5 text-xs font-semibold text-black/60">
                      Anime recommendation assistant
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={clearChat}
                    className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-xl
                      transition
                      hover:bg-black/10
                    "
                    aria-label="Clear chat"
                    title="Clear chat"
                  >
                    <FaTrash size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-xl
                      transition
                      hover:bg-black/10
                    "
                    aria-label="Close AnimeHub AI"
                    title="Close"
                  >
                    <FaTimes size={15} />
                  </button>
                </div>
              </div>
            </header>

            {/* MESSAGES */}

            <div
              ref={messagesRef}
              className="
                min-h-0
                flex-1
                overflow-y-auto
                bg-[#090909]
                px-4
                py-5
              "
            >
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`
                        max-w-[88%]
                        whitespace-pre-line
                        rounded-2xl
                        px-4
                        py-3
                        text-sm
                        leading-6
                        ${
                          message.role === "user"
                            ? "rounded-br-md bg-orange-500 text-black"
                            : "rounded-bl-md border border-white/10 bg-white/[0.06] text-white/85"
                        }
                      `}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.06] px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-orange-400 [animation-delay:-0.3s]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-orange-400 [animation-delay:-0.15s]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-orange-400" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SUGGESTIONS */}

            <div className="shrink-0 border-t border-white/10 bg-[#0d0d0d] px-4 py-3">
              <div className="mb-2 flex items-center gap-2 text-xs font-bold text-white/45">
                <FaMagic size={11} />
                Try asking
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => sendMessage(suggestion)}
                    disabled={loading}
                    className="
                      shrink-0
                      rounded-xl
                      border
                      border-white/10
                      bg-white/[0.04]
                      px-3
                      py-2
                      text-xs
                      font-semibold
                      text-white/65
                      transition
                      hover:border-orange-500/30
                      hover:bg-orange-500/10
                      hover:text-orange-300
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* INPUT */}

            <div className="shrink-0 border-t border-white/10 bg-[#090909] p-3">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void sendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  value={input}
                  onChange={(event) => {
                    setInput(event.target.value);
                  }}
                  placeholder="Ask about anime..."
                  disabled={loading}
                  className="
                    min-w-0
                    flex-1
                    rounded-xl
                    border
                    border-white/10
                    bg-white/[0.05]
                    px-4
                    py-3
                    text-sm
                    text-white
                    outline-none
                    placeholder:text-white/30
                    focus:border-orange-500/50
                  "
                />

                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="
                    flex
                    h-12
                    w-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-orange-500
                    text-black
                    transition
                    hover:bg-orange-400
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                  aria-label="Send message"
                  title="Send"
                >
                  <FaPaperPlane size={14} />
                </button>
              </form>

              <p className="mt-2 px-1 text-[10px] leading-4 text-white/30">
                AnimeHub AI can make mistakes. Verify important
                information.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING AI BUTTON */}

      <div
        className="
          fixed
          bottom-5
          right-5
          z-[99999]
          sm:bottom-6
          sm:right-6
        "
      >
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="
            relative
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-full
            border-2
            border-black/20
            bg-orange-500
            text-black
            shadow-[0_8px_30px_rgba(249,115,22,0.45)]
            transition-all
            duration-200
            hover:scale-110
            hover:bg-orange-400
            active:scale-95
          "
          aria-label={
            open ? "Close AnimeHub AI" : "Open AnimeHub AI"
          }
          title={open ? "Close AnimeHub AI" : "AnimeHub AI"}
        >
          {!open && (
            <span
              className="
                pointer-events-none
                absolute
                inset-0
                rounded-full
                border-2
                border-orange-400/40
                animate-ping
              "
            />
          )}

          {open ? (
            <FaTimes size={22} />
          ) : (
            <FaRobot size={25} />
          )}

          {!open && (
            <span
              className="
                absolute
                -top-2
                -right-1
                rounded-full
                bg-black
                px-1.5
                py-0.5
                text-[8px]
                font-black
                tracking-wider
                text-orange-400
                shadow-lg
              "
            >
              AI
            </span>
          )}
        </button>
      </div>
    </>
  );
}