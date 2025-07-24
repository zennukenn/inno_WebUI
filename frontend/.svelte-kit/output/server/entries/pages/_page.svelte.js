import { c as create_ssr_component, b as subscribe, a as add_attribute, e as each, f as escape, v as validate_component, p as createEventDispatcher, o as onDestroy } from "../../chunks/ssr.js";
import { w as writable } from "../../chunks/index.js";
import { b as toast } from "../../chunks/theme.js";
import { marked } from "marked";
import DOMPurify from "dompurify";
import hljs from "highlight.js";
const chats = writable([]);
const currentChat = writable(null);
const currentChatId = writable(null);
const messages = writable([]);
const isLoading = writable(false);
const isStreaming = writable(false);
const sidebarOpen = writable(true);
const mobile = writable(false);
const settings = writable({
  model: "default",
  temperature: 0.7,
  maxTokens: 2048,
  systemPrompt: "",
  theme: "dark",
  vllmApiUrl: "http://localhost:8000/v1",
  vllmApiKey: "",
  thinkingMode: true
});
const modelStatus = writable({
  connected: false,
  error: void 0,
  models: []
});
const __vite_import_meta_env__ = {};
const API_BASE_URL = __vite_import_meta_env__?.VITE_API_BASE_URL || "http://localhost:8080";
const ENDPOINTS = {
  CHATS: "/api/chats",
  CHAT_COMPLETION: "/api/chat/completion",
  MODELS: "/api/models"
};
class ApiClient {
  baseUrl;
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }
  updateBaseUrl(newBaseUrl) {
    this.baseUrl = newBaseUrl;
  }
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    console.log("API Request:", { url, options });
    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers
        },
        ...options
      });
      console.log("API Response status:", response.status);
      if (!response.ok) {
        const error = await response.text();
        console.error("API Error response:", error);
        throw new Error(`HTTP ${response.status}: ${error}`);
      }
      const data = await response.json();
      console.log("API Response data:", data);
      return { success: true, data };
    } catch (error) {
      console.error("API request failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
  // Chat methods
  async createChat(chatData) {
    return this.request(ENDPOINTS.CHATS, {
      method: "POST",
      body: JSON.stringify(chatData)
    });
  }
  async getChats(limit = 50, offset = 0) {
    return this.request(`${ENDPOINTS.CHATS}?limit=${limit}&offset=${offset}`);
  }
  async getChat(chatId) {
    return this.request(`${ENDPOINTS.CHATS}/${chatId}`);
  }
  async updateChat(chatId, chatData) {
    return this.request(`${ENDPOINTS.CHATS}/${chatId}`, {
      method: "PUT",
      body: JSON.stringify(chatData)
    });
  }
  async deleteChat(chatId) {
    return this.request(`${ENDPOINTS.CHATS}/${chatId}`, {
      method: "DELETE"
    });
  }
  async addMessage(chatId, messageData) {
    return this.request(`${ENDPOINTS.CHATS}/${chatId}/messages`, {
      method: "POST",
      body: JSON.stringify(messageData)
    });
  }
  async getMessages(chatId) {
    return this.request(`${ENDPOINTS.CHATS}/${chatId}/messages`);
  }
  async searchChats(query, limit = 20) {
    return this.request(`${ENDPOINTS.CHATS}/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  }
  // Chat completion methods
  async chatCompletion(request) {
    return this.request(ENDPOINTS.CHAT_COMPLETION, {
      method: "POST",
      body: JSON.stringify(request)
    });
  }
  async chatCompletionStream(request) {
    try {
      const response = await fetch(`${this.baseUrl}${ENDPOINTS.CHAT_COMPLETION}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ...request, stream: true })
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.body;
    } catch (error) {
      console.error("Stream request failed:", error);
      return null;
    }
  }
  async getModels() {
    return this.request("/api/models");
  }
  async addModel(config) {
    return this.request("/api/models/add", {
      method: "POST",
      body: JSON.stringify(config)
    });
  }
  async removeModel(modelId) {
    return this.request(`/api/models/${modelId}`, {
      method: "DELETE"
    });
  }
  async getModelConfig(modelId) {
    return this.request(`/api/models/${modelId}/config`);
  }
  async testModel(modelId) {
    return this.request(`/api/models/${modelId}/test`, {
      method: "POST"
    });
  }
  async healthCheck() {
    return this.request("/api/chat/health");
  }
  // Test VLLM connection
  async testVllmConnection(vllmUrl, apiKey) {
    try {
      const headers = {
        "Content-Type": "application/json"
      };
      if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey}`;
      }
      let cleanUrl = vllmUrl.trim();
      cleanUrl = cleanUrl.endsWith("/") ? cleanUrl.slice(0, -1) : cleanUrl;
      const modelsUrl = cleanUrl.endsWith("/v1") ? `${cleanUrl}/models` : `${cleanUrl}/v1/models`;
      console.log("Testing VLLM connection to:", modelsUrl);
      const response = await fetch(modelsUrl, {
        method: "GET",
        headers
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      return {
        success: true,
        data: {
          models: data.data || [],
          connected: true
        }
      };
    } catch (error) {
      console.error("Direct VLLM connection test failed:", error);
      try {
        const response = await this.request("/api/chat/test-connection", {
          method: "POST",
          body: JSON.stringify({
            vllm_url: vllmUrl,
            api_key: apiKey
          })
        });
        if (response.success) {
          return response;
        } else {
          throw new Error(response.error || "Backend connection test failed");
        }
      } catch (backendError) {
        console.error("Backend VLLM connection test failed:", backendError);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Connection failed"
        };
      }
    }
  }
}
const api = new ApiClient();
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
const ChatSidebar = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $currentChatId, $$unsubscribe_currentChatId;
  let $chats, $$unsubscribe_chats;
  $$unsubscribe_currentChatId = subscribe(currentChatId, (value) => $currentChatId = value);
  $$unsubscribe_chats = subscribe(chats, (value) => $chats = value);
  let { onNewChat } = $$props;
  let { onSelectChat } = $$props;
  let searchQuery = "";
  let filteredChats = [];
  if ($$props.onNewChat === void 0 && $$bindings.onNewChat && onNewChat !== void 0) $$bindings.onNewChat(onNewChat);
  if ($$props.onSelectChat === void 0 && $$bindings.onSelectChat && onSelectChat !== void 0) $$bindings.onSelectChat(onSelectChat);
  {
    {
      if (searchQuery.trim()) {
        filteredChats = $chats.filter((chat) => chat.title.toLowerCase().includes(searchQuery.toLowerCase()));
      } else {
        filteredChats = $chats;
      }
    }
  }
  $$unsubscribe_currentChatId();
  $$unsubscribe_chats();
  return `<div class="flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700"> <div class="p-4 border-b border-gray-200 dark:border-gray-700"><div class="flex items-center justify-between mb-4"><div class="flex items-center space-x-2" data-svelte-h="svelte-2feria"><div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"><svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg></div> <h1 class="text-lg font-semibold text-gray-900 dark:text-white">VLLM Chat</h1></div> <button class="md:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400" data-svelte-h="svelte-1phmgvb"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div> <button class="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center space-x-2" data-svelte-h="svelte-uxe5gb"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg> <span>New Chat</span></button></div>  <div class="p-4"><div class="relative"><svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg> <input type="text" placeholder="Search chats..." class="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"${add_attribute("value", searchQuery, 0)}></div></div>  <div class="flex-1 overflow-y-auto px-2"><div class="space-y-1">${each(filteredChats, (chat) => {
    return `<button class="${"w-full p-3 rounded-lg cursor-pointer transition-all duration-200 group text-left " + escape(
      $currentChatId === chat.id ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500" : "hover:bg-gray-50 dark:hover:bg-gray-700/50",
      true
    )}" aria-label="${"Select chat: " + escape(chat.title, true)}"><div class="flex items-start justify-between"><div class="flex-1 min-w-0"><h3 class="${"text-sm font-medium " + escape(
      $currentChatId === chat.id ? "text-blue-700 dark:text-blue-300" : "text-gray-900 dark:text-white",
      true
    ) + " truncate"}">${escape(truncateText(chat.title, 30))}</h3> <p class="${"text-xs " + escape(
      $currentChatId === chat.id ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400",
      true
    ) + " mt-1"}">${escape(formatTimestamp(new Date(chat.updated_at || chat.created_at || "").getTime() / 1e3))} </p></div> <button class="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/20 transition-all duration-200 text-gray-400 hover:text-red-600 dark:hover:text-red-400" data-svelte-h="svelte-1jygfsj"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg> </button></div> </button>`;
  })}</div> ${filteredChats.length === 0 ? `<div class="p-8 text-center"><div class="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center" data-svelte-h="svelte-gb2i72"><svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg></div> <p class="text-sm text-gray-500 dark:text-gray-400">${escape("No chats yet")}</p> ${`<p class="text-xs text-gray-400 dark:text-gray-500 mt-1" data-svelte-h="svelte-1c2rx7r">Start a new conversation to get started</p>`}</div>` : ``}</div></div>`;
});
const css = {
  code: ".prose{color:inherit;font-size:0.875rem;line-height:1.5}.prose p{margin-bottom:0.5rem;color:inherit}.prose p:last-child{margin-bottom:0}.prose ul,.prose ol{margin:0.5rem 0;padding-left:1.5rem;color:inherit}.prose li{margin-bottom:0.25rem;color:inherit}.prose code{background-color:rgba(0, 0, 0, 0.1);padding:0.125rem 0.25rem;border-radius:0.25rem;font-size:0.8em;color:inherit}.dark .prose code{background-color:rgba(255, 255, 255, 0.1)}.prose pre{background-color:rgba(0, 0, 0, 0.1);padding:0.75rem;border-radius:0.5rem;overflow-x:auto;margin:0.5rem 0}.dark .prose pre{background-color:rgba(255, 255, 255, 0.1)}.prose pre code{background-color:transparent;padding:0}.prose h1,.prose h2,.prose h3,.prose h4,.prose h5,.prose h6{color:inherit;margin:0.5rem 0 0.25rem 0}.prose strong{color:inherit}.prose em{color:inherit}",
  map: `{"version":3,"file":"ThinkingProcess.svelte","sources":["ThinkingProcess.svelte"],"sourcesContent":["<script lang=\\"ts\\">import { renderMarkdown } from \\"$lib/utils\\";\\nimport { slide } from \\"svelte/transition\\";\\nexport let thinking;\\nexport let isStreaming = false;\\nlet isExpanded = false;\\nlet thinkingDuration = 4;\\n$: renderedThinking = thinking ? renderMarkdown(thinking) : \\"\\";\\nfunction toggleExpanded() {\\n  isExpanded = !isExpanded;\\n}\\n<\/script>\\n\\n{#if thinking}\\n\\t<div class=\\"mb-3\\">\\n\\t\\t<!-- Thinking Header -->\\n\\t\\t<button\\n\\t\\t\\ton:click={toggleExpanded}\\n\\t\\t\\tclass=\\"w-full px-3 py-2 flex items-center justify-between bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors\\"\\n\\t\\t>\\n\\t\\t\\t<div class=\\"flex items-center space-x-2\\">\\n\\t\\t\\t\\t<!-- Thinking Icon -->\\n\\t\\t\\t\\t<div class=\\"w-4 h-4 flex items-center justify-center\\">\\n\\t\\t\\t\\t\\t{#if isStreaming}\\n\\t\\t\\t\\t\\t\\t<div class=\\"w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin\\"></div>\\n\\t\\t\\t\\t\\t{:else}\\n\\t\\t\\t\\t\\t\\t<svg class=\\"w-4 h-4 text-blue-500\\" fill=\\"none\\" stroke=\\"currentColor\\" viewBox=\\"0 0 24 24\\">\\n\\t\\t\\t\\t\\t\\t\\t<path stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\" stroke-width=\\"2\\" d=\\"M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z\\" />\\n\\t\\t\\t\\t\\t\\t</svg>\\n\\t\\t\\t\\t\\t{/if}\\n\\t\\t\\t\\t</div>\\n\\n\\t\\t\\t\\t<span class=\\"text-sm font-medium text-gray-600 dark:text-gray-400\\">\\n\\t\\t\\t\\t\\t{#if isStreaming}\\n\\t\\t\\t\\t\\t\\tThinking...\\n\\t\\t\\t\\t\\t{:else}\\n\\t\\t\\t\\t\\t\\tThought for {thinkingDuration} second{thinkingDuration !== 1 ? 's' : ''}\\n\\t\\t\\t\\t\\t{/if}\\n\\t\\t\\t\\t</span>\\n\\t\\t\\t</div>\\n\\n\\t\\t\\t<!-- Expand/Collapse Icon -->\\n\\t\\t\\t<svg\\n\\t\\t\\t\\tclass=\\"w-4 h-4 text-gray-500 transition-transform duration-200 {isExpanded ? 'rotate-180' : ''}\\"\\n\\t\\t\\t\\tfill=\\"none\\"\\n\\t\\t\\t\\tstroke=\\"currentColor\\"\\n\\t\\t\\t\\tviewBox=\\"0 0 24 24\\"\\n\\t\\t\\t>\\n\\t\\t\\t\\t<path stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\" stroke-width=\\"2\\" d=\\"M19 9l-7 7-7-7\\" />\\n\\t\\t\\t</svg>\\n\\t\\t</button>\\n\\n\\t\\t<!-- Thinking Content -->\\n\\t\\t{#if isExpanded}\\n\\t\\t\\t<div\\n\\t\\t\\t\\tclass=\\"mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700\\"\\n\\t\\t\\t\\ttransition:slide={{ duration: 200 }}\\n\\t\\t\\t>\\n\\t\\t\\t\\t<div class=\\"text-sm text-gray-600 dark:text-gray-400 prose prose-sm dark:prose-invert max-w-none\\">\\n\\t\\t\\t\\t\\t{#if isStreaming && thinking}\\n\\t\\t\\t\\t\\t\\t{@html renderedThinking}\\n\\t\\t\\t\\t\\t\\t<span class=\\"inline-block w-2 h-4 bg-gray-400 animate-pulse ml-1 rounded-sm\\"></span>\\n\\t\\t\\t\\t\\t{:else if thinking}\\n\\t\\t\\t\\t\\t\\t{@html renderedThinking}\\n\\t\\t\\t\\t\\t{:else}\\n\\t\\t\\t\\t\\t\\t<div class=\\"italic text-gray-500 dark:text-gray-400\\">No thinking process available</div>\\n\\t\\t\\t\\t\\t{/if}\\n\\t\\t\\t\\t</div>\\n\\t\\t\\t</div>\\n\\t\\t{/if}\\n\\t</div>\\n{/if}\\n\\n<style>\\n\\t/* Custom styles for thinking process */\\n\\t:global(.prose) {\\n\\t\\tcolor: inherit;\\n\\t\\tfont-size: 0.875rem;\\n\\t\\tline-height: 1.5;\\n\\t}\\n\\n\\t:global(.prose p) {\\n\\t\\tmargin-bottom: 0.5rem;\\n\\t\\tcolor: inherit;\\n\\t}\\n\\n\\t:global(.prose p:last-child) {\\n\\t\\tmargin-bottom: 0;\\n\\t}\\n\\n\\t:global(.prose ul),\\n\\t:global(.prose ol) {\\n\\t\\tmargin: 0.5rem 0;\\n\\t\\tpadding-left: 1.5rem;\\n\\t\\tcolor: inherit;\\n\\t}\\n\\n\\t:global(.prose li) {\\n\\t\\tmargin-bottom: 0.25rem;\\n\\t\\tcolor: inherit;\\n\\t}\\n\\n\\t:global(.prose code) {\\n\\t\\tbackground-color: rgba(0, 0, 0, 0.1);\\n\\t\\tpadding: 0.125rem 0.25rem;\\n\\t\\tborder-radius: 0.25rem;\\n\\t\\tfont-size: 0.8em;\\n\\t\\tcolor: inherit;\\n\\t}\\n\\n\\t:global(.dark .prose code) {\\n\\t\\tbackground-color: rgba(255, 255, 255, 0.1);\\n\\t}\\n\\n\\t:global(.prose pre) {\\n\\t\\tbackground-color: rgba(0, 0, 0, 0.1);\\n\\t\\tpadding: 0.75rem;\\n\\t\\tborder-radius: 0.5rem;\\n\\t\\toverflow-x: auto;\\n\\t\\tmargin: 0.5rem 0;\\n\\t}\\n\\n\\t:global(.dark .prose pre) {\\n\\t\\tbackground-color: rgba(255, 255, 255, 0.1);\\n\\t}\\n\\n\\t:global(.prose pre code) {\\n\\t\\tbackground-color: transparent;\\n\\t\\tpadding: 0;\\n\\t}\\n\\n\\t:global(.prose h1),\\n\\t:global(.prose h2),\\n\\t:global(.prose h3),\\n\\t:global(.prose h4),\\n\\t:global(.prose h5),\\n\\t:global(.prose h6) {\\n\\t\\tcolor: inherit;\\n\\t\\tmargin: 0.5rem 0 0.25rem 0;\\n\\t}\\n\\n\\t:global(.prose strong) {\\n\\t\\tcolor: inherit;\\n\\t}\\n\\n\\t:global(.prose em) {\\n\\t\\tcolor: inherit;\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AA0ES,MAAQ,CACf,KAAK,CAAE,OAAO,CACd,SAAS,CAAE,QAAQ,CACnB,WAAW,CAAE,GACd,CAEQ,QAAU,CACjB,aAAa,CAAE,MAAM,CACrB,KAAK,CAAE,OACR,CAEQ,mBAAqB,CAC5B,aAAa,CAAE,CAChB,CAEQ,SAAU,CACV,SAAW,CAClB,MAAM,CAAE,MAAM,CAAC,CAAC,CAChB,YAAY,CAAE,MAAM,CACpB,KAAK,CAAE,OACR,CAEQ,SAAW,CAClB,aAAa,CAAE,OAAO,CACtB,KAAK,CAAE,OACR,CAEQ,WAAa,CACpB,gBAAgB,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CACpC,OAAO,CAAE,QAAQ,CAAC,OAAO,CACzB,aAAa,CAAE,OAAO,CACtB,SAAS,CAAE,KAAK,CAChB,KAAK,CAAE,OACR,CAEQ,iBAAmB,CAC1B,gBAAgB,CAAE,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAC1C,CAEQ,UAAY,CACnB,gBAAgB,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CACpC,OAAO,CAAE,OAAO,CAChB,aAAa,CAAE,MAAM,CACrB,UAAU,CAAE,IAAI,CAChB,MAAM,CAAE,MAAM,CAAC,CAChB,CAEQ,gBAAkB,CACzB,gBAAgB,CAAE,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAC1C,CAEQ,eAAiB,CACxB,gBAAgB,CAAE,WAAW,CAC7B,OAAO,CAAE,CACV,CAEQ,SAAU,CACV,SAAU,CACV,SAAU,CACV,SAAU,CACV,SAAU,CACV,SAAW,CAClB,KAAK,CAAE,OAAO,CACd,MAAM,CAAE,MAAM,CAAC,CAAC,CAAC,OAAO,CAAC,CAC1B,CAEQ,aAAe,CACtB,KAAK,CAAE,OACR,CAEQ,SAAW,CAClB,KAAK,CAAE,OACR"}`
};
let thinkingDuration = 4;
const ThinkingProcess = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { thinking } = $$props;
  let { isStreaming: isStreaming2 = false } = $$props;
  if ($$props.thinking === void 0 && $$bindings.thinking && thinking !== void 0) $$bindings.thinking(thinking);
  if ($$props.isStreaming === void 0 && $$bindings.isStreaming && isStreaming2 !== void 0) $$bindings.isStreaming(isStreaming2);
  $$result.css.add(css);
  thinking ? renderMarkdown(thinking) : "";
  return `${thinking ? `<div class="mb-3"> <button class="w-full px-3 py-2 flex items-center justify-between bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"><div class="flex items-center space-x-2"> <div class="w-4 h-4 flex items-center justify-center">${isStreaming2 ? `<div class="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>` : `<svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>`}</div> <span class="text-sm font-medium text-gray-600 dark:text-gray-400">${isStreaming2 ? `Thinking...` : `Thought for ${escape(thinkingDuration)} second${escape("s")}`}</span></div>  <svg class="${"w-4 h-4 text-gray-500 transition-transform duration-200 " + escape("", true)}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></button>  ${``}</div>` : ``}`;
});
const MessageItem = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let renderedContent;
  let isUser;
  let { message } = $$props;
  let { isStreaming: isStreaming2 = false } = $$props;
  if ($$props.message === void 0 && $$bindings.message && message !== void 0) $$bindings.message(message);
  if ($$props.isStreaming === void 0 && $$bindings.isStreaming && isStreaming2 !== void 0) $$bindings.isStreaming(isStreaming2);
  renderedContent = renderMarkdown(message.content);
  isUser = message.role === "user";
  return `<div class="${"flex " + escape(isUser ? "justify-end" : "justify-start", true)}" role="group"><div class="${"max-w-3xl " + escape(isUser ? "order-2" : "", true)}"><div class="${"flex items-start space-x-3 " + escape(isUser ? "flex-row-reverse space-x-reverse" : "", true)}"> <div class="${"w-8 h-8 " + escape(isUser ? "bg-green-500" : "bg-blue-600", true) + " rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"}">${isUser ? `<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>` : `<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>`}</div>  <div class="flex-1 min-w-0"><div class="${"flex items-center space-x-2 mb-2 " + escape(isUser ? "justify-end" : "", true)}"><span class="text-sm font-medium text-gray-700 dark:text-gray-300">${escape(isUser ? "You" : "Assistant")}</span> <span class="text-xs text-gray-500 dark:text-gray-400">${escape(formatTime(message.timestamp))}</span></div>  ${!isUser && message.thinking ? `${validate_component(ThinkingProcess, "ThinkingProcess").$$render($$result, { thinking: message.thinking, isStreaming: isStreaming2 }, {}, {})}` : ``} <div class="relative group"><div class="${escape(
    isUser ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600",
    true
  ) + " rounded-2xl px-4 py-3 " + escape(isStreaming2 ? "message-enter" : "", true) + " shadow-sm"}">${isUser ? `<div class="whitespace-pre-wrap break-words">${escape(message.content)}</div>` : `<div class="prose prose-gray dark:prose-invert max-w-none prose-sm"><!-- HTML_TAG_START -->${renderedContent}<!-- HTML_TAG_END --></div> ${isStreaming2 ? `<div class="inline-block w-2 h-5 bg-gray-400 dark:bg-gray-300 animate-pulse ml-1 rounded-full"></div>` : ``}`}</div>  ${``}</div></div></div></div></div>`;
});
const TypingIndicator = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<div class="typing-indicator" data-svelte-h="svelte-1ga31bi"><div class="typing-dot"></div> <div class="typing-dot"></div> <div class="typing-dot"></div></div>`;
});
const MessageList = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $messages, $$unsubscribe_messages;
  let $isStreaming, $$unsubscribe_isStreaming;
  $$unsubscribe_messages = subscribe(messages, (value) => $messages = value);
  $$unsubscribe_isStreaming = subscribe(isStreaming, (value) => $isStreaming = value);
  let { chatId = null } = $$props;
  let messagesContainer;
  let streamingMessage = "";
  let streamingThinking = "";
  let streamingMessageId = "";
  function addStreamingContent(content, messageId, isThinking = false) {
    if (messageId && messageId !== streamingMessageId) {
      streamingMessage = "";
      streamingThinking = "";
      streamingMessageId = messageId;
    }
    if (isThinking) {
      streamingThinking += content;
    } else {
      streamingMessage += content;
    }
  }
  function finishStreaming(finalContent, finalThinking) {
    if (finalContent !== void 0) {
      streamingMessage = finalContent;
    }
    if (finalThinking !== void 0) {
      streamingThinking = finalThinking;
    }
    if ((streamingMessage || streamingThinking) && chatId) {
      const newMessage = {
        id: streamingMessageId || Date.now().toString(),
        chat_id: chatId,
        role: "assistant",
        content: streamingMessage,
        thinking: streamingThinking || void 0,
        timestamp: Math.floor(Date.now() / 1e3)
      };
      messages.update((msgs) => [...msgs, newMessage]);
    }
    streamingMessage = "";
    streamingMessageId = "";
  }
  function clearStreaming() {
    streamingMessage = "";
    streamingThinking = "";
    streamingMessageId = "";
  }
  if ($$props.chatId === void 0 && $$bindings.chatId && chatId !== void 0) $$bindings.chatId(chatId);
  if ($$props.addStreamingContent === void 0 && $$bindings.addStreamingContent && addStreamingContent !== void 0) $$bindings.addStreamingContent(addStreamingContent);
  if ($$props.finishStreaming === void 0 && $$bindings.finishStreaming && finishStreaming !== void 0) $$bindings.finishStreaming(finishStreaming);
  if ($$props.clearStreaming === void 0 && $$bindings.clearStreaming && clearStreaming !== void 0) $$bindings.clearStreaming(clearStreaming);
  $$unsubscribe_messages();
  $$unsubscribe_isStreaming();
  return `<div class="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50 dark:bg-gray-900"${add_attribute("this", messagesContainer, 0)}><div class="max-w-4xl mx-auto space-y-6">${$messages.length === 0 && !streamingMessage ? `<div class="text-center text-gray-500 dark:text-gray-400 mt-20" data-svelte-h="svelte-1fktq3p"><div class="w-20 h-20 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center"><svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg></div> <h2 class="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">Start a conversation</h2> <p class="text-gray-500 dark:text-gray-400">Send a message to begin chatting with the AI assistant.</p></div>` : `${each($messages, (message) => {
    return `${validate_component(MessageItem, "MessageItem").$$render($$result, { message }, {}, {})}`;
  })} ${streamingMessage || streamingThinking ? `${validate_component(MessageItem, "MessageItem").$$render(
    $$result,
    {
      message: {
        id: streamingMessageId,
        chat_id: chatId || "",
        role: "assistant",
        content: streamingMessage,
        thinking: streamingThinking || void 0,
        timestamp: Math.floor(Date.now() / 1e3)
      },
      isStreaming: true
    },
    {},
    {}
  )}` : `${$isStreaming ? `<div class="flex justify-start"><div class="max-w-3xl"><div class="flex items-start space-x-3"><div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm" data-svelte-h="svelte-189sxyb"><svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg></div> <div class="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl px-4 py-3 shadow-sm">${validate_component(TypingIndicator, "TypingIndicator").$$render($$result, {}, {}, {})}</div></div></div></div>` : ``}`}`}</div></div>`;
});
const MessageInput = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $isStreaming, $$unsubscribe_isStreaming;
  let $isLoading, $$unsubscribe_isLoading;
  let $modelStatus, $$unsubscribe_modelStatus;
  $$unsubscribe_isStreaming = subscribe(isStreaming, (value) => $isStreaming = value);
  $$unsubscribe_isLoading = subscribe(isLoading, (value) => $isLoading = value);
  $$unsubscribe_modelStatus = subscribe(modelStatus, (value) => $modelStatus = value);
  createEventDispatcher();
  let { placeholder = "Type your message..." } = $$props;
  let { disabled = false } = $$props;
  let message = "";
  let textArea;
  if ($$props.placeholder === void 0 && $$bindings.placeholder && placeholder !== void 0) $$bindings.placeholder(placeholder);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0) $$bindings.disabled(disabled);
  $$unsubscribe_isStreaming();
  $$unsubscribe_isLoading();
  $$unsubscribe_modelStatus();
  return `<div class="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"><div class="max-w-4xl mx-auto"><div class="flex items-end space-x-3"><div class="flex-1 relative"><textarea${add_attribute("placeholder", placeholder, 0)} ${disabled ? "disabled" : ""} rows="1" class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors" style="min-height: 48px; max-height: 200px;"${add_attribute("this", textArea, 0)}>${escape("")}</textarea></div> ${$isStreaming ? `<button class="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors flex items-center space-x-2 font-medium shadow-sm" data-svelte-h="svelte-1dy7w5k"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2"></rect></svg> <span>Stop</span></button>` : `<button ${!message.trim() || $isLoading || disabled ? "disabled" : ""} class="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center space-x-2 font-medium shadow-sm">${$isLoading ? `<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> <span data-svelte-h="svelte-1oib7d2">Sending...</span>` : `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg> <span data-svelte-h="svelte-14i38x8">Send</span>`}</button>`}</div> ${!$modelStatus.connected ? `<div class="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg" data-svelte-h="svelte-1gavaj8"><div class="flex items-center space-x-2"><svg class="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> <span class="text-sm text-yellow-700 dark:text-yellow-300 font-medium">No model connected</span></div> <p class="text-xs text-yellow-600 dark:text-yellow-400 mt-1">You can send messages but won&#39;t get AI responses. Click the model button in the header to configure VLLM connection.</p></div>` : `<div class="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center" data-svelte-h="svelte-1cidstp">Press Enter to send, Shift+Enter for new line</div>`}</div></div>`;
});
const ModelSettings = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let models;
  let $settings, $$unsubscribe_settings;
  let $modelStatus, $$unsubscribe_modelStatus;
  $$unsubscribe_settings = subscribe(settings, (value) => $settings = value);
  $$unsubscribe_modelStatus = subscribe(modelStatus, (value) => $modelStatus = value);
  let { isOpen = false } = $$props;
  let { onClose } = $$props;
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0) $$bindings.isOpen(isOpen);
  if ($$props.onClose === void 0 && $$bindings.onClose && onClose !== void 0) $$bindings.onClose(onClose);
  models = $modelStatus.models || [];
  $$unsubscribe_settings();
  $$unsubscribe_modelStatus();
  return `${isOpen ? `<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div class="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto"><div class="flex items-center justify-between mb-6"><h2 class="text-xl font-bold text-white" data-svelte-h="svelte-14f711m">Model Configuration</h2> <button class="text-gray-400 hover:text-white" data-svelte-h="svelte-13m9s7r"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div> <div class="space-y-6"> <div class="flex items-center justify-between"><h3 class="text-lg font-semibold text-white" data-svelte-h="svelte-1lcpkaq">Connection Status</h3> <div class="flex items-center space-x-2"><div class="${"w-3 h-3 rounded-full " + escape($modelStatus.connected ? "bg-green-500" : "bg-red-500", true)}"></div> <span class="text-sm text-gray-400">${escape($modelStatus.connected ? "Connected" : "Disconnected")}</span></div></div>  <div class="space-y-2"><label for="vllm-url" class="block text-sm font-medium text-gray-300" data-svelte-h="svelte-3xht4u">VLLM API URL</label> <input id="vllm-url" type="url" placeholder="http://localhost:8000/v1" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"${add_attribute("value", $settings.vllmApiUrl, 0)}> <p class="text-xs text-gray-500" data-svelte-h="svelte-1l04ufe">Enter the VLLM API endpoint URL (e.g., http://localhost:8000/v1)</p></div>  <div class="space-y-2"><label for="api-key" class="block text-sm font-medium text-gray-300" data-svelte-h="svelte-qdv98d">API Key (Optional)</label> <input id="api-key" type="password" placeholder="Enter API key if required" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"${add_attribute("value", $settings.vllmApiKey, 0)}></div>  <div class="flex space-x-3"><button ${!$settings.vllmApiUrl.trim() ? "disabled" : ""} class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2">${`<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> <span data-svelte-h="svelte-l5wddi">Test Connection</span>`}</button> <button class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors" data-svelte-h="svelte-c6dky0">Reset</button></div>  ${$modelStatus.error ? `<div class="p-3 bg-red-900/50 border border-red-700 rounded-lg"><div class="flex items-center space-x-2" data-svelte-h="svelte-1iw8ipj"><svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> <span class="text-red-400 text-sm">Connection Error</span></div> <p class="text-red-300 text-sm mt-1">${escape($modelStatus.error)}</p></div>` : ``}  ${$modelStatus.connected && models.length > 0 ? `<div class="space-y-2"><label for="model-select" class="block text-sm font-medium text-gray-300" data-svelte-h="svelte-1jkr3he">Select Model</label> <select id="model-select" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500">${each(models, (model) => {
    return `<option${add_attribute("value", model.id, 0)}>${escape(model.id)}</option>`;
  })}</select> <p class="text-xs text-gray-500">${escape(models.length)} model(s) available</p></div>` : ``}  <div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div class="space-y-2"><label for="temperature" class="block text-sm font-medium text-gray-300">Temperature: ${escape($settings.temperature)}</label> <input id="temperature" type="range" min="0" max="2" step="0.1" class="w-full"${add_attribute("value", $settings.temperature, 0)}></div> <div class="space-y-2"><label for="max-tokens" class="block text-sm font-medium text-gray-300" data-svelte-h="svelte-19kjneg">Max Tokens</label> <input id="max-tokens" type="number" min="1" max="8192" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"${add_attribute("value", $settings.maxTokens, 0)}></div></div>  <div class="space-y-2"><label for="system-prompt" class="block text-sm font-medium text-gray-300" data-svelte-h="svelte-vhfphu">System Prompt</label> <textarea id="system-prompt" placeholder="Enter system prompt (optional)" rows="3" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none">${escape($settings.systemPrompt || "")}</textarea></div>  <div class="space-y-2"><div class="flex items-center justify-between"><label for="thinking-mode" class="block text-sm font-medium text-gray-300" data-svelte-h="svelte-1nmzana">Thinking Mode</label> <label class="relative inline-flex items-center cursor-pointer"><input id="thinking-mode" type="checkbox" class="sr-only peer"${add_attribute("checked", $settings.thinkingMode, 1)}> <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div></label></div> <p class="text-xs text-gray-500" data-svelte-h="svelte-1asm8vt">When enabled, AI will show its thinking process before providing the final answer</p></div>  <div class="flex justify-end space-x-3 pt-4 border-t border-gray-700"><button class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors" data-svelte-h="svelte-1q6juk2">Cancel</button> <button class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors" data-svelte-h="svelte-fcvg55">Save Settings</button></div></div></div></div>` : ``}`;
});
function parseExistingMessage(content) {
  const thinkRegex = /<think>([\s\S]*?)<\/think>/g;
  let thinking = "";
  let answer = content;
  let match;
  while ((match = thinkRegex.exec(content)) !== null) {
    thinking += match[1];
  }
  answer = content.replace(thinkRegex, "").trim();
  return { thinking, answer };
}
const ChatInterface = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $currentChatId, $$unsubscribe_currentChatId;
  let $settings, $$unsubscribe_settings;
  let $$unsubscribe_messages;
  let $modelStatus, $$unsubscribe_modelStatus;
  let $sidebarOpen, $$unsubscribe_sidebarOpen;
  let $mobile, $$unsubscribe_mobile;
  let $currentChat, $$unsubscribe_currentChat;
  let $isLoading, $$unsubscribe_isLoading;
  $$unsubscribe_currentChatId = subscribe(currentChatId, (value) => $currentChatId = value);
  $$unsubscribe_settings = subscribe(settings, (value) => $settings = value);
  $$unsubscribe_messages = subscribe(messages, (value) => value);
  $$unsubscribe_modelStatus = subscribe(modelStatus, (value) => $modelStatus = value);
  $$unsubscribe_sidebarOpen = subscribe(sidebarOpen, (value) => $sidebarOpen = value);
  $$unsubscribe_mobile = subscribe(mobile, (value) => $mobile = value);
  $$unsubscribe_currentChat = subscribe(currentChat, (value) => $currentChat = value);
  $$unsubscribe_isLoading = subscribe(isLoading, (value) => $isLoading = value);
  let messageListComponent;
  let showModelSettings = false;
  async function createNewChat() {
    console.log("Creating new chat with settings:", $settings);
    try {
      const response = await api.createChat({
        title: "New Chat",
        model: $settings.model,
        temperature: $settings.temperature,
        max_tokens: $settings.maxTokens,
        system_prompt: $settings.systemPrompt
      });
      console.log("Create chat response:", response);
      if (response.success && response.data) {
        const newChat = response.data;
        chats.update((chats2) => [newChat, ...chats2]);
        await selectChat(newChat.id);
        console.log("New chat created successfully:", newChat.id);
      } else {
        console.error("Failed to create chat:", response.error);
        toast.error("Failed to create new chat: " + (response.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error creating chat:", error);
      toast.error("Error creating chat: " + error);
    }
  }
  async function selectChat(chatId) {
    currentChatId.set(chatId);
    const response = await api.getChat(chatId);
    if (response.success && response.data) {
      currentChat.set(response.data);
      const processedMessages = (response.data.messages || []).map((message) => {
        if (message.role === "assistant" && message.content && !message.thinking) {
          const parsed = parseExistingMessage(message.content);
          if (parsed.thinking) {
            return {
              ...message,
              content: parsed.answer,
              thinking: parsed.thinking
            };
          }
        }
        return message;
      });
      messages.set(processedMessages);
    } else {
      toast.error("Failed to load chat");
    }
  }
  onDestroy(() => {
  });
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    $$rendered = `<div class="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"> <div class="${"" + escape($sidebarOpen ? "translate-x-0" : "-translate-x-full", true) + " " + escape(
      $mobile ? "fixed inset-y-0 left-0 z-50 w-80" : "relative w-80",
      true
    ) + " transition-transform duration-300 ease-in-out"}">${validate_component(ChatSidebar, "ChatSidebar").$$render(
      $$result,
      {
        onNewChat: createNewChat,
        onSelectChat: selectChat
      },
      {},
      {}
    )}</div>  ${$mobile && $sidebarOpen ? `<div class="fixed inset-0 bg-black bg-opacity-50 z-40" role="button" tabindex="0" aria-label="Close sidebar"></div>` : ``}  <div class="flex-1 flex flex-col min-w-0"> <div class="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"><div class="flex items-center justify-between"><div class="flex items-center space-x-3">${$mobile ? `<button class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300" data-svelte-h="svelte-xs7rjj"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg></button>` : ``} <div class="flex items-center space-x-3"><h1 class="text-lg font-semibold text-gray-900 dark:text-white">${escape($currentChat?.title || "VLLM Chat")}</h1>  <div class="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg"><div class="${"w-2 h-2 rounded-full " + escape($modelStatus.connected ? "bg-green-500" : "bg-red-500", true)}"></div> <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg> <span class="text-sm font-medium text-gray-700 dark:text-gray-300">${escape($modelStatus.connected ? $settings.model : "No Model")}</span></div></div></div> <div class="flex items-center space-x-2"> <button class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300" title="Add Thinking Test Message" data-svelte-h="svelte-1dqqees"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg></button> <button class="${"p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 " + escape(
      !$modelStatus.connected ? "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400" : "",
      true
    )}" title="Model Settings"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg></button></div></div></div>  ${validate_component(MessageList, "MessageList").$$render(
      $$result,
      {
        chatId: $currentChatId,
        this: messageListComponent
      },
      {
        this: ($$value) => {
          messageListComponent = $$value;
          $$settled = false;
        }
      },
      {}
    )}  ${validate_component(MessageInput, "MessageInput").$$render($$result, { disabled: $isLoading }, {}, {})}</div></div>  ${validate_component(ModelSettings, "ModelSettings").$$render(
      $$result,
      {
        onClose: () => showModelSettings = false,
        isOpen: showModelSettings
      },
      {
        isOpen: ($$value) => {
          showModelSettings = $$value;
          $$settled = false;
        }
      },
      {}
    )}`;
  } while (!$$settled);
  $$unsubscribe_currentChatId();
  $$unsubscribe_settings();
  $$unsubscribe_messages();
  $$unsubscribe_modelStatus();
  $$unsubscribe_sidebarOpen();
  $$unsubscribe_mobile();
  $$unsubscribe_currentChat();
  $$unsubscribe_isLoading();
  return $$rendered;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${$$result.head += `<!-- HEAD_svelte-ipwlj6_START -->${$$result.title = `<title>VLLM Chat</title>`, ""}<meta name="description" content="Chat interface for VLLM inference"><!-- HEAD_svelte-ipwlj6_END -->`, ""} ${validate_component(ChatInterface, "ChatInterface").$$render($$result, {}, {}, {})}`;
});
export {
  Page as default
};
