import { marked } from "marked";
import DOMPurify from "dompurify";
import hljs from "highlight.js";
marked.setOptions({
  breaks: true,
  gfm: true
});
function renderMarkdown(content) {
  let html = marked(content);
  html = html.replace(/<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g, (match, lang, code) => {
    try {
      if (lang && hljs.getLanguage(lang)) {
        const highlighted = hljs.highlight(code, { language: lang }).value;
        return `<pre><code class="language-${lang}">${highlighted}</code></pre>`;
      }
    } catch (err) {
      console.error("Highlight.js error:", err);
    }
    return match;
  });
  return DOMPurify.sanitize(html);
}
function formatTimestamp(timestamp) {
  const date = new Date(timestamp * 1e3);
  const now = /* @__PURE__ */ new Date();
  const diff = now.getTime() - date.getTime();
  if (diff < 6e4) {
    return "Just now";
  }
  if (diff < 36e5) {
    const minutes = Math.floor(diff / 6e4);
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  }
  if (diff < 864e5) {
    const hours = Math.floor(diff / 36e5);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }
  if (diff < 6048e5) {
    const days = Math.floor(diff / 864e5);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }
  return date.toLocaleDateString();
}
function formatTime(timestamp) {
  const date = new Date(timestamp * 1e3);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}
export {
  formatTime as a,
  formatTimestamp as f,
  renderMarkdown as r,
  truncateText as t
};
