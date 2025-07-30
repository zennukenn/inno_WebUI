// API Configuration
// Smart API URL detection for cross-machine compatibility
function getApiBaseUrl(): string {
  // If explicitly set via environment variable, use it
  if ((import.meta as any).env?.VITE_API_BASE_URL) {
    return (import.meta as any).env.VITE_API_BASE_URL;
  }

  // If running in browser, always construct API URL based on current location
  // This ensures cross-machine compatibility regardless of build environment
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;

    // If accessing via port 8070, API is on port 8080
    if (port === '8070') {
      return `${protocol}//${hostname}:8080`;
    }

    // If accessing via standard ports (80/443), assume API is on 8080
    if (port === '' || port === '80' || port === '443') {
      return `${protocol}//${hostname}:8080`;
    }

    // For other ports, try to use relative paths
    return '';
  }

  // Fallback for server-side rendering (should rarely be used)
  return 'http://localhost:8080';
}

function getWsBaseUrl(): string {
  // If explicitly set via environment variable, use it
  if ((import.meta as any).env?.VITE_WS_BASE_URL) {
    return (import.meta as any).env.VITE_WS_BASE_URL;
  }

  // If running in browser, always construct WebSocket URL based on current location
  // This ensures cross-machine compatibility regardless of build environment
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const hostname = window.location.hostname;
    const port = window.location.port;

    // If accessing via port 8070, WebSocket is on port 8080
    if (port === '8070') {
      return `${protocol}//${hostname}:8080`;
    }

    // If accessing via standard ports (80/443), assume WebSocket is on 8080
    if (port === '' || port === '80' || port === '443') {
      return `${protocol}//${hostname}:8080`;
    }

    // For other ports, use same host
    return `${protocol}//${window.location.host}`;
  }

  // Fallback for server-side rendering (should rarely be used)
  return 'ws://localhost:8080';
}

export const API_BASE_URL = getApiBaseUrl();
export const WS_BASE_URL = getWsBaseUrl();

// API Endpoints
export const ENDPOINTS = {
	CHATS: '/api/chats',
	CHAT_COMPLETION: '/api/chat/completion',
	MODELS: '/api/models'
};

// Default settings with dynamic VLLM URL
function getDefaultVllmUrl(): string {
  // If running in browser, construct URL based on current location
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}:8000/v1`;
  }

  // Fallback for server-side rendering
  return 'http://localhost:8000/v1';
}

export const DEFAULT_SETTINGS = {
	model: '', // Will be auto-selected from available models
	temperature: 0.7,
	maxTokens: 2048,
	systemPrompt: '',
	theme: 'dark',
	vllmApiUrl: getDefaultVllmUrl(),
	vllmApiKey: ''
};

// Message roles
export const MESSAGE_ROLES = {
	USER: 'user',
	ASSISTANT: 'assistant',
	SYSTEM: 'system'
} as const;

// Chat limits
export const CHAT_LIMITS = {
	MAX_TITLE_LENGTH: 100,
	MAX_MESSAGE_LENGTH: 10000,
	MAX_MESSAGES_PER_CHAT: 1000
};

// UI Constants
export const UI = {
	SIDEBAR_WIDTH: 280,
	MESSAGE_PADDING: 16,
	MOBILE_BREAKPOINT: 768
};
