import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  :root {
    --bg-1: #1f2430;
    --bg-2: #232a37;
    --bg-3: #2b3342;
    --surface: #2e3747;
    --surface-soft: #364154;
    --border: #445166;
    --text-main: #eef2f8;
    --text-muted: #aab4c3;
    --accent: #5b8cff;
    --accent-hover: #4f7fe8;
    --shadow-soft: 0 8px 24px rgba(0, 0, 0, 0.28);
    --shadow-focus: 0 0 0 3px rgba(91, 140, 255, 0.26);
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: linear-gradient(135deg, var(--bg-1) 0%, var(--bg-2) 55%, var(--bg-3) 100%);
    color: var(--text-main);
    min-height: 100vh;
    overflow-x: hidden;
    line-height: 1.45;
  }

  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
      monospace;
  }

  /* Steam-style scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #252d3a;
  }

  ::-webkit-scrollbar-thumb {
    background: #4b5a70;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #5d6f88;
  }

  /* Steam-style focus */
  *:focus {
    outline: 2px solid rgba(91, 140, 255, 0.5);
    outline-offset: 2px;
  }

  /* Steam-style selection */
  ::selection {
    background: rgba(91, 140, 255, 0.25);
    color: #f4f7ff;
  }

  /* Steam-style button reset */
  button {
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text-main);
    cursor: pointer;
    font-family: inherit;
    border-radius: 8px;
    transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
    box-shadow: var(--shadow-soft);
  }

  button:hover {
    background: var(--surface-soft);
    transform: translateY(0);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.22);
  }

  button:focus-visible {
    box-shadow: var(--shadow-focus);
  }

  /* Steam-style link reset */
  a {
    text-decoration: none;
    color: inherit;
  }
`; 