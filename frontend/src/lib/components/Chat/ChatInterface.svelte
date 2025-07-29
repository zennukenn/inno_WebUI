<script lang="ts">
	import { onMount } from 'svelte';
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
	import { api } from '$lib/api';
	import { generateId } from '$lib/utils';
	import { toast } from 'svelte-sonner';
	import type { Chat, Message, MessageCreate, ChatCompletionRequest } from '$lib/types';

	import ChatSidebar from './ChatSidebar.svelte';
	import MessageList from './MessageList.svelte';
	import MessageInput from './MessageInput.svelte';
	import ModelSettings from '../Settings/ModelSettings.svelte';
	import ConnectionStatus from '../UI/ConnectionStatus.svelte';
	import DebugPanel from '../Debug/DebugPanel.svelte';
	import ConnectionTest from '../Debug/ConnectionTest.svelte';

	let showModelSettings = false;
	let showDebugPanel = false;
	let showConnectionTest = false;

	onMount(async () => {
		// Load chats on mount
		await loadChats();

		// Check model status
		await checkModelStatus();

		// Handle mobile detection
		const checkMobile = () => {
			mobile.set(window.innerWidth < 768);
		};
		checkMobile();
		window.addEventListener('resize', checkMobile);

		return () => {
			window.removeEventListener('resize', checkMobile);
		};
	});

	async function loadChats() {
		try {
			const response = await api.getChats();
			if (response.success && response.data) {
				chats.set(response.data);
			}
		} catch (error) {
			console.error('Failed to load chats:', error);
			toast.error('Failed to load chats');
		}
	}

	async function checkModelStatus() {
		try {
			const response = await api.healthCheck();
			if (response.success) {
				modelStatus.set({ connected: true, error: undefined, models: [] });
			} else {
				modelStatus.set({ connected: false, error: 'Model not available', models: [] });
			}
		} catch (error) {
			modelStatus.set({ connected: false, error: 'Connection failed', models: [] });
		}
	}

	async function createNewChat() {
		try {
			const response = await api.createChat({ title: 'New Chat' });
			if (response.success && response.data) {
				const newChat = response.data;
				chats.update(chatList => [newChat, ...chatList]);
				await selectChat(newChat.id);
				return newChat.id;
			}
		} catch (error) {
			console.error('Failed to create chat:', error);
			toast.error('Failed to create chat');
		}
		return null;
	}

	async function selectChat(chatId: string) {
		try {
			currentChatId.set(chatId);

			// Load chat details and messages
			const [chatResponse, messagesResponse] = await Promise.all([
				api.getChat(chatId),
				api.getMessages(chatId)
			]);

			if (chatResponse.success && chatResponse.data) {
				currentChat.set(chatResponse.data);
			}

			if (messagesResponse.success && messagesResponse.data) {
				messages.set(messagesResponse.data);
			}

			// Close sidebar on mobile after selecting chat
			if ($mobile) {
				sidebarOpen.set(false);
			}
		} catch (error) {
			console.error('Failed to select chat:', error);
			toast.error('Failed to load chat');
		}
	}

	async function sendMessage(event: CustomEvent<{ content: string }>) {
		const content = event.detail.content;
		console.log('🚀 [DEBUG] sendMessage called with content:', content);

		// Check if model is connected
		if (!$modelStatus.connected) {
			console.warn('⚠️ [DEBUG] Model not connected:', $modelStatus);
			toast.error('No model connected. Please configure a model first.');
			showModelSettings = true;
			return;
		}

		if (!$currentChatId) {
			console.log('📝 [DEBUG] No current chat, creating new chat...');
			const newChatId = await createNewChat();
			if (!newChatId) {
				console.error('❌ [DEBUG] Failed to create new chat');
				toast.error('Failed to create chat');
				return;
			}
			console.log('✅ [DEBUG] New chat created:', newChatId);
		}

		if (!$currentChatId) {
			console.error('❌ [DEBUG] No chat ID available after creation attempt');
			return;
		}

		// Add user message
		const userMessage: Message = {
			id: generateId(),
			chat_id: $currentChatId,
			role: 'user',
			content,
			timestamp: Math.floor(Date.now() / 1000),
			metadata: {}
		};

		console.log('👤 [DEBUG] User message created:', userMessage);

		try {
			// Add user message to UI immediately
			messages.update(msgs => [...msgs, userMessage]);
			console.log('✅ [DEBUG] User message added to UI');

			// Save user message to backend
			console.log('💾 [DEBUG] Saving user message to backend...');
			const saveResponse = await api.addMessage($currentChatId, {
				role: 'user',
				content,
				timestamp: userMessage.timestamp
			});
			console.log('✅ [DEBUG] User message saved to backend:', saveResponse);

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
				chat_id: $currentChatId
			};
			console.log('🤖 [DEBUG] Chat completion request prepared:', completionRequest);

			// Start streaming response
			isStreaming.set(true);
			console.log('🔄 [DEBUG] Streaming started, isStreaming set to true');

			const assistantMessage: Message = {
				id: generateId(),
				chat_id: $currentChatId,
				role: 'assistant',
				content: '',
				timestamp: Math.floor(Date.now() / 1000),
				metadata: {}
			};
			console.log('🤖 [DEBUG] Assistant message placeholder created:', assistantMessage);

			messages.update(msgs => [...msgs, assistantMessage]);
			console.log('✅ [DEBUG] Assistant message placeholder added to UI');

			// Handle streaming response
			console.log('📡 [DEBUG] Calling chatCompletionStream...');
			const stream = await api.chatCompletionStream(completionRequest);
			if (stream) {
				console.log('✅ [DEBUG] Stream received, starting to read...');
				const reader = stream.getReader();
				const decoder = new TextDecoder();
				let totalContent = '';
				let chunkCount = 0;

				try {
					while (true) {
						const { done, value } = await reader.read();
						if (done) {
							console.log('🏁 [DEBUG] Stream reading completed', { totalContent, chunkCount });
							break;
						}

						const chunk = decoder.decode(value);
						chunkCount++;
						console.log(`📦 [DEBUG] Chunk ${chunkCount} received:`, chunk.substring(0, 100) + '...');

						const lines = chunk.split('\n');

						for (const line of lines) {
							if (line.startsWith('data: ')) {
								const data = line.slice(6);
								if (data.trim() === '[DONE]') {
									console.log('🏁 [DEBUG] Received [DONE] signal');
									break;
								}

								try {
									const parsed = JSON.parse(data);
									console.log('📄 [DEBUG] Parsed chunk data:', parsed);

									if (parsed.choices && parsed.choices[0]?.delta?.content) {
										const content = parsed.choices[0].delta.content;
										totalContent += content;
										console.log('📝 [DEBUG] Content delta:', { content, totalLength: totalContent.length });

										messages.update(msgs => {
											const lastMsg = msgs[msgs.length - 1];
											if (lastMsg.role === 'assistant') {
												lastMsg.content += content;
											}
											return [...msgs];
										});
									}
								} catch (e) {
									console.warn('⚠️ [DEBUG] JSON parse error:', e, 'Data:', data);
								}
							}
						}
					}
				} finally {
					reader.releaseLock();
					console.log('🔓 [DEBUG] Stream reader released');
				}
			} else {
				console.error('❌ [DEBUG] No stream received from API');
				toast.error('Failed to get response stream');
			}

		} catch (error) {
			console.error('❌ [DEBUG] Error in sendMessage:', error);
			console.error('❌ [DEBUG] Error stack:', error.stack);
			toast.error('Failed to send message');
		} finally {
			isStreaming.set(false);
			console.log('🔄 [DEBUG] Streaming finished, isStreaming set to false');
		}
	}
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
			role="button"
			tabindex="0"
			on:click={() => sidebarOpen.set(false)}
			on:keydown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					sidebarOpen.set(false);
				}
			}}
			aria-label="Close sidebar"
		></div>
	{/if}

	<!-- Main chat area -->
	<div class="flex-1 flex flex-col">
		<!-- Header -->
		<div class="border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
			<div class="flex items-center gap-3">
				{#if $mobile}
					<button
						on:click={() => sidebarOpen.set(true)}
						class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
						</svg>
					</button>
				{/if}
				<h1 class="text-lg font-semibold">
					{$currentChat?.title || 'Select a chat'}
				</h1>
			</div>

			<div class="flex items-center space-x-3">
				<!-- Connection Status -->
				<ConnectionStatus />

				<!-- Connection Test Button -->
				<button
					on:click={() => showConnectionTest = !showConnectionTest}
					class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400"
					class:bg-blue-100={showConnectionTest}
					class:dark:bg-blue-900={showConnectionTest}
					title="Connection Test"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
					</svg>
				</button>

				<!-- Debug Button -->
				<button
					on:click={() => showDebugPanel = true}
					class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400"
					title="Debug Panel"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
					</svg>
				</button>

				<!-- Settings Button -->
				<button
					on:click={() => showModelSettings = true}
					class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
					class:text-green-600={$modelStatus.connected}
					class:text-red-600={!$modelStatus.connected}
					title="Model Settings"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
					</svg>
				</button>
			</div>
		</div>

		<!-- Connection Test (if enabled) -->
		{#if showConnectionTest}
			<div class="p-4 border-b border-gray-200 dark:border-gray-700">
				<ConnectionTest />
			</div>
		{/if}

		<!-- Messages -->
		<div class="flex-1 overflow-hidden">
			<MessageList />
		</div>

		<!-- Input -->
		<div class="border-t border-gray-200 dark:border-gray-700 p-4">
			<MessageInput on:send={sendMessage} disabled={$isStreaming} />
		</div>
	</div>
</div>

<!-- Model Settings Modal -->
{#if showModelSettings}
	<ModelSettings
		isOpen={showModelSettings}
		onClose={() => showModelSettings = false}
	/>
{/if}

<!-- Debug Panel -->
<DebugPanel bind:isOpen={showDebugPanel} />