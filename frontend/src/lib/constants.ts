// API Configuration
// In production (Docker), use relative paths for same-origin requests
// This allows the frontend to work from any IP address
function getApiBaseUrl(): string {
  // If explicitly set via environment variable, use it
  if ((import.meta as any).env?.VITE_API_BASE_URL) {
    return (import.meta as any).env.VITE_API_BASE_URL;
  }

  // In production, use relative paths (works for same-origin requests)
  if ((import.meta as any).env?.NODE_ENV === 'production') {
    return '';
  }

  // In development, use localhost
  return 'http://localhost:8080';
}

function getWsBaseUrl(): string {
  // If explicitly set via environment variable, use it
  if ((import.meta as any).env?.VITE_WS_BASE_URL) {
    return (import.meta as any).env.VITE_WS_BASE_URL;
  }

  // In production, construct WebSocket URL based on current location
  if ((import.meta as any).env?.NODE_ENV === 'production' && typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}`;
  }

  // In development, use localhost
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

// Default settings
export const DEFAULT_SETTINGS = {
	model: '', // Will be auto-selected from available models
	temperature: 0.7,
	maxTokens: 2048,
	systemPrompt: '',
	theme: 'dark',
	vllmApiUrl: 'http://localhost:8000/v1',
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
