import { useEffect, useState } from "react";
import { X } from "lucide-react";

const STORAGE_KEY = "brx_announcement_dismissed_v1";

const messages = [
  "🚚 FREE delivery within 3 km of Urban Forest, Kiwale",
  "💸 Use code FLAT10 for ₹10 off · Pay Online for instant ₹10 discount",
  "🔥 Min order ₹149 · WhatsApp confirmation within minutes",
];

const AnnouncementBar = () => {
  const [dismissed, setDismissed] = useState(true);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  useEffect(() => {
    if (dismissed) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % messages.length);
    }, 4000);
    return () => window.clearInterval(id);
  }, [dismissed]);

  const handleDismiss = () => {
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch {}
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <div className="bg-[#FF5D05] text-white" role="region" aria-label="Site announcements">
      <div className="container mx-auto px-4 py-1.5 flex items-center justify-center gap-3 relative">
        <p
          key={index}
          className="font-montserrat text-[11px] sm:text-xs font-medium tracking-wide text-center animate-fade-in"
        >
          {messages[index]}
        </p>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss announcement"
          className="absolute right-2 sm:right-4 p-1 rounded-full hover:bg-white/15 transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};

export default AnnouncementBar;
