"use client";

import { useState } from "react";
import { Bot, X, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

export function AICoach() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user" as const, text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
        const res = await fetch("/api/gemini-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            prompt: `
            You're a sustainable cooking assistant. Your primary goal is to help users make the most of their ingredients and reduce waste.

            1. If the user seems confused or asks about unclear instructions (e.g., "what does simmer until reduced mean?"), explain the step clearly and concisely, using plain language and practical kitchen advice.

            2. If the user talks about what they just cooked or prepped, always start by referencing the current *state* of the ingredients (e.g., "since you just roasted some carrots..."). Then, suggest one realistic and resourceful way to use them next. Be concise (2–3 sentences), friendly, and practical.

            If the user doesn't give enough context, ask what they recently cooked and what's left over.

            Avoid list formatting, markdown, or vague tips — just use plain, helpful text.

    User: "${input}"
            `.trim(),
        }),
        });

        const data = await res.json();
        const reply =
        data.response ||
        "Hmm, I couldn't come up with anything. Try including what you just cooked and what you still have.";

        setMessages((prev) => [...prev, { role: "ai", text: reply }]);
    } catch (err) {
        setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Something went wrong. Please try again." },
        ]);
    } finally {
        setLoading(false);
    }
};


  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen((open) => !open)}
          className="rounded-full p-3 shadow-xl bg-primary text-white hover:brightness-110"
          aria-label={isOpen ? "Close chatbot" : "Open chatbot"}
        >
          {isOpen ? <X /> : <Bot />}
        </Button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-20 right-6 z-50 w-80 max-h-[75vh] flex flex-col rounded-lg border border-border bg-card p-4 shadow-2xl"
          >
            <h2 className="font-semibold text-lg mb-2">Smart Leftover Optimizer</h2>

            <div className="flex-1 overflow-y-auto space-y-2 text-sm pr-1">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-2 rounded-md ${
                    msg.role === "user" ? "bg-muted" : "bg-accent/20"
                  }`}
                >
                  <strong>{msg.role === "user" ? "You" : "AI"}:</strong> {msg.text}
                </div>
              ))}
              {loading && <p className="text-muted-foreground italic">Thinking...</p>}
            </div>

            <div className="mt-2 flex gap-2">
              <Textarea
                placeholder="e.g. I made chili and I have bell peppers and some ground beef left"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 resize-none"
              />
              <Button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="p-2"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
