// API Configuration
// In production (Docker), use relative paths; in development, use full URL
export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ||
  ((import.meta as any).env?.NODE_ENV === 'production' ? '' : 'http://localhost:8080');
export const WS_BASE_URL = (import.meta as any).env?.VITE_WS_BASE_URL || 'ws://localhost:8080';

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
