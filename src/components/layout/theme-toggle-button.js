import React from "react";
import { ThemeToggler } from "gatsby-plugin-dark-mode";
import classNames from "classnames";

import * as styles from "./theme-toggle-button.module.css";

const ThemeToggleButton = () => (
  <ThemeToggler>
    {({ theme, toggleTheme }) => (
      <button
        className={classNames("link-button", styles.themeToggleButton)}
        onClick={() => toggleTheme(theme === "dark" ? "light" : "dark")}
      >
        Toggle theme
      </button>
    )}
  </ThemeToggler>
);

export default ThemeToggleButton;
