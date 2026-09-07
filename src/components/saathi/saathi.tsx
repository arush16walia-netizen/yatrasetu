"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUp,
  Bot,
  Compass,
  Leaf,
  MapPin,
  MessageCircle,
  Sparkles,
  X,
} from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const STARTER_PROMPTS = [
  {
    label: "Plan my trip",
    icon: Compass,
    prompt:
      "Plan a responsible trip for me. Ask me for the destination, number of days, and what kind of experience I want.",
  },
  {
    label: "Find quieter destinations",
    icon: MapPin,
    prompt:
      "Find me quieter destinations in India with lower visitor pressure from Yatra Setu's destination data.",
  },
  {
    label: "Upcoming restoration events",
    icon: Leaf,
    prompt:
      "Show me upcoming restoration events and explain how I can participate.",
  },
  {
    label: "Responsible travel tip",
    icon: Leaf,
    prompt:
      "Give me one practical responsible travel tip for my next journey.",
  },
];

export function Saathi() {
  const [open, setOpen] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Namaste! I'm Saathi. I can help you discover places, plan a more responsible journey, find restoration events, and make your yatra lighter on the land.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /*
   * Keep the newest message visible whenever the conversation changes.
   * This makes the chat behave like a proper messaging interface.
   */
  useEffect(() => {
    if (!open) return;

    const container = messagesContainerRef.current;

    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading, open]);

  async function sendMessage(message: string) {
    const trimmed = message.trim();

    if (!trimmed || loading) return;

    const userMessage: Message = {
      role: "user",
      content: trimmed,
    };

    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai-concierge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmed,
          messages: nextMessages,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Saathi could not respond.");
      }

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            data?.answer ||
            "I'm sorry, I couldn't find a useful answer right now.",
        },
      ]);
    } catch (error) {
      console.error("Saathi error:", error);

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "I'm having trouble connecting right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  return (
    <>
      {/* Floating Saathi button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            type="button"
            aria-label="Open Saathi AI concierge"
            onClick={() => setOpen(true)}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="
              fixed
              bottom-6
              right-6
              z-[100]
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-full
              border
              border-[#e9a23b]
              bg-[#e9a23b]
              text-[#101720]
              shadow-[0_16px_45px_rgba(0,0,0,0.25)]
              transition-all
              duration-300
              hover:shadow-[0_20px_55px_rgba(0,0,0,0.32)]
              md:bottom-8
              md:right-8
            "
          >
            <Sparkles size={25} strokeWidth={2.2} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Saathi panel */}
      <AnimatePresence>
        {open && (
          <motion.section
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{
              duration: 0.25,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              fixed
              bottom-4
              right-4
              z-[100]
              flex
              h-[min(720px,calc(100vh-32px))]
              w-[calc(100vw-2rem)]
              max-w-[430px]
              min-h-0
              flex-col
              overflow-hidden
              rounded-[28px]
              border
              border-[#27303b]
              bg-[#f7f5ef]
              shadow-[0_30px_90px_rgba(0,0,0,0.28)]
              md:bottom-6
              md:right-6
            "
          >
            {/* Header */}
            <header
              className="
                flex
                shrink-0
                items-center
                justify-between
                border-b
                border-[#27303b]
                bg-[#101720]
                px-5
                py-4
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-2xl
                    bg-[#e9a23b]
                    text-[#101720]
                  "
                >
                  <Bot size={22} strokeWidth={2} />
                </div>

                <div>
                  <div className="font-[var(--font-fraunces)] text-[20px] font-semibold leading-none text-white">
                    Saathi
                  </div>

                  <div className="mt-1 text-[11px] font-medium tracking-[0.08em] text-[#aeb7c2]">
                    YOUR YATRA COMPANION
                  </div>
                </div>
              </div>

              <button
                type="button"
                aria-label="Close Saathi"
                onClick={() => setOpen(false)}
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  text-[#aeb7c2]
                  transition
                  hover:bg-[#1b2530]
                  hover:text-white
                "
              >
                <X size={20} />
              </button>
            </header>

            {/* Messages */}
            <div
              ref={messagesContainerRef}
              className="
                min-h-0
                flex-1
                overflow-x-hidden
                overflow-y-auto
                overscroll-contain
                scroll-smooth
                px-4
                py-5
                [scrollbar-color:#c8c4bb_transparent]
                [scrollbar-width:thin]
              "
            >
              <div className="space-y-4">
                {messages.map((message, index) => {
                  const isUser = message.role === "user";

                  return (
                    <motion.div
                      key={`${message.role}-${index}`}
                      initial={{
                        opacity: 0,
                        y: 8,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      className={`flex ${
                        isUser ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={
                          isUser
                            ? `
                              max-w-[82%]
                              rounded-[20px]
                              rounded-br-[6px]
                              bg-[#101720]
                              px-4
                              py-3
                              text-[15px]
                              leading-6
                              text-white
                              shadow-sm
                            `
                            : `
                              max-w-[88%]
                              rounded-[20px]
                              rounded-bl-[6px]
                              border
                              border-[#e4e0d6]
                              bg-white
                              px-4
                              py-3
                              text-[15px]
                              leading-6
                              text-[#18212b]
                              shadow-sm
                            `
                        }
                      >
                        {message.content}
                      </div>
                    </motion.div>
                  );
                })}

                {/* Loading indicator */}
                {loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div
                      className="
                        rounded-[20px]
                        rounded-bl-[6px]
                        border
                        border-[#e4e0d6]
                        bg-white
                        px-4
                        py-3
                      "
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-[#e9a23b]" />
                        <span className="h-2 w-2 animate-pulse rounded-full bg-[#e9a23b] [animation-delay:150ms]" />
                        <span className="h-2 w-2 animate-pulse rounded-full bg-[#e9a23b] [animation-delay:300ms]" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Scroll anchor */}
                <div ref={messagesEndRef} aria-hidden="true" />
              </div>

              {/* Starter prompts */}
              {messages.length === 1 && !loading && (
                <div className="mt-5">
                  <p className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7d8792]">
                    Try asking
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {STARTER_PROMPTS.map((item) => {
                      const Icon = item.icon;

                      return (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => void sendMessage(item.prompt)}
                          className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-full
                            border
                            border-[#d9d5cb]
                            bg-white
                            px-3.5
                            py-2.5
                            text-left
                            text-[13px]
                            font-medium
                            text-[#26313c]
                            transition-all
                            duration-200
                            hover:border-[#e9a23b]
                            hover:bg-[#fff8eb]
                            hover:text-[#101720]
                          "
                        >
                          <Icon
                            size={14}
                            strokeWidth={1.8}
                            className="shrink-0 text-[#c98625]"
                          />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Input area */}
            <div className="shrink-0 border-t border-[#e4e0d6] bg-[#f7f5ef] p-3">
              <form onSubmit={handleSubmit}>
                <div
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-[22px]
                    border
                    border-[#d8d4ca]
                    bg-white
                    px-3
                    py-2
                    transition
                    focus-within:border-[#e9a23b]
                    focus-within:ring-2
                    focus-within:ring-[#e9a23b]/15
                  "
                >
                  <MessageCircle
                    size={21}
                    className="ml-1 shrink-0 text-[#7f8994]"
                  />

                  <input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    disabled={loading}
                    placeholder="Ask Saathi anything about your yatra..."
                    className="
                      min-w-0
                      flex-1
                      border-0
                      bg-transparent
                      px-2
                      py-2.5
                      text-[15px]
                      text-[#18212b]
                      outline-none
                      placeholder:text-[#8a949f]
                    "
                  />

                  <button
                    type="submit"
                    disabled={!input.trim() || loading}
                    aria-label="Send message"
                    className="
                      flex
                      h-11
                      w-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-[#101720]
                      text-white
                      transition-all
                      duration-200
                      hover:bg-[#1c2732]
                      disabled:cursor-not-allowed
                      disabled:bg-[#c6c8ca]
                      disabled:text-white
                    "
                  >
                    <ArrowUp size={21} strokeWidth={2} />
                  </button>
                </div>
              </form>

              {/* Grounding indicator */}
              <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-medium text-[#7d8792]">
                <Sparkles size={12} />
                <span>Grounded in Yatra Setu data</span>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}