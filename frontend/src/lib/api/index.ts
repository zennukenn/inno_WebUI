import { API_BASE_URL, ENDPOINTS } from '$lib/constants';
import type {
	Chat,
	ChatCreate,
	ChatUpdate,
	Message,
	MessageCreate,
	ChatCompletionRequest,
	ModelInfo,
	ModelConfig,
	ModelListResponse,
	ApiResponse
} from '$lib/types';

class ApiClient {
	private baseUrl: string;

	constructor(baseUrl: string = API_BASE_URL) {
		this.baseUrl = baseUrl;
	}

	updateBaseUrl(newBaseUrl: string) {
		this.baseUrl = newBaseUrl;
	}

	private async request<T>(
		endpoint: string,
		options: RequestInit = {}
	): Promise<ApiResponse<T>> {
		const url = `${this.baseUrl}${endpoint}`;
		console.log('API Request:', { url, options });

		try {
			const response = await fetch(url, {
				headers: {
					'Content-Type': 'application/json',
					...options.headers
				},
				...options
			});

			console.log('API Response status:', response.status);

			if (!response.ok) {
				const error = await response.text();
				console.error('API Error response:', error);
				throw new Error(`HTTP ${response.status}: ${error}`);
			}

			const data = await response.json();
			console.log('API Response data:', data);
			return { success: true, data };
		} catch (error) {
			console.error('API request failed:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error'
			};
		}
	}

	// Chat methods
	async createChat(chatData: ChatCreate): Promise<ApiResponse<Chat>> {
		return this.request<Chat>(ENDPOINTS.CHATS, {
			method: 'POST',
			body: JSON.stringify(chatData)
		});
	}

	async getChats(limit = 50, offset = 0): Promise<ApiResponse<Chat[]>> {
		return this.request<Chat[]>(`${ENDPOINTS.CHATS}?limit=${limit}&offset=${offset}`);
	}

	async getChat(chatId: string): Promise<ApiResponse<Chat>> {
		return this.request<Chat>(`${ENDPOINTS.CHATS}/${chatId}`);
	}

	async updateChat(chatId: string, chatData: ChatUpdate): Promise<ApiResponse<Chat>> {
		return this.request<Chat>(`${ENDPOINTS.CHATS}/${chatId}`, {
			method: 'PUT',
			body: JSON.stringify(chatData)
		});
	}

	async deleteChat(chatId: string): Promise<ApiResponse<void>> {
		return this.request<void>(`${ENDPOINTS.CHATS}/${chatId}`, {
			method: 'DELETE'
		});
	}

	async addMessage(chatId: string, messageData: MessageCreate): Promise<ApiResponse<Message>> {
		return this.request<Message>(`${ENDPOINTS.CHATS}/${chatId}/messages`, {
			method: 'POST',
			body: JSON.stringify(messageData)
		});
	}

	async getMessages(chatId: string): Promise<ApiResponse<Message[]>> {
		return this.request<Message[]>(`${ENDPOINTS.CHATS}/${chatId}/messages`);
	}

	async searchChats(query: string, limit = 20): Promise<ApiResponse<Chat[]>> {
		return this.request<Chat[]>(`${ENDPOINTS.CHATS}/search?q=${encodeURIComponent(query)}&limit=${limit}`);
	}

	// Chat completion methods
	async chatCompletion(request: ChatCompletionRequest): Promise<ApiResponse<any>> {
		return this.request<any>(ENDPOINTS.CHAT_COMPLETION, {
			method: 'POST',
			body: JSON.stringify(request)
		});
	}

	async chatCompletionStream(request: ChatCompletionRequest): Promise<ReadableStream<Uint8Array> | null> {
		try {
			const response = await fetch(`${this.baseUrl}${ENDPOINTS.CHAT_COMPLETION}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ ...request, stream: true })
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			return response.body;
		} catch (error) {
			console.error('Stream request failed:', error);
			return null;
		}
	}

	async getModels(): Promise<ApiResponse<ModelListResponse>> {
		return this.request<ModelListResponse>('/api/models');
	}

	async addModel(config: ModelConfig): Promise<ApiResponse<any>> {
		return this.request<any>('/api/models/add', {
			method: 'POST',
			body: JSON.stringify(config)
		});
	}

	async removeModel(modelId: string): Promise<ApiResponse<any>> {
		return this.request<any>(`/api/models/${modelId}`, {
			method: 'DELETE'
		});
	}

	async getModelConfig(modelId: string): Promise<ApiResponse<ModelConfig>> {
		return this.request<ModelConfig>(`/api/models/${modelId}/config`);
	}

	async testModel(modelId: string): Promise<ApiResponse<any>> {
		return this.request<any>(`/api/models/${modelId}/test`, {
			method: 'POST'
		});
	}

	async healthCheck(): Promise<ApiResponse<any>> {
		return this.request<any>('/api/chat/health');
	}

	async getConnectionStatus(): Promise<ApiResponse<any>> {
		return this.request<any>('/api/chat/status');
	}

	// Test VLLM connection
	async testVllmConnection(vllmUrl: string, apiKey?: string): Promise<ApiResponse<any>> {
		try {
			// First try direct connection to VLLM
			const headers: Record<string, string> = {
				'Content-Type': 'application/json'
			};

			if (apiKey) {
				headers['Authorization'] = `Bearer ${apiKey}`;
			}

			const response = await fetch(`${vllmUrl}/models`, {
				method: 'GET',
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
			console.error('Direct VLLM connection test failed:', error);

			// Fallback: try through backend
			try {
				const response = await this.request<any>('/api/chat/test-connection', {
					method: 'POST',
					body: JSON.stringify({
						vllm_url: vllmUrl,
						api_key: apiKey
					})
				});

				if (response.success) {
					return response;
				} else {
					throw new Error(response.error || 'Backend connection test failed');
				}
			} catch (backendError) {
				console.error('Backend VLLM connection test failed:', backendError);
				return {
					success: false,
					error: error instanceof Error ? error.message : 'Connection failed'
				};
			}
		}
	}
}

export const api = new ApiClient();
