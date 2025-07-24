import { writable } from 'svelte/store';
import type { Chat, Message, Settings, ModelStatus } from '$lib/types';

// Chat stores
export const chats = writable<Chat[]>([]);
export const currentChat = writable<Chat | null>(null);
export const currentChatId = writable<string | null>(null);

// Message stores
export const messages = writable<Message[]>([]);
export const isLoading = writable<boolean>(false);
export const isStreaming = writable<boolean>(false);

// UI stores
export const sidebarOpen = writable<boolean>(true);
export const mobile = writable<boolean>(false);

// Settings store
export const settings = writable<Settings>({
	model: 'default',
	temperature: 0.7,
	maxTokens: 2048,
	systemPrompt: '',
	theme: 'dark',
	vllmApiUrl: 'http://localhost:8000/v1',
	vllmApiKey: ''
});

// Model status store
export const modelStatus = writable<ModelStatus>({
	connected: false,
	error: undefined,
	models: []
});

// Theme store
export const theme = writable<'light' | 'dark'>('light');

// WebSocket store
export const socket = writable<any>(null);

// User store
export const user = writable<any>({
	id: 'default_user',
	name: 'User'
});
