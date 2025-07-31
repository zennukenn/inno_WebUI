export interface Message {
	id: string;
	chat_id: string;
	parent_id?: string;
	role: 'user' | 'assistant';
	content: string;
	model?: string;
	timestamp: number;
	metadata?: Record<string, any>;
	created_at?: string;
	updated_at?: string;
}

export interface Chat {
	id: string;
	title: string;
	user_id: string;
	model?: string;
	system_prompt?: string;
	temperature?: number;
	max_tokens?: number;
	messages: Message[];
	created_at?: string;
	updated_at?: string;
	archived: boolean;
}

export interface ChatCreate {
	title?: string;
	model?: string;
	system_prompt?: string;
	temperature?: number;
	max_tokens?: number;
}

export interface ChatUpdate {
	title?: string;
	model?: string;
	system_prompt?: string;
	temperature?: number;
	max_tokens?: number;
	messages?: Message[];
	archived?: boolean;
}

export interface MessageCreate {
	role: 'user' | 'assistant';
	content: string;
	parent_id?: string;
	timestamp?: number;
}

export interface ChatCompletionRequest {
	model: string;
	messages: Array<{
		role: string;
		content: string;
	}>;
	temperature?: number;
	max_tokens?: number;
	stream?: boolean;
	chat_id?: string;
	message_id?: string;
	vllm_url?: string;
	vllm_api_key?: string;
}

export interface Settings {
	model: string;
	temperature: number;
	maxTokens: number;
	systemPrompt: string;
	theme: 'light' | 'dark';
	vllmApiUrl: string;
	vllmApiKey?: string;
}

export interface ModelInfo {
	id: string;
	object: string;
	created: number;
	owned_by: string;
}

export interface ModelStatus {
	connected: boolean;
	error?: string;
	models: ModelInfo[];
	// 新增状态字段，支持红黄绿三种状态
	status: 'healthy' | 'partial' | 'error' | 'unknown';
	// 详细状态信息
	details?: {
		modelSelected: boolean;
		configurationValid: boolean;
		lastChecked?: Date;
	};
}

export interface ModelInfo {
	id: string;
	object: string;
	created: number;
	owned_by: string;
	permission?: any[];
	root?: string;
	parent?: string;
}

export interface ModelConfig {
	model_name: string;
	api_base: string;
	api_key?: string;
	max_tokens: number;
	temperature: number;
	top_p: number;
	frequency_penalty: number;
	presence_penalty: number;
}

export interface ModelListResponse {
	object: string;
	data: ModelInfo[];
}

export interface ApiResponse<T = any> {
	success: boolean;
	data?: T;
	error?: string;
}
