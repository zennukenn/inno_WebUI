<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import {
		chats,
		currentChat,
		currentChatId,
		messages,
		isLoading,
		isStreaming,
		settings,
		sidebarOpen,
		mobile,
		modelStatus
	} from '$lib/stores';
	import { theme } from '$lib/utils/theme';
	import { api } from '$lib/api';
	import { generateId } from '$lib/utils';
	import { toast } from 'svelte-sonner';
	import type { Chat, Message, MessageCreate, ChatCompletionRequest } from '$lib/types';

	import ChatSidebar from './ChatSidebar.svelte';
	import MessageList from './MessageList.svelte';
	import MessageInput from './MessageInput.svelte';
	import ModelSettings from '../Settings/ModelSettings.svelte';

	let messageListComponent: MessageList;
	let streamController: AbortController | null = null;
	let showModelSettings = false;

	async function createNewChat() {
		console.log('Creating new chat with settings:', $settings);

		try {
			const response = await api.createChat({
				title: 'New Chat',
				model: $settings.model,
				temperature: $settings.temperature,
				max_tokens: $settings.maxTokens,
				system_prompt: $settings.systemPrompt
			});

			console.log('Create chat response:', response);

			if (response.success && response.data) {
				const newChat = response.data;
				chats.update(chats => [newChat, ...chats]);
				await selectChat(newChat.id);
				console.log('New chat created successfully:', newChat.id);
			} else {
				console.error('Failed to create chat:', response.error);
				toast.error('Failed to create new chat: ' + (response.error || 'Unknown error'));
			}
		} catch (error) {
			console.error('Error creating chat:', error);
			toast.error('Error creating chat: ' + error);
		}
	}

	async function selectChat(chatId: string) {
		currentChatId.set(chatId);
		
		const response = await api.getChat(chatId);
		if (response.success && response.data) {
			currentChat.set(response.data);
			messages.set(response.data.messages || []);
		} else {
			toast.error('Failed to load chat');
		}
	}

	async function sendMessage(event: CustomEvent<{ content: string }>) {
		const content = event.detail.content;

		console.log('Sending message:', content);

		// Check if model is connected
		if (!$modelStatus.connected) {
			toast.error('No model connected. Please configure a model first.');
			showModelSettings = true;
			return;
		}

		if (!$currentChatId) {
			console.log('No current chat, creating new chat...');
			await createNewChat();
		}

		if (!$currentChatId) {
			console.error('Failed to create or get chat ID');
			toast.error('Failed to create chat');
			return;
		}

		console.log('Using chat ID:', $currentChatId);

		// Add user message
		const userMessage: Message = {
			id: generateId(),
			chat_id: $currentChatId,
			role: 'user',
			content,
			timestamp: Math.floor(Date.now() / 1000)
		};

		messages.update(msgs => [...msgs, userMessage]);
		isLoading.set(true);

		try {
			// Save user message to backend
			await api.addMessage($currentChatId, {
				role: 'user',
				content,
				timestamp: userMessage.timestamp
			});

			// Prepare chat completion request
			const chatMessages = $messages.map(msg => ({
				role: msg.role,
				content: msg.content
			}));

			const completionRequest: ChatCompletionRequest = {
				model: $settings.model,
				messages: chatMessages,
				temperature: $settings.temperature,
				max_tokens: $settings.maxTokens,
				stream: true,
				chat_id: $currentChatId,
				vllm_url: $settings.vllmApiUrl,
				vllm_api_key: $settings.vllmApiKey
			};

			isLoading.set(false);
			isStreaming.set(true);

			// Start streaming
			streamController = new AbortController();
			const stream = await api.chatCompletionStream(completionRequest);
			
			if (!stream) {
				throw new Error('Failed to start streaming');
			}

			const reader = stream.getReader();
			const decoder = new TextDecoder();

			try {
				while (true) {
					const { done, value } = await reader.read();
					if (done) break;

					const chunk = decoder.decode(value);
					const lines = chunk.split('\n');

					for (const line of lines) {
						if (line.startsWith('data: ')) {
							const data = line.slice(6);
							if (data === '[DONE]') {
								messageListComponent?.finishStreaming();
								break;
							}

							try {
								const parsed = JSON.parse(data);
								if (parsed.choices && parsed.choices[0]?.delta?.content) {
									messageListComponent?.addStreamingContent(
										parsed.choices[0].delta.content,
										parsed.message_id
									);
								}
							} catch (e) {
								// Ignore JSON parse errors
							}
						}
					}
				}
			} finally {
				reader.releaseLock();
			}

		} catch (error) {
			console.error('Error sending message:', error);
			toast.error('Failed to send message');
			messageListComponent?.clearStreaming();
		} finally {
			isLoading.set(false);
			isStreaming.set(false);
			streamController = null;
		}
	}

	function stopGeneration() {
		if (streamController) {
			streamController.abort();
			streamController = null;
		}
		isStreaming.set(false);
		messageListComponent?.finishStreaming();
	}

	function handleResize() {
		mobile.set(window.innerWidth < 768);
	}

	function openModelSettings() {
		showModelSettings = true;
	}

	async function checkModelConnection() {
		// Load saved settings
		const savedSettings = localStorage.getItem('vllm-chat-settings');
		if (savedSettings) {
			try {
				const parsed = JSON.parse(savedSettings);
				settings.update(s => ({ ...s, ...parsed }));

				// Test connection if URL is available
				if (parsed.vllmApiUrl) {
					const response = await api.testVllmConnection(parsed.vllmApiUrl, parsed.vllmApiKey);
					if (response.success && response.data) {
						modelStatus.set({
							connected: true,
							error: undefined,
							models: response.data.models || []
						});
					} else {
						modelStatus.set({
							connected: false,
							error: response.error || 'Connection failed',
							models: []
						});
					}
				}
			} catch (error) {
				console.error('Failed to load saved settings:', error);
			}
		}
	}

	onMount(() => {
		handleResize();
		window.addEventListener('resize', handleResize);
		checkModelConnection();

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	});

	onDestroy(() => {
		if (streamController) {
			streamController.abort();
		}
	});
</script>

<div class="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
	<!-- Sidebar -->
	<div class="
		{$sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
		{$mobile ? 'fixed inset-y-0 left-0 z-50 w-80' : 'relative w-80'} 
		transition-transform duration-300 ease-in-out
	">
		<ChatSidebar 
			onNewChat={createNewChat}
			onSelectChat={selectChat}
		/>
	</div>

	<!-- Mobile overlay -->
	{#if $mobile && $sidebarOpen}
		<div 
			class="fixed inset-0 bg-black bg-opacity-50 z-40"
			on:click={() => sidebarOpen.set(false)}
		></div>
	{/if}

	<!-- Main content -->
	<div class="flex-1 flex flex-col min-w-0">
		<!-- Header -->
		<div class="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
			<div class="flex items-center justify-between">
				<div class="flex items-center space-x-3">
					{#if $mobile}
						<button
							on:click={() => sidebarOpen.set(true)}
							class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
						>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
							</svg>
						</button>
					{/if}
					<div class="flex items-center space-x-3">
						<h1 class="text-lg font-semibold text-gray-900 dark:text-white">
							{$currentChat?.title || 'VLLM Chat'}
						</h1>
						<!-- Model status and selector -->
						<div class="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
							<div class="w-2 h-2 rounded-full {$modelStatus.connected ? 'bg-green-500' : 'bg-red-500'}"></div>
							<svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
							</svg>
							<span class="text-sm font-medium text-gray-700 dark:text-gray-300">
								{$modelStatus.connected ? $settings.model : 'No Model'}
							</span>
						</div>
					</div>
				</div>

				<div class="flex items-center space-x-2">
					<button
						on:click={openModelSettings}
						class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 {!$modelStatus.connected ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400' : ''}"
						title="Model Settings"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
						</svg>
					</button>
				</div>
			</div>
		</div>

		<!-- Messages -->
		<MessageList 
			bind:this={messageListComponent}
			chatId={$currentChatId}
		/>

		<!-- Input -->
		<MessageInput
			on:send={sendMessage}
			on:stop={stopGeneration}
			on:openModelSettings={() => showModelSettings = true}
			disabled={$isLoading}
		/>
	</div>
</div>

<!-- Model Settings Modal -->
<ModelSettings
	bind:isOpen={showModelSettings}
	onClose={() => showModelSettings = false}
/>
