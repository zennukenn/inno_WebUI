import { c as create_ssr_component, p as createEventDispatcher, f as escape, b as subscribe, a as add_attribute, e as each, v as validate_component, o as onDestroy } from "../../chunks/ssr.js";
import { w as writable } from "../../chunks/index.js";
import { b as toast } from "../../chunks/theme.js";
import { t as truncateText, f as formatTimestamp, r as renderMarkdown, a as formatTime } from "../../chunks/index2.js";
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
  vllmApiKey: ""
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
      const response = await fetch(`${vllmUrl}/models`, {
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
const css$1 = {
  code: ".backdrop-blur-sm.svelte-3ja166{backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)}@keyframes svelte-3ja166-pulse{0%,100%{opacity:1}50%{opacity:0.7}}.animate-pulse.svelte-3ja166{animation:svelte-3ja166-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite}",
  map: '{"version":3,"file":"DeleteChatDialog.svelte","sources":["DeleteChatDialog.svelte"],"sourcesContent":["<script lang=\\"ts\\">import { createEventDispatcher } from \\"svelte\\";\\nimport { fade, scale } from \\"svelte/transition\\";\\nconst dispatch = createEventDispatcher();\\nexport let isOpen = false;\\nexport let chatTitle = \\"\\";\\nfunction handleConfirm() {\\n  dispatch(\\"confirm\\");\\n  isOpen = false;\\n}\\nfunction handleCancel() {\\n  dispatch(\\"cancel\\");\\n  isOpen = false;\\n}\\nfunction handleBackdropClick(event) {\\n  if (event.target === event.currentTarget) {\\n    handleCancel();\\n  }\\n}\\nfunction handleKeydown(event) {\\n  if (event.key === \\"Escape\\") {\\n    handleCancel();\\n  } else if (event.key === \\"Enter\\") {\\n    handleConfirm();\\n  }\\n}\\n<\/script>\\n\\n<svelte:window on:keydown={handleKeydown} />\\n\\n{#if isOpen}\\n\\t<!-- Backdrop -->\\n\\t<div \\n\\t\\tclass=\\"fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4\\"\\n\\t\\ton:click={handleBackdropClick}\\n\\t\\ttransition:fade={{ duration: 200 }}\\n\\t>\\n\\t\\t<!-- Dialog -->\\n\\t\\t<div \\n\\t\\t\\tclass=\\"bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden border border-gray-200 dark:border-gray-700\\"\\n\\t\\t\\ttransition:scale={{ duration: 200, start: 0.95 }}\\n\\t\\t>\\n\\t\\t\\t<!-- Header with gradient -->\\n\\t\\t\\t<div class=\\"px-6 py-5 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-b border-red-100 dark:border-red-800\\">\\n\\t\\t\\t\\t<div class=\\"flex items-center space-x-4\\">\\n\\t\\t\\t\\t\\t<!-- Animated delete icon -->\\n\\t\\t\\t\\t\\t<div class=\\"flex-shrink-0\\">\\n\\t\\t\\t\\t\\t\\t<div class=\\"w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center animate-pulse\\">\\n\\t\\t\\t\\t\\t\\t\\t<svg class=\\"w-6 h-6 text-red-600 dark:text-red-400\\" fill=\\"none\\" stroke=\\"currentColor\\" viewBox=\\"0 0 24 24\\">\\n\\t\\t\\t\\t\\t\\t\\t\\t<path stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\" stroke-width=\\"2\\" d=\\"M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16\\" />\\n\\t\\t\\t\\t\\t\\t\\t</svg>\\n\\t\\t\\t\\t\\t\\t</div>\\n\\t\\t\\t\\t\\t</div>\\n\\t\\t\\t\\t\\t\\n\\t\\t\\t\\t\\t<div class=\\"flex-1 min-w-0\\">\\n\\t\\t\\t\\t\\t\\t<h3 class=\\"text-lg font-semibold text-gray-900 dark:text-white\\">\\n\\t\\t\\t\\t\\t\\t\\tDelete Chat\\n\\t\\t\\t\\t\\t\\t</h3>\\n\\t\\t\\t\\t\\t\\t<p class=\\"text-sm text-red-600 dark:text-red-400 mt-1\\">\\n\\t\\t\\t\\t\\t\\t\\tThis action cannot be undone\\n\\t\\t\\t\\t\\t\\t</p>\\n\\t\\t\\t\\t\\t</div>\\n\\t\\t\\t\\t</div>\\n\\t\\t\\t</div>\\n\\n\\t\\t\\t<!-- Content -->\\n\\t\\t\\t<div class=\\"px-6 py-5\\">\\n\\t\\t\\t\\t<div class=\\"space-y-4\\">\\n\\t\\t\\t\\t\\t<p class=\\"text-gray-700 dark:text-gray-300 leading-relaxed\\">\\n\\t\\t\\t\\t\\t\\tAre you sure you want to delete the chat \\n\\t\\t\\t\\t\\t\\t<span class=\\"font-semibold text-gray-900 dark:text-white\\">\\"{chatTitle}\\"</span>?\\n\\t\\t\\t\\t\\t</p>\\n\\t\\t\\t\\t\\t\\n\\t\\t\\t\\t\\t<div class=\\"bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4\\">\\n\\t\\t\\t\\t\\t\\t<div class=\\"flex items-start space-x-3\\">\\n\\t\\t\\t\\t\\t\\t\\t<svg class=\\"w-5 h-5 text-red-500 mt-0.5 flex-shrink-0\\" fill=\\"none\\" stroke=\\"currentColor\\" viewBox=\\"0 0 24 24\\">\\n\\t\\t\\t\\t\\t\\t\\t\\t<path stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\" stroke-width=\\"2\\" d=\\"M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z\\" />\\n\\t\\t\\t\\t\\t\\t\\t</svg>\\n\\t\\t\\t\\t\\t\\t\\t<div class=\\"text-sm\\">\\n\\t\\t\\t\\t\\t\\t\\t\\t<p class=\\"font-medium text-red-800 dark:text-red-200\\">\\n\\t\\t\\t\\t\\t\\t\\t\\t\\tAll messages will be permanently lost\\n\\t\\t\\t\\t\\t\\t\\t\\t</p>\\n\\t\\t\\t\\t\\t\\t\\t\\t<p class=\\"text-red-700 dark:text-red-300 mt-1\\">\\n\\t\\t\\t\\t\\t\\t\\t\\t\\tThis includes all conversation history, attachments, and any shared content in this chat.\\n\\t\\t\\t\\t\\t\\t\\t\\t</p>\\n\\t\\t\\t\\t\\t\\t\\t</div>\\n\\t\\t\\t\\t\\t\\t</div>\\n\\t\\t\\t\\t\\t</div>\\n\\t\\t\\t\\t</div>\\n\\t\\t\\t</div>\\n\\n\\t\\t\\t<!-- Actions -->\\n\\t\\t\\t<div class=\\"px-6 py-4 bg-gray-50 dark:bg-gray-700/50 flex items-center justify-end space-x-3\\">\\n\\t\\t\\t\\t<button\\n\\t\\t\\t\\t\\ttype=\\"button\\"\\n\\t\\t\\t\\t\\ton:click={handleCancel}\\n\\t\\t\\t\\t\\tclass=\\"px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200\\"\\n\\t\\t\\t\\t>\\n\\t\\t\\t\\t\\tCancel\\n\\t\\t\\t\\t</button>\\n\\t\\t\\t\\t<button\\n\\t\\t\\t\\t\\ttype=\\"button\\"\\n\\t\\t\\t\\t\\ton:click={handleConfirm}\\n\\t\\t\\t\\t\\tclass=\\"px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-lg transition-all duration-200 hover:scale-105 transform\\"\\n\\t\\t\\t\\t>\\n\\t\\t\\t\\t\\t<span class=\\"flex items-center space-x-2\\">\\n\\t\\t\\t\\t\\t\\t<svg class=\\"w-4 h-4\\" fill=\\"none\\" stroke=\\"currentColor\\" viewBox=\\"0 0 24 24\\">\\n\\t\\t\\t\\t\\t\\t\\t<path stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\" stroke-width=\\"2\\" d=\\"M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16\\" />\\n\\t\\t\\t\\t\\t\\t</svg>\\n\\t\\t\\t\\t\\t\\t<span>Delete Chat</span>\\n\\t\\t\\t\\t\\t</span>\\n\\t\\t\\t\\t</button>\\n\\t\\t\\t</div>\\n\\t\\t</div>\\n\\t</div>\\n{/if}\\n\\n<style>\\n\\t/* Custom backdrop blur for better browser support */\\n\\t.backdrop-blur-sm {\\n\\t\\tbackdrop-filter: blur(4px);\\n\\t\\t-webkit-backdrop-filter: blur(4px);\\n\\t}\\n\\t\\n\\t/* Smooth animations */\\n\\t@keyframes pulse {\\n\\t\\t0%, 100% {\\n\\t\\t\\topacity: 1;\\n\\t\\t}\\n\\t\\t50% {\\n\\t\\t\\topacity: 0.7;\\n\\t\\t}\\n\\t}\\n\\t\\n\\t.animate-pulse {\\n\\t\\tanimation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AAsHC,+BAAkB,CACjB,eAAe,CAAE,KAAK,GAAG,CAAC,CAC1B,uBAAuB,CAAE,KAAK,GAAG,CAClC,CAGA,WAAW,mBAAM,CAChB,EAAE,CAAE,IAAK,CACR,OAAO,CAAE,CACV,CACA,GAAI,CACH,OAAO,CAAE,GACV,CACD,CAEA,4BAAe,CACd,SAAS,CAAE,mBAAK,CAAC,EAAE,CAAC,aAAa,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,QAClD"}'
};
const DeleteChatDialog = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  createEventDispatcher();
  let { isOpen = false } = $$props;
  let { chatTitle = "" } = $$props;
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0) $$bindings.isOpen(isOpen);
  if ($$props.chatTitle === void 0 && $$bindings.chatTitle && chatTitle !== void 0) $$bindings.chatTitle(chatTitle);
  $$result.css.add(css$1);
  return ` ${isOpen ? ` <div class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4 svelte-3ja166"> <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden border border-gray-200 dark:border-gray-700"> <div class="px-6 py-5 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-b border-red-100 dark:border-red-800" data-svelte-h="svelte-8dfzm2"><div class="flex items-center space-x-4"> <div class="flex-shrink-0"><div class="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center animate-pulse svelte-3ja166"><svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></div></div> <div class="flex-1 min-w-0"><h3 class="text-lg font-semibold text-gray-900 dark:text-white">Delete Chat</h3> <p class="text-sm text-red-600 dark:text-red-400 mt-1">This action cannot be undone</p></div></div></div>  <div class="px-6 py-5"><div class="space-y-4"><p class="text-gray-700 dark:text-gray-300 leading-relaxed">Are you sure you want to delete the chat 
						<span class="font-semibold text-gray-900 dark:text-white">&quot;${escape(chatTitle)}&quot;</span>?</p> <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4" data-svelte-h="svelte-1b1ehty"><div class="flex items-start space-x-3"><svg class="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path></svg> <div class="text-sm"><p class="font-medium text-red-800 dark:text-red-200">All messages will be permanently lost</p> <p class="text-red-700 dark:text-red-300 mt-1">This includes all conversation history, attachments, and any shared content in this chat.</p></div></div></div></div></div>  <div class="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 flex items-center justify-end space-x-3"><button type="button" class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200" data-svelte-h="svelte-106nb5f">Cancel</button> <button type="button" class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-lg transition-all duration-200 hover:scale-105 transform" data-svelte-h="svelte-1p6y99z"><span class="flex items-center space-x-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg> <span>Delete Chat</span></span></button></div></div></div>` : ``}`;
});
const ChatSidebar = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $currentChatId, $$unsubscribe_currentChatId;
  let $chats, $$unsubscribe_chats;
  $$unsubscribe_currentChatId = subscribe(currentChatId, (value) => $currentChatId = value);
  $$unsubscribe_chats = subscribe(chats, (value) => $chats = value);
  let { onNewChat } = $$props;
  let { onSelectChat } = $$props;
  let searchQuery = "";
  let filteredChats = [];
  let showDeleteConfirm = false;
  let chatToDeleteTitle = "";
  if ($$props.onNewChat === void 0 && $$bindings.onNewChat && onNewChat !== void 0) $$bindings.onNewChat(onNewChat);
  if ($$props.onSelectChat === void 0 && $$bindings.onSelectChat && onSelectChat !== void 0) $$bindings.onSelectChat(onSelectChat);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    {
      {
        if (searchQuery.trim()) {
          filteredChats = $chats.filter((chat) => chat.title.toLowerCase().includes(searchQuery.toLowerCase()));
        } else {
          filteredChats = $chats;
        }
      }
    }
    $$rendered = `<div class="flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700"> <div class="p-4 border-b border-gray-200 dark:border-gray-700"><div class="flex items-center justify-between mb-4"><div class="flex items-center space-x-2" data-svelte-h="svelte-2feria"><div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"><svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg></div> <h1 class="text-lg font-semibold text-gray-900 dark:text-white">VLLM Chat</h1></div> <button class="md:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400" data-svelte-h="svelte-1phmgvb"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div> <button class="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center space-x-2" data-svelte-h="svelte-uxe5gb"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg> <span>New Chat</span></button></div>  <div class="p-4"><div class="relative"><svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg> <input type="text" placeholder="Search chats..." class="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"${add_attribute("value", searchQuery, 0)}></div></div>  <div class="flex-1 overflow-y-auto px-2"><div class="space-y-1">${each(filteredChats, (chat) => {
      return `<div class="${"p-3 rounded-lg cursor-pointer transition-all duration-200 group transform hover:scale-[1.01] " + escape(
        $currentChatId === chat.id ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 shadow-sm" : "hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:shadow-sm",
        true
      )}"><div class="flex items-start justify-between"><div class="flex-1 min-w-0"><h3 class="${"text-sm font-medium " + escape(
        $currentChatId === chat.id ? "text-blue-700 dark:text-blue-300" : "text-gray-900 dark:text-white",
        true
      ) + " truncate"}">${escape(truncateText(chat.title, 30))}</h3> <p class="${"text-xs " + escape(
        $currentChatId === chat.id ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400",
        true
      ) + " mt-1"}">${escape(formatTimestamp(new Date(chat.updated_at || chat.created_at || "").getTime() / 1e3))} </p></div> <button class="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/20 transition-all duration-200 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:scale-110 transform" title="Delete chat" data-svelte-h="svelte-8yda32"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg> </button></div> </div>`;
    })}</div> ${filteredChats.length === 0 ? `<div class="p-8 text-center"><div class="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center" data-svelte-h="svelte-gb2i72"><svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg></div> <p class="text-sm text-gray-500 dark:text-gray-400">${escape("No chats yet")}</p> ${`<p class="text-xs text-gray-400 dark:text-gray-500 mt-1" data-svelte-h="svelte-1c2rx7r">Start a new conversation to get started</p>`}</div>` : ``}</div></div>  ${validate_component(DeleteChatDialog, "DeleteChatDialog").$$render(
      $$result,
      {
        chatTitle: chatToDeleteTitle,
        isOpen: showDeleteConfirm
      },
      {
        isOpen: ($$value) => {
          showDeleteConfirm = $$value;
          $$settled = false;
        }
      },
      {}
    )}`;
  } while (!$$settled);
  $$unsubscribe_currentChatId();
  $$unsubscribe_chats();
  return $$rendered;
});
function parseContent(content) {
  const blocks = [];
  const lines = content.split("\n");
  let currentBlock = null;
  let inCodeBlock = false;
  let codeLanguage = "";
  let inThinking = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    if (isThinkingStart(trimmedLine)) {
      if (currentBlock) {
        blocks.push(currentBlock);
        currentBlock = null;
      }
      inThinking = true;
      continue;
    }
    if (isThinkingEnd(trimmedLine)) {
      if (currentBlock && currentBlock.type === "thinking") {
        blocks.push(currentBlock);
        currentBlock = null;
      }
      inThinking = false;
      continue;
    }
    const codeBlockMatch = trimmedLine.match(/^```(\w+)?/);
    if (codeBlockMatch) {
      if (currentBlock) {
        blocks.push(currentBlock);
      }
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeLanguage = codeBlockMatch[1] || "";
        currentBlock = {
          type: "code",
          content: "",
          language: codeLanguage
        };
      } else {
        if (currentBlock) {
          blocks.push(currentBlock);
        }
        inCodeBlock = false;
        codeLanguage = "";
        currentBlock = null;
      }
      continue;
    }
    if (inCodeBlock && currentBlock) {
      currentBlock.content += (currentBlock.content ? "\n" : "") + line;
      continue;
    }
    const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch && !inThinking) {
      if (currentBlock) {
        blocks.push(currentBlock);
      }
      blocks.push({
        type: "heading",
        content: headingMatch[2],
        level: headingMatch[1].length
      });
      currentBlock = null;
      continue;
    }
    if (isListItem(trimmedLine) && !inThinking) {
      if (!currentBlock || currentBlock.type !== "list") {
        if (currentBlock) {
          blocks.push(currentBlock);
        }
        currentBlock = {
          type: "list",
          content: line
        };
      } else {
        currentBlock.content += "\n" + line;
      }
      continue;
    }
    if (trimmedLine.startsWith(">") && !inThinking) {
      if (!currentBlock || currentBlock.type !== "quote") {
        if (currentBlock) {
          blocks.push(currentBlock);
        }
        currentBlock = {
          type: "quote",
          content: line
        };
      } else {
        currentBlock.content += "\n" + line;
      }
      continue;
    }
    if (isMathBlock(trimmedLine)) {
      if (currentBlock) {
        blocks.push(currentBlock);
      }
      blocks.push({
        type: "math",
        content: trimmedLine
      });
      currentBlock = null;
      continue;
    }
    const blockType = inThinking ? "thinking" : "main";
    if (!currentBlock || currentBlock.type !== blockType) {
      if (currentBlock) {
        blocks.push(currentBlock);
      }
      currentBlock = {
        type: blockType,
        content: line
      };
    } else {
      if (trimmedLine || currentBlock.content.trim()) {
        currentBlock.content += "\n" + line;
      }
    }
  }
  if (currentBlock) {
    blocks.push(currentBlock);
  }
  const cleanedBlocks = blocks.filter((block) => block.content.trim()).map((block) => ({
    ...block,
    content: block.content.trim()
  }));
  const hasThinking = cleanedBlocks.some((block) => block.type === "thinking");
  const hasCode = cleanedBlocks.some((block) => block.type === "code");
  const mainContentBlocks = cleanedBlocks.filter((block) => block.type !== "thinking");
  return {
    blocks: cleanedBlocks,
    hasThinking,
    hasCode,
    mainContentBlocks
  };
}
function isThinkingStart(line) {
  const thinkingPatterns = [
    /^<thinking>/i,
    /^<think>/i,
    /^思考[:：]/i,
    /^让我想想/i,
    /^我需要思考/i,
    /^分析[:：]/i,
    /^reasoning[:：]/i,
    /^thought[:：]/i
  ];
  return thinkingPatterns.some((pattern) => pattern.test(line));
}
function isThinkingEnd(line) {
  const endPatterns = [
    /^<\/thinking>/i,
    /^<\/think>/i,
    /^思考结束/i,
    /^分析结束/i,
    /^结论[:：]/i,
    /^答案[:：]/i,
    /^回答[:：]/i
  ];
  return endPatterns.some((pattern) => pattern.test(line));
}
function isListItem(line) {
  return /^[\s]*[-*+]\s+/.test(line) || /^[\s]*\d+\.\s+/.test(line);
}
function isMathBlock(line) {
  return /^\$\$.*\$\$$/.test(line) || /^\\\[.*\\\]$/.test(line);
}
function getContentSummary(parsed) {
  const { blocks, hasThinking, hasCode } = parsed;
  const mainBlocks = blocks.filter((block) => block.type === "main");
  if (mainBlocks.length === 0) {
    return hasThinking ? "思考过程" : "内容";
  }
  const firstMainBlock = mainBlocks[0];
  const summary = firstMainBlock.content.substring(0, 100);
  const features = [];
  if (hasThinking) features.push("包含思考过程");
  if (hasCode) features.push("包含代码");
  return features.length > 0 ? `${summary}... (${features.join("、")})` : summary;
}
const css = {
  code: ".thinking-block.svelte-in0eu3.svelte-in0eu3{animation:svelte-in0eu3-fadeIn 0.3s ease-in-out}.code-block.svelte-in0eu3.svelte-in0eu3{animation:svelte-in0eu3-slideIn 0.3s ease-in-out}@keyframes svelte-in0eu3-fadeIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}@keyframes svelte-in0eu3-slideIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}pre.svelte-in0eu3 code.svelte-in0eu3{font-family:'Fira Code', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace;line-height:1.5}.thinking-block.svelte-in0eu3 .prose.svelte-in0eu3{font-size:0.875rem;line-height:1.6}",
  map: `{"version":3,"file":"ContentBlock.svelte","sources":["ContentBlock.svelte"],"sourcesContent":["<script lang=\\"ts\\">import { onMount } from \\"svelte\\";\\nimport { slide } from \\"svelte/transition\\";\\nimport { renderMarkdown } from \\"$lib/utils\\";\\nexport let block;\\nexport let isStreaming = false;\\nlet isThinkingExpanded = false;\\nlet renderedContent = \\"\\";\\n$: {\\n  if (block.type === \\"code\\") {\\n    renderedContent = block.content;\\n  } else if (block.type === \\"thinking\\") {\\n    renderedContent = block.content.replace(/\\\\n/g, \\"<br>\\");\\n  } else {\\n    renderedContent = renderMarkdown(block.content);\\n  }\\n}\\nfunction toggleThinking() {\\n  isThinkingExpanded = !isThinkingExpanded;\\n}\\nfunction copyContent() {\\n  navigator.clipboard.writeText(block.content);\\n}\\n<\/script>\\n\\n{#if block.type === 'thinking'}\\n\\t<!-- 思考过程块 - 可折叠 -->\\n\\t<div class=\\"thinking-block mb-4 border border-amber-200 dark:border-amber-800 rounded-lg overflow-hidden bg-amber-50 dark:bg-amber-900/10\\">\\n\\t\\t<button\\n\\t\\t\\ton:click={toggleThinking}\\n\\t\\t\\tclass=\\"w-full px-4 py-3 flex items-center justify-between text-left hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-colors\\"\\n\\t\\t>\\n\\t\\t\\t<div class=\\"flex items-center space-x-2\\">\\n\\t\\t\\t\\t<svg class=\\"w-4 h-4 text-amber-600 dark:text-amber-400\\" fill=\\"none\\" stroke=\\"currentColor\\" viewBox=\\"0 0 24 24\\">\\n\\t\\t\\t\\t\\t<path stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\" stroke-width=\\"2\\" d=\\"M9.663 17h4.673M12 3v1m6.364-.636l-.707.707M21 12h-1M17.657 18.364l-.707-.707M12 21v-1m-6.364.636l.707-.707M3 12h1M6.343 5.636l.707.707\\" />\\n\\t\\t\\t\\t</svg>\\n\\t\\t\\t\\t<span class=\\"text-sm font-medium text-amber-800 dark:text-amber-200\\">思考过程</span>\\n\\t\\t\\t\\t<span class=\\"text-xs text-amber-600 dark:text-amber-400\\">({block.content.length} 字符)</span>\\n\\t\\t\\t</div>\\n\\t\\t\\t<svg \\n\\t\\t\\t\\tclass=\\"w-4 h-4 text-amber-600 dark:text-amber-400 transform transition-transform {isThinkingExpanded ? 'rotate-180' : ''}\\"\\n\\t\\t\\t\\tfill=\\"none\\" stroke=\\"currentColor\\" viewBox=\\"0 0 24 24\\"\\n\\t\\t\\t>\\n\\t\\t\\t\\t<path stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\" stroke-width=\\"2\\" d=\\"M19 9l-7 7-7-7\\" />\\n\\t\\t\\t</svg>\\n\\t\\t</button>\\n\\t\\t\\n\\t\\t{#if isThinkingExpanded}\\n\\t\\t\\t<div transition:slide={{ duration: 300 }} class=\\"px-4 pb-4\\">\\n\\t\\t\\t\\t<div class=\\"prose prose-sm max-w-none text-amber-800 dark:text-amber-200 bg-white dark:bg-gray-800 rounded p-3 border border-amber-200 dark:border-amber-700\\">\\n\\t\\t\\t\\t\\t{@html renderedContent}\\n\\t\\t\\t\\t</div>\\n\\t\\t\\t</div>\\n\\t\\t{/if}\\n\\t</div>\\n\\n{:else if block.type === 'code'}\\n\\t<!-- 代码块 -->\\n\\t<div class=\\"code-block mb-4 rounded-lg overflow-hidden bg-gray-900 dark:bg-gray-800 border border-gray-700\\">\\n\\t\\t<div class=\\"flex items-center justify-between px-4 py-2 bg-gray-800 dark:bg-gray-700 border-b border-gray-700\\">\\n\\t\\t\\t<div class=\\"flex items-center space-x-2\\">\\n\\t\\t\\t\\t<svg class=\\"w-4 h-4 text-green-400\\" fill=\\"none\\" stroke=\\"currentColor\\" viewBox=\\"0 0 24 24\\">\\n\\t\\t\\t\\t\\t<path stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\" stroke-width=\\"2\\" d=\\"M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4\\" />\\n\\t\\t\\t\\t</svg>\\n\\t\\t\\t\\t<span class=\\"text-sm font-medium text-gray-300\\">\\n\\t\\t\\t\\t\\t{block.language || 'Code'}\\n\\t\\t\\t\\t</span>\\n\\t\\t\\t</div>\\n\\t\\t\\t<button\\n\\t\\t\\t\\ton:click={copyContent}\\n\\t\\t\\t\\tclass=\\"p-1 rounded hover:bg-gray-600 text-gray-400 hover:text-white transition-colors\\"\\n\\t\\t\\t\\ttitle=\\"Copy code\\"\\n\\t\\t\\t>\\n\\t\\t\\t\\t<svg class=\\"w-4 h-4\\" fill=\\"none\\" stroke=\\"currentColor\\" viewBox=\\"0 0 24 24\\">\\n\\t\\t\\t\\t\\t<path stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\" stroke-width=\\"2\\" d=\\"M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z\\" />\\n\\t\\t\\t\\t</svg>\\n\\t\\t\\t</button>\\n\\t\\t</div>\\n\\t\\t<pre class=\\"p-4 text-sm text-gray-100 overflow-x-auto\\"><code class=\\"language-{block.language || 'text'}\\">{block.content}</code></pre>\\n\\t</div>\\n\\n{:else if block.type === 'heading'}\\n\\t<!-- 标题块 -->\\n\\t<div class=\\"heading-block mb-4\\">\\n\\t\\t{#if block.level === 1}\\n\\t\\t\\t<h1 class=\\"text-2xl font-bold text-gray-900 dark:text-white mb-2\\">{block.content}</h1>\\n\\t\\t{:else if block.level === 2}\\n\\t\\t\\t<h2 class=\\"text-xl font-bold text-gray-900 dark:text-white mb-2\\">{block.content}</h2>\\n\\t\\t{:else if block.level === 3}\\n\\t\\t\\t<h3 class=\\"text-lg font-semibold text-gray-900 dark:text-white mb-2\\">{block.content}</h3>\\n\\t\\t{:else if block.level === 4}\\n\\t\\t\\t<h4 class=\\"text-base font-semibold text-gray-900 dark:text-white mb-2\\">{block.content}</h4>\\n\\t\\t{:else if block.level === 5}\\n\\t\\t\\t<h5 class=\\"text-sm font-semibold text-gray-900 dark:text-white mb-2\\">{block.content}</h5>\\n\\t\\t{:else}\\n\\t\\t\\t<h6 class=\\"text-xs font-semibold text-gray-900 dark:text-white mb-2\\">{block.content}</h6>\\n\\t\\t{/if}\\n\\t</div>\\n\\n{:else if block.type === 'list'}\\n\\t<!-- 列表块 -->\\n\\t<div class=\\"list-block mb-4 pl-4 border-l-4 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10 rounded-r-lg p-3\\">\\n\\t\\t<div class=\\"prose prose-sm max-w-none text-gray-800 dark:text-gray-200\\">\\n\\t\\t\\t{@html renderMarkdown(block.content)}\\n\\t\\t</div>\\n\\t</div>\\n\\n{:else if block.type === 'quote'}\\n\\t<!-- 引用块 -->\\n\\t<div class=\\"quote-block mb-4 pl-4 border-l-4 border-gray-400 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 rounded-r-lg p-3\\">\\n\\t\\t<div class=\\"prose prose-sm max-w-none text-gray-700 dark:text-gray-300 italic\\">\\n\\t\\t\\t{@html renderMarkdown(block.content)}\\n\\t\\t</div>\\n\\t</div>\\n\\n{:else if block.type === 'math'}\\n\\t<!-- 数学公式块 -->\\n\\t<div class=\\"math-block mb-4 p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg\\">\\n\\t\\t<div class=\\"text-center\\">\\n\\t\\t\\t{@html renderMarkdown(block.content)}\\n\\t\\t</div>\\n\\t</div>\\n\\n{:else}\\n\\t<!-- 主要内容块 -->\\n\\t<div class=\\"main-content mb-4\\">\\n\\t\\t<div class=\\"prose prose-gray dark:prose-invert max-w-none prose-sm\\">\\n\\t\\t\\t{@html renderedContent}\\n\\t\\t\\t{#if isStreaming}\\n\\t\\t\\t\\t<span class=\\"inline-block w-2 h-5 bg-gray-400 dark:bg-gray-300 animate-pulse ml-1 rounded-full\\"></span>\\n\\t\\t\\t{/if}\\n\\t\\t</div>\\n\\t</div>\\n{/if}\\n\\n<style>\\n\\t.thinking-block {\\n\\t\\tanimation: fadeIn 0.3s ease-in-out;\\n\\t}\\n\\t\\n\\t.code-block {\\n\\t\\tanimation: slideIn 0.3s ease-in-out;\\n\\t}\\n\\t\\n\\t@keyframes fadeIn {\\n\\t\\tfrom {\\n\\t\\t\\topacity: 0;\\n\\t\\t\\ttransform: translateY(-10px);\\n\\t\\t}\\n\\t\\tto {\\n\\t\\t\\topacity: 1;\\n\\t\\t\\ttransform: translateY(0);\\n\\t\\t}\\n\\t}\\n\\t\\n\\t@keyframes slideIn {\\n\\t\\tfrom {\\n\\t\\t\\topacity: 0;\\n\\t\\t\\ttransform: translateX(-10px);\\n\\t\\t}\\n\\t\\tto {\\n\\t\\t\\topacity: 1;\\n\\t\\t\\ttransform: translateX(0);\\n\\t\\t}\\n\\t}\\n\\t\\n\\t/* 代码高亮样式 */\\n\\tpre code {\\n\\t\\tfont-family: 'Fira Code', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace;\\n\\t\\tline-height: 1.5;\\n\\t}\\n\\t\\n\\t/* 思考过程样式 */\\n\\t.thinking-block .prose {\\n\\t\\tfont-size: 0.875rem;\\n\\t\\tline-height: 1.6;\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AAuIC,2CAAgB,CACf,SAAS,CAAE,oBAAM,CAAC,IAAI,CAAC,WACxB,CAEA,uCAAY,CACX,SAAS,CAAE,qBAAO,CAAC,IAAI,CAAC,WACzB,CAEA,WAAW,oBAAO,CACjB,IAAK,CACJ,OAAO,CAAE,CAAC,CACV,SAAS,CAAE,WAAW,KAAK,CAC5B,CACA,EAAG,CACF,OAAO,CAAE,CAAC,CACV,SAAS,CAAE,WAAW,CAAC,CACxB,CACD,CAEA,WAAW,qBAAQ,CAClB,IAAK,CACJ,OAAO,CAAE,CAAC,CACV,SAAS,CAAE,WAAW,KAAK,CAC5B,CACA,EAAG,CACF,OAAO,CAAE,CAAC,CACV,SAAS,CAAE,WAAW,CAAC,CACxB,CACD,CAGA,iBAAG,CAAC,kBAAK,CACR,WAAW,CAAE,WAAW,CAAC,CAAC,QAAQ,CAAC,CAAC,eAAe,CAAC,CAAC,aAAa,CAAC,CAAC,SAAS,CAC7E,WAAW,CAAE,GACd,CAGA,6BAAe,CAAC,oBAAO,CACtB,SAAS,CAAE,QAAQ,CACnB,WAAW,CAAE,GACd"}`
};
const ContentBlock = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { block } = $$props;
  let { isStreaming: isStreaming2 = false } = $$props;
  let renderedContent = "";
  if ($$props.block === void 0 && $$bindings.block && block !== void 0) $$bindings.block(block);
  if ($$props.isStreaming === void 0 && $$bindings.isStreaming && isStreaming2 !== void 0) $$bindings.isStreaming(isStreaming2);
  $$result.css.add(css);
  {
    {
      if (block.type === "code") {
        renderedContent = block.content;
      } else if (block.type === "thinking") {
        renderedContent = block.content.replace(/\n/g, "<br>");
      } else {
        renderedContent = renderMarkdown(block.content);
      }
    }
  }
  return `${block.type === "thinking" ? ` <div class="thinking-block mb-4 border border-amber-200 dark:border-amber-800 rounded-lg overflow-hidden bg-amber-50 dark:bg-amber-900/10 svelte-in0eu3"><button class="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-colors"><div class="flex items-center space-x-2"><svg class="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364-.636l-.707.707M21 12h-1M17.657 18.364l-.707-.707M12 21v-1m-6.364.636l.707-.707M3 12h1M6.343 5.636l.707.707"></path></svg> <span class="text-sm font-medium text-amber-800 dark:text-amber-200" data-svelte-h="svelte-hinc9u">思考过程</span> <span class="text-xs text-amber-600 dark:text-amber-400">(${escape(block.content.length)} 字符)</span></div> <svg class="${"w-4 h-4 text-amber-600 dark:text-amber-400 transform transition-transform " + escape("", true)}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></button> ${``}</div>` : `${block.type === "code" ? ` <div class="code-block mb-4 rounded-lg overflow-hidden bg-gray-900 dark:bg-gray-800 border border-gray-700 svelte-in0eu3"><div class="flex items-center justify-between px-4 py-2 bg-gray-800 dark:bg-gray-700 border-b border-gray-700"><div class="flex items-center space-x-2"><svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg> <span class="text-sm font-medium text-gray-300">${escape(block.language || "Code")}</span></div> <button class="p-1 rounded hover:bg-gray-600 text-gray-400 hover:text-white transition-colors" title="Copy code" data-svelte-h="svelte-sa2l1t"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg></button></div> <pre class="p-4 text-sm text-gray-100 overflow-x-auto svelte-in0eu3"><code class="${"language-" + escape(block.language || "text", true) + " svelte-in0eu3"}">${escape(block.content)}</code></pre></div>` : `${block.type === "heading" ? ` <div class="heading-block mb-4">${block.level === 1 ? `<h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">${escape(block.content)}</h1>` : `${block.level === 2 ? `<h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">${escape(block.content)}</h2>` : `${block.level === 3 ? `<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">${escape(block.content)}</h3>` : `${block.level === 4 ? `<h4 class="text-base font-semibold text-gray-900 dark:text-white mb-2">${escape(block.content)}</h4>` : `${block.level === 5 ? `<h5 class="text-sm font-semibold text-gray-900 dark:text-white mb-2">${escape(block.content)}</h5>` : `<h6 class="text-xs font-semibold text-gray-900 dark:text-white mb-2">${escape(block.content)}</h6>`}`}`}`}`}</div>` : `${block.type === "list" ? ` <div class="list-block mb-4 pl-4 border-l-4 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10 rounded-r-lg p-3"><div class="prose prose-sm max-w-none text-gray-800 dark:text-gray-200"><!-- HTML_TAG_START -->${renderMarkdown(block.content)}<!-- HTML_TAG_END --></div></div>` : `${block.type === "quote" ? ` <div class="quote-block mb-4 pl-4 border-l-4 border-gray-400 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 rounded-r-lg p-3"><div class="prose prose-sm max-w-none text-gray-700 dark:text-gray-300 italic"><!-- HTML_TAG_START -->${renderMarkdown(block.content)}<!-- HTML_TAG_END --></div></div>` : `${block.type === "math" ? ` <div class="math-block mb-4 p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg"><div class="text-center"><!-- HTML_TAG_START -->${renderMarkdown(block.content)}<!-- HTML_TAG_END --></div></div>` : ` <div class="main-content mb-4"><div class="prose prose-gray dark:prose-invert max-w-none prose-sm"><!-- HTML_TAG_START -->${renderedContent}<!-- HTML_TAG_END --> ${isStreaming2 ? `<span class="inline-block w-2 h-5 bg-gray-400 dark:bg-gray-300 animate-pulse ml-1 rounded-full"></span>` : ``}</div></div>`}`}`}`}`}`}`;
});
const MessageItem = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let renderedContent;
  let isUser;
  let isAssistant;
  let parsedContent;
  let { message } = $$props;
  let { isStreaming: isStreaming2 = false } = $$props;
  if ($$props.message === void 0 && $$bindings.message && message !== void 0) $$bindings.message(message);
  if ($$props.isStreaming === void 0 && $$bindings.isStreaming && isStreaming2 !== void 0) $$bindings.isStreaming(isStreaming2);
  renderedContent = renderMarkdown(message.content);
  isUser = message.role === "user";
  isAssistant = message.role === "assistant";
  parsedContent = isAssistant ? parseContent(message.content) : null;
  parsedContent ? getContentSummary(parsedContent) : "";
  return `<div class="${"flex " + escape(isUser ? "justify-end" : "justify-start", true)}"><div class="${"max-w-3xl " + escape(isUser ? "order-2" : "", true)}"><div class="${"flex items-start space-x-3 " + escape(isUser ? "flex-row-reverse space-x-reverse" : "", true)}"> <div class="${"w-8 h-8 " + escape(isUser ? "bg-green-500" : "bg-blue-600", true) + " rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"}">${isUser ? `<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>` : `<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>`}</div>  <div class="flex-1 min-w-0"><div class="${"flex items-center space-x-2 mb-2 " + escape(isUser ? "justify-end" : "", true)}"><span class="text-sm font-medium text-gray-700 dark:text-gray-300">${escape(isUser ? "You" : "Assistant")}</span>  ${isAssistant && parsedContent ? `<div class="flex items-center space-x-1">${parsedContent.hasThinking ? `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300" data-svelte-h="svelte-tg3tpk"><svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364-.636l-.707.707M21 12h-1M17.657 18.364l-.707-.707M12 21v-1m-6.364.636l.707-.707M3 12h1M6.343 5.636l.707.707"></path></svg>
									思考</span>` : ``} ${parsedContent.hasCode ? `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300" data-svelte-h="svelte-9cdpt4"><svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
									代码</span>` : ``} ${parsedContent.blocks.some((b) => b.type === "list") ? `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300" data-svelte-h="svelte-18t4l3p"><svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
									列表</span>` : ``}</div>` : ``} <span class="text-xs text-gray-500 dark:text-gray-400">${escape(formatTime(message.timestamp))}</span></div> <div class="relative group">${isUser ? ` <div class="bg-blue-600 text-white rounded-2xl px-4 py-3 shadow-sm"><div class="whitespace-pre-wrap break-words">${escape(message.content)}</div></div>` : `${isAssistant && parsedContent ? ` <div class="${"bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-2xl px-4 py-3 " + escape(isStreaming2 ? "message-enter" : "", true) + " shadow-sm"}">${parsedContent.blocks.length > 0 ? ` ${each(parsedContent.blocks, (block, index) => {
    return `${validate_component(ContentBlock, "ContentBlock").$$render(
      $$result,
      {
        block,
        isStreaming: isStreaming2 && index === parsedContent.blocks.length - 1
      },
      {},
      {}
    )}`;
  })}` : ` <div class="prose prose-gray dark:prose-invert max-w-none prose-sm"><!-- HTML_TAG_START -->${renderedContent}<!-- HTML_TAG_END --> ${isStreaming2 ? `<span class="inline-block w-2 h-5 bg-gray-400 dark:bg-gray-300 animate-pulse ml-1 rounded-full"></span>` : ``}</div>`}</div>` : ` <div class="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-2xl px-4 py-3 shadow-sm"><div class="prose prose-gray dark:prose-invert max-w-none prose-sm"><!-- HTML_TAG_START -->${renderedContent}<!-- HTML_TAG_END --></div></div>`}`}  ${``}</div></div></div></div></div>`;
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
  let streamingMessageId = "";
  function addStreamingContent(content, messageId) {
    if (messageId && messageId !== streamingMessageId) {
      streamingMessage = "";
      streamingMessageId = messageId;
    }
    streamingMessage += content;
  }
  function finishStreaming(finalContent) {
    if (finalContent !== void 0) {
      streamingMessage = finalContent;
    }
    if (streamingMessage && chatId) {
      const newMessage = {
        id: streamingMessageId || Date.now().toString(),
        chat_id: chatId,
        role: "assistant",
        content: streamingMessage,
        timestamp: Math.floor(Date.now() / 1e3)
      };
      messages.update((msgs) => [...msgs, newMessage]);
    }
    streamingMessage = "";
    streamingMessageId = "";
  }
  function clearStreaming() {
    streamingMessage = "";
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
  })} ${streamingMessage ? `${validate_component(MessageItem, "MessageItem").$$render(
    $$result,
    {
      message: {
        id: streamingMessageId,
        chat_id: chatId || "",
        role: "assistant",
        content: streamingMessage,
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
  return `<div class="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"><div class="max-w-4xl mx-auto"><div class="flex items-end space-x-3"><div class="flex-1 relative"><textarea${add_attribute("placeholder", placeholder, 0)} ${disabled ? "disabled" : ""} rows="1" class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors" style="min-height: 48px; max-height: 200px;"${add_attribute("this", textArea, 0)}>${escape("")}</textarea></div> ${$isStreaming ? `<button class="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors flex items-center space-x-2 font-medium shadow-sm" data-svelte-h="svelte-1dy7w5k"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2"></rect></svg> <span>Stop</span></button>` : `<button ${!message.trim() || $isLoading || disabled ? "disabled" : ""} class="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center space-x-2 font-medium shadow-sm">${$isLoading ? `<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> <span data-svelte-h="svelte-1oib7d2">Sending...</span>` : `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg> <span data-svelte-h="svelte-14i38x8">Send</span>`}</button>`}</div> ${!$modelStatus.connected ? `<div class="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg" data-svelte-h="svelte-dl40tv"><div class="flex items-center space-x-2"><svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> <span class="text-sm text-red-700 dark:text-red-300 font-medium">No model connected</span></div> <p class="text-xs text-red-600 dark:text-red-400 mt-1">Please configure a VLLM model to start chatting. Click the model button in the header to set up your connection.</p></div>` : `<div class="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center" data-svelte-h="svelte-1cidstp">Press Enter to send, Shift+Enter for new line</div>`}</div></div>`;
});
const ModelSettings = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $settings, $$unsubscribe_settings;
  let $modelStatus, $$unsubscribe_modelStatus;
  $$unsubscribe_settings = subscribe(settings, (value) => $settings = value);
  $$unsubscribe_modelStatus = subscribe(modelStatus, (value) => $modelStatus = value);
  let { isOpen = false } = $$props;
  let { onClose } = $$props;
  let models = [];
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0) $$bindings.isOpen(isOpen);
  if ($$props.onClose === void 0 && $$bindings.onClose && onClose !== void 0) $$bindings.onClose(onClose);
  $$unsubscribe_settings();
  $$unsubscribe_modelStatus();
  return `${isOpen ? `<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div class="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto"><div class="flex items-center justify-between mb-6"><h2 class="text-xl font-bold text-white" data-svelte-h="svelte-14f711m">Model Configuration</h2> <button class="text-gray-400 hover:text-white" data-svelte-h="svelte-13m9s7r"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div> <div class="space-y-6"> <div class="flex items-center justify-between"><h3 class="text-lg font-semibold text-white" data-svelte-h="svelte-1lcpkaq">Connection Status</h3> <div class="flex items-center space-x-2"><div class="${"w-3 h-3 rounded-full " + escape($modelStatus.connected ? "bg-green-500" : "bg-red-500", true)}"></div> <span class="text-sm text-gray-400">${escape($modelStatus.connected ? "Connected" : "Disconnected")}</span></div></div>  <div class="space-y-2"><label for="vllm-url" class="block text-sm font-medium text-gray-300" data-svelte-h="svelte-3xht4u">VLLM API URL</label> <input id="vllm-url" type="url" placeholder="http://localhost:8000/v1" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"${add_attribute("value", $settings.vllmApiUrl, 0)}> <p class="text-xs text-gray-500" data-svelte-h="svelte-1l04ufe">Enter the VLLM API endpoint URL (e.g., http://localhost:8000/v1)</p></div>  <div class="space-y-2"><label for="api-key" class="block text-sm font-medium text-gray-300" data-svelte-h="svelte-qdv98d">API Key (Optional)</label> <input id="api-key" type="password" placeholder="Enter API key if required" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"${add_attribute("value", $settings.vllmApiKey, 0)}></div>  <div class="flex space-x-3"><button ${!$settings.vllmApiUrl.trim() ? "disabled" : ""} class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2">${`<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> <span data-svelte-h="svelte-l5wddi">Test Connection</span>`}</button> <button class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors" data-svelte-h="svelte-c6dky0">Reset</button></div>  ${$modelStatus.error ? `<div class="p-3 bg-red-900/50 border border-red-700 rounded-lg"><div class="flex items-center space-x-2" data-svelte-h="svelte-1iw8ipj"><svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> <span class="text-red-400 text-sm">Connection Error</span></div> <p class="text-red-300 text-sm mt-1">${escape($modelStatus.error)}</p></div>` : ``}  ${$modelStatus.connected && models.length > 0 ? `<div class="space-y-2"><label for="model-select" class="block text-sm font-medium text-gray-300" data-svelte-h="svelte-1jkr3he">Select Model</label> <select id="model-select" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500">${each(models, (model) => {
    return `<option${add_attribute("value", model.id, 0)}>${escape(model.id)}</option>`;
  })}</select> <p class="text-xs text-gray-500">${escape(models.length)} model(s) available</p></div>` : ``}  <div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div class="space-y-2"><label for="temperature" class="block text-sm font-medium text-gray-300">Temperature: ${escape($settings.temperature)}</label> <input id="temperature" type="range" min="0" max="2" step="0.1" class="w-full"${add_attribute("value", $settings.temperature, 0)}></div> <div class="space-y-2"><label for="max-tokens" class="block text-sm font-medium text-gray-300" data-svelte-h="svelte-19kjneg">Max Tokens</label> <input id="max-tokens" type="number" min="1" max="8192" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"${add_attribute("value", $settings.maxTokens, 0)}></div></div>  <div class="space-y-2"><label for="system-prompt" class="block text-sm font-medium text-gray-300" data-svelte-h="svelte-vhfphu">System Prompt</label> <textarea id="system-prompt" placeholder="Enter system prompt (optional)" rows="3" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none">${escape($settings.systemPrompt || "")}</textarea></div>  <div class="flex justify-end space-x-3 pt-4 border-t border-gray-700"><button class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors" data-svelte-h="svelte-1q6juk2">Cancel</button> <button class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors" data-svelte-h="svelte-fcvg55">Save Settings</button></div></div></div></div>` : ``}`;
});
const ChatInterface = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $settings, $$unsubscribe_settings;
  let $currentChatId, $$unsubscribe_currentChatId;
  let $$unsubscribe_messages;
  let $modelStatus, $$unsubscribe_modelStatus;
  let $sidebarOpen, $$unsubscribe_sidebarOpen;
  let $mobile, $$unsubscribe_mobile;
  let $currentChat, $$unsubscribe_currentChat;
  let $isLoading, $$unsubscribe_isLoading;
  $$unsubscribe_settings = subscribe(settings, (value) => $settings = value);
  $$unsubscribe_currentChatId = subscribe(currentChatId, (value) => $currentChatId = value);
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
      messages.set(response.data.messages || []);
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
    )}</div>  ${$mobile && $sidebarOpen ? `<div class="fixed inset-0 bg-black bg-opacity-50 z-40"></div>` : ``}  <div class="flex-1 flex flex-col min-w-0"> <div class="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"><div class="flex items-center justify-between"><div class="flex items-center space-x-3">${$mobile ? `<button class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300" data-svelte-h="svelte-xs7rjj"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg></button>` : ``} <div class="flex items-center space-x-3"><h1 class="text-lg font-semibold text-gray-900 dark:text-white">${escape($currentChat?.title || "VLLM Chat")}</h1>  <div class="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg"><div class="${"w-2 h-2 rounded-full " + escape($modelStatus.connected ? "bg-green-500" : "bg-red-500", true)}"></div> <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg> <span class="text-sm font-medium text-gray-700 dark:text-gray-300">${escape($modelStatus.connected ? $settings.model : "No Model")}</span></div></div></div> <div class="flex items-center space-x-2"><button class="${"p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 " + escape(
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
  $$unsubscribe_settings();
  $$unsubscribe_currentChatId();
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
