import { writable } from 'svelte/store';
import { browser } from '$app/environment';
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

// Create settings store with localStorage persistence
function createSettingsStore() {
	const defaultSettings: Settings = {
		model: '', // Will be auto-selected from available models
		temperature: 0.7,
		maxTokens: 2048,
		systemPrompt: '',
		theme: 'dark',
		vllmApiUrl: 'http://localhost:8000/v1',
		vllmApiKey: ''
	};

	// Load initial settings from localStorage if available
	let initialSettings = defaultSettings;
	if (browser) {
		try {
			const savedSettings = localStorage.getItem('inno-webui-settings');
			if (savedSettings) {
				const parsed = JSON.parse(savedSettings);
				initialSettings = { ...defaultSettings, ...parsed };
			}
		} catch (error) {
			console.error('Failed to load saved settings:', error);
		}
	}

	const { subscribe, set, update } = writable<Settings>(initialSettings);

	return {
		subscribe,
		set: (value: Settings) => {
			if (browser) {
				localStorage.setItem('inno-webui-settings', JSON.stringify(value));
			}
			set(value);
		},
		update: (updater: (value: Settings) => Settings) => {
			update((currentSettings) => {
				const newSettings = updater(currentSettings);
				if (browser) {
					localStorage.setItem('inno-webui-settings', JSON.stringify(newSettings));
				}
				return newSettings;
			});
		},
		// Method to manually save current settings to localStorage
		save: () => {
			if (browser) {
				update((currentSettings) => {
					localStorage.setItem('inno-webui-settings', JSON.stringify(currentSettings));
					return currentSettings;
				});
			}
		}
	};
}

// Settings store with persistence
export const settings = createSettingsStore();

// Model status store
export const modelStatus = writable<ModelStatus>({
	connected: false,
	error: undefined,
	models: [],
	status: 'unknown',
	details: {
		vllmConnection: 'unknown',
		modelSelected: false,
		configurationValid: false,
		lastChecked: undefined
	}
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
