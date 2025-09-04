import React, { useState } from "react";
import { GlowButton } from "./ui";

interface ContactProps {
  title: string;
  description: string;
  onSubmit?: (data: { email: string; message: string }) => void;
  className?: string;
}

export default function Contact({ title, description, onSubmit, className = "" }: ContactProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({ email, message });
    }
    setEmail("");
    setMessage("");
  };

  return (
    <section id="contact" className={`text-center ${className}`}>
      <h2 className="text-4xl font-semibold mb-6 leading-snug text-white">{title}</h2>
      <p className="text-lg mb-4 leading-relaxed text-gray-300 max-w-lg mx-auto">
        {description}
      </p>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-lg bg-[#494E62] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <textarea
          placeholder="Your message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={4}
          className="w-full px-4 py-3 rounded-lg bg-[#494E62] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
        />
        <GlowButton onClick={() => {}}>
          Send Message
        </GlowButton>
      </form>
    </section>
  );
}

