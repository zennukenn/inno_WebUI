<script lang="ts">
	import { onMount } from 'svelte';
	import { chats, currentChatId, sidebarOpen } from '$lib/stores';
	import { api } from '$lib/api';
	import { formatTimestamp, truncateText } from '$lib/utils';
	import type { Chat } from '$lib/types';
	import DeleteChatDialog from './DeleteChatDialog.svelte';

	export let onNewChat: () => void;
	export let onSelectChat: (chatId: string) => void;

	let searchQuery = '';
	let filteredChats: Chat[] = [];
	let showDeleteConfirm = false;
	let chatToDelete: string | null = null;
	let chatToDeleteTitle = '';

	$: {
		if (searchQuery.trim()) {
			filteredChats = $chats.filter(chat =>
				chat.title.toLowerCase().includes(searchQuery.toLowerCase())
			);
		} else {
			filteredChats = $chats;
		}
	}

	async function loadChats() {
		const response = await api.getChats();
		if (response.success && response.data) {
			chats.set(response.data);
		}
	}

	function showDeleteDialog(chatId: string, chatTitle: string, event: Event) {
		event.stopPropagation();
		chatToDelete = chatId;
		chatToDeleteTitle = chatTitle;
		showDeleteConfirm = true;
	}

	async function confirmDelete() {
		if (!chatToDelete) return;

		const response = await api.deleteChat(chatToDelete);
		if (response.success) {
			chats.update(chats => chats.filter(chat => chat.id !== chatToDelete));
			if ($currentChatId === chatToDelete) {
				currentChatId.set(null);
			}
		}

		// Reset state
		chatToDelete = null;
		chatToDeleteTitle = '';
		showDeleteConfirm = false;
	}

	function cancelDelete() {
		chatToDelete = null;
		chatToDeleteTitle = '';
		showDeleteConfirm = false;
	}

	onMount(() => {
		loadChats();
	});
</script>

<div class="flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
	<!-- Header -->
	<div class="p-4 border-b border-gray-200 dark:border-gray-700">
		<div class="flex items-center justify-between mb-4">
			<div class="flex items-center space-x-2">
				<div class="flex items-center justify-center">
					<img src="/inno.png" alt="Inno WebUI Logo" />
				</div>
				<h1 class="text-lg font-semibold text-gray-900 dark:text-white">Inno WebUI</h1>
			</div>
			<button
				on:click={() => sidebarOpen.set(false)}
				class="md:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>

		<button
			on:click={onNewChat}
			class="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center space-x-2"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
			<span>New Chat</span>
		</button>
	</div>

	<!-- Search -->
	<div class="p-4">
		<div class="relative">
			<svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
			</svg>
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Search chats..."
				class="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
			/>
		</div>
	</div>

	<!-- Chat List -->
	<div class="flex-1 overflow-y-auto px-2">
		<div class="space-y-1">
			{#each filteredChats as chat (chat.id)}
				<div
					class="p-3 rounded-lg cursor-pointer transition-all duration-200 group transform hover:scale-[1.01] {$currentChatId === chat.id
						? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 shadow-sm'
						: 'hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:shadow-sm'}"
					role="button"
					tabindex="0"
					on:click={() => onSelectChat(chat.id)}
					on:keydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							onSelectChat(chat.id);
						}
					}}
				>
					<div class="flex items-start justify-between">
						<div class="flex-1 min-w-0">
							<h3 class="text-sm font-medium {$currentChatId === chat.id
								? 'text-blue-700 dark:text-blue-300'
								: 'text-gray-900 dark:text-white'} truncate">
								{truncateText(chat.title, 30)}
							</h3>
							<p class="text-xs {$currentChatId === chat.id
								? 'text-blue-600 dark:text-blue-400'
								: 'text-gray-500 dark:text-gray-400'} mt-1">
								{formatTimestamp(new Date(chat.updated_at || chat.created_at || '').getTime() / 1000)}
							</p>
						</div>
						<button
							on:click={(e) => showDeleteDialog(chat.id, chat.title, e)}
							class="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/20 transition-all duration-200 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:scale-110 transform"
							title="Delete chat"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
							</svg>
						</button>
					</div>
				</div>
			{/each}
		</div>

		{#if filteredChats.length === 0}
			<div class="p-8 text-center">
				<div class="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
					<svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
					</svg>
				</div>
				<p class="text-sm text-gray-500 dark:text-gray-400">
					{searchQuery ? 'No chats found' : 'No chats yet'}
				</p>
				{#if !searchQuery}
					<p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
						Start a new conversation to get started
					</p>
				{/if}
			</div>
		{/if}
	</div>
</div>

<!-- Delete Chat Dialog -->
<DeleteChatDialog
	bind:isOpen={showDeleteConfirm}
	chatTitle={chatToDeleteTitle}
	on:confirm={confirmDelete}
	on:cancel={cancelDelete}
/>
