import { browser } from '$app/environment';
import { settings, modelStatus } from '$lib/stores';
import { api } from '$lib/api';
import type { Settings, ModelStatus } from '$lib/types';

/**
 * Initialize application settings
 * This should be called early in the application lifecycle
 */
export async function initializeSettings(): Promise<void> {
	if (!browser) return;

	console.log('🔧 [DEBUG] Initializing application settings...');

	// Settings are already loaded by the store constructor
	// But we can perform additional initialization here if needed
	
	// Get current settings
	let currentSettings: Settings;
	const unsubscribe = settings.subscribe(s => currentSettings = s);
	unsubscribe();

	console.log('📋 [DEBUG] Current settings:', currentSettings!);

	// If we have VLLM URL but no model, try to auto-configure
	if (currentSettings!.vllmApiUrl && !currentSettings!.model) {
		console.log('🔍 [DEBUG] Attempting to auto-configure model...');
		await autoConfigureModel();
	} else {
		// Calculate initial status based on current settings
		const status = calculateModelStatus(currentSettings!);
		modelStatus.set(status);
	}
}

/**
 * Auto-configure model by testing connection and selecting first available model
 */
export async function autoConfigureModel(): Promise<boolean> {
	if (!browser) return false;

	let currentSettings: Settings;
	const unsubscribe = settings.subscribe(s => currentSettings = s);
	unsubscribe();

	if (!currentSettings!.vllmApiUrl) {
		console.warn('⚠️ [DEBUG] No VLLM URL configured');
		return false;
	}

	try {
		console.log('🔗 [DEBUG] Testing VLLM connection...');
		const response = await api.testVllmConnection(currentSettings!.vllmApiUrl, currentSettings!.vllmApiKey);
		
		if (response.success && response.data && response.data.models) {
			const models = response.data.models;
			console.log('📋 [DEBUG] Available models:', models);
			
			if (models.length > 0) {
				// Auto-select first model
				const selectedModel = models[0].id;
				settings.update(s => ({ ...s, model: selectedModel }));

				// Calculate and update model status
				const updatedSettings = { ...currentSettings!, model: selectedModel };
				const status = calculateModelStatus(updatedSettings, response);
				modelStatus.set(status);

				console.log('✅ [DEBUG] Auto-configured model:', selectedModel);
				return true;
			}
		}
		
		console.warn('⚠️ [DEBUG] No models available from VLLM');
		return false;
	} catch (error) {
		console.error('❌ [DEBUG] Failed to auto-configure model:', error);
		const status = calculateModelStatus(currentSettings!, { success: false, error: error.message });
		modelStatus.set(status);
		return false;
	}
}

/**
 * Validate current settings and return any issues
 */
export function validateSettings(): string[] {
	const issues: string[] = [];
	
	let currentSettings: Settings;
	const unsubscribe = settings.subscribe(s => currentSettings = s);
	unsubscribe();

	if (!currentSettings!.vllmApiUrl) {
		issues.push('VLLM API URL is not configured');
	}

	if (!currentSettings!.model) {
		issues.push('No model is selected');
	}

	if (currentSettings!.temperature < 0 || currentSettings!.temperature > 2) {
		issues.push('Temperature should be between 0 and 2');
	}

	if (currentSettings!.maxTokens < 1 || currentSettings!.maxTokens > 8192) {
		issues.push('Max tokens should be between 1 and 8192');
	}

	return issues;
}

/**
 * Reset settings to default values
 */
export function resetSettings(): void {
	const defaultSettings: Settings = {
		model: '',
		temperature: 0.7,
		maxTokens: 2048,
		systemPrompt: '',
		theme: 'dark',
		vllmApiUrl: 'http://localhost:8000/v1',
		vllmApiKey: ''
	};

	settings.set(defaultSettings);
	
	// Calculate and set status for default settings
	const status = calculateModelStatus(defaultSettings);
	modelStatus.set(status);

	console.log('🔄 [DEBUG] Settings reset to defaults');
}

/**
 * Calculate model status based on current settings and connection state
 */
export function calculateModelStatus(currentSettings: Settings, connectionTest?: any): ModelStatus {
	const now = new Date();

	// Check if basic configuration is present
	const hasVllmUrl = !!currentSettings.vllmApiUrl;
	const hasModel = !!currentSettings.model;

	// Determine connection status
	let connected = false;
	let error: string | undefined;
	let models: any[] = [];

	if (connectionTest) {
		if (connectionTest.success && connectionTest.data) {
			connected = true;
			models = connectionTest.data.models || [];
		} else {
			connected = false;
			error = connectionTest.error || 'Connection failed';
		}
	} else if (!hasVllmUrl) {
		error = 'VLLM URL not configured';
	}

	// Calculate overall status
	let status: 'healthy' | 'partial' | 'error' | 'unknown' = 'unknown';

	if (!hasVllmUrl) {
		status = 'error';
		error = error || 'VLLM URL not configured';
	} else if (!hasModel) {
		status = 'partial';
		error = error || 'No model selected';
	} else if (connected && hasModel) {
		status = 'healthy';
		error = undefined;
	} else if (!connected && hasVllmUrl) {
		status = 'error';
	} else {
		status = 'partial';
	}

	return {
		connected,
		error,
		models,
		status,
		details: {
			modelSelected: hasModel,
			configurationValid: hasVllmUrl && hasModel,
			lastChecked: now
		}
	};
}

/**
 * Get status configuration for UI display
 */
export function getModelStatusConfig(status: 'healthy' | 'partial' | 'error' | 'unknown') {
	const statusConfig = {
		healthy: {
			color: 'text-green-600 dark:text-green-400',
			bgColor: 'bg-green-500',
			icon: '●',
			label: 'Connected',
			title: 'Model is connected and ready'
		},
		partial: {
			color: 'text-yellow-600 dark:text-yellow-400',
			bgColor: 'bg-yellow-500',
			icon: '●',
			label: 'Partial',
			title: 'Configuration incomplete or connection issues'
		},
		error: {
			color: 'text-red-600 dark:text-red-400',
			bgColor: 'bg-red-500',
			icon: '●',
			label: 'Error',
			title: 'Configuration error or connection failed'
		},
		unknown: {
			color: 'text-gray-600 dark:text-gray-400',
			bgColor: 'bg-gray-500',
			icon: '●',
			label: 'Unknown',
			title: 'Status unknown'
		}
	};

	return statusConfig[status] || statusConfig.unknown;
}
