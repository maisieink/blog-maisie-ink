import React, { useState, useEffect } from "react";
import { ThemeToggler } from "gatsby-plugin-dark-mode";

const ThemeToggleButtonText = ({ theme }) => {
  // Prevent SSR hydration issue since SSR won't know if the
  // user is using light or dark mode. Hydrate in light mode
  // on first render, since that's what SSR will render.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return theme === "dark" && mounted ? "toggle theme 🌙" : "toggle theme ☀️";
};

const ThemeToggleButton = () => (
  <ThemeToggler>
    {({ theme, toggleTheme }) => (
      <button
        className="link-button"
        onClick={() => toggleTheme(theme === "dark" ? "light" : "dark")}
      >
        <ThemeToggleButtonText theme={theme} />
      </button>
    )}
  </ThemeToggler>
);

export default ThemeToggleButton;
