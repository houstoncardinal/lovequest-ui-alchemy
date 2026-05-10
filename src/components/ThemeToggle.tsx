import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";

const THEME_KEY = "lq-theme";

export const applyStoredTheme = () => {
  const stored = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  const isDark = stored ? stored === "dark" : prefersDark;
  document.documentElement.classList.toggle("dark", isDark);
};

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState<boolean>(
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    applyStoredTheme();
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem(THEME_KEY, next ? "dark" : "light");
  };

  return (
    <motion.button
      onClick={toggle}
      whileTap={{ scale: 0.9, rotate: 20 }}
      whileHover={{ scale: 1.06 }}
      aria-label="Toggle theme"
      className="fixed top-4 right-4 z-[60] h-11 w-11 rounded-full flex items-center justify-center
        bg-gradient-to-br from-primary to-accent text-primary-foreground
        shadow-elegant ring-1 ring-white/30 backdrop-blur-md
        hover:shadow-glow transition-shadow"
    >
      <motion.div
        key={isDark ? "moon" : "sun"}
        initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
      >
        {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle;
