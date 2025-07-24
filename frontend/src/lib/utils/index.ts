import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';

// Configure marked for markdown rendering
marked.setOptions({
	breaks: true,
	gfm: true
});

export function renderMarkdown(content: string): string {
	let html = marked(content) as string;

	// Apply syntax highlighting
	html = html.replace(/<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g, (match, lang, code) => {
		try {
			if (lang && hljs.getLanguage(lang)) {
				const highlighted = hljs.highlight(code, { language: lang }).value;
				return `<pre><code class="language-${lang}">${highlighted}</code></pre>`;
			}
		} catch (err) {
			console.error('Highlight.js error:', err);
		}
		return match;
	});

	return DOMPurify.sanitize(html);
}

export function formatTimestamp(timestamp: number): string {
	const date = new Date(timestamp * 1000);
	const now = new Date();
	const diff = now.getTime() - date.getTime();
	
	// Less than 1 minute
	if (diff < 60000) {
		return 'Just now';
	}
	
	// Less than 1 hour
	if (diff < 3600000) {
		const minutes = Math.floor(diff / 60000);
		return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
	}
	
	// Less than 1 day
	if (diff < 86400000) {
		const hours = Math.floor(diff / 3600000);
		return `${hours} hour${hours > 1 ? 's' : ''} ago`;
	}
	
	// Less than 1 week
	if (diff < 604800000) {
		const days = Math.floor(diff / 86400000);
		return `${days} day${days > 1 ? 's' : ''} ago`;
	}
	
	// Format as date
	return date.toLocaleDateString();
}

export function formatTime(timestamp: number): string {
	const date = new Date(timestamp * 1000);
	return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function generateId(): string {
	return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function copyToClipboard(text: string): Promise<void> {
	if (navigator.clipboard && window.isSecureContext) {
		return navigator.clipboard.writeText(text);
	} else {
		// Fallback for older browsers
		const textArea = document.createElement('textarea');
		textArea.value = text;
		textArea.style.position = 'fixed';
		textArea.style.left = '-999999px';
		textArea.style.top = '-999999px';
		document.body.appendChild(textArea);
		textArea.focus();
		textArea.select();
		
		return new Promise((resolve, reject) => {
			if (document.execCommand('copy')) {
				resolve();
			} else {
				reject(new Error('Copy failed'));
			}
			document.body.removeChild(textArea);
		});
	}
}

export function truncateText(text: string, maxLength: number): string {
	if (text.length <= maxLength) return text;
	return text.substring(0, maxLength) + '...';
}

export function debounce<T extends (...args: any[]) => any>(
	func: T,
	wait: number
): (...args: Parameters<T>) => void {
	let timeout: any;
	return (...args: Parameters<T>) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
}

export function throttle<T extends (...args: any[]) => any>(
	func: T,
	limit: number
): (...args: Parameters<T>) => void {
	let inThrottle: boolean;
	return (...args: Parameters<T>) => {
		if (!inThrottle) {
			func(...args);
			inThrottle = true;
			setTimeout(() => inThrottle = false, limit);
		}
	};
}

export function scrollToBottom(element: HTMLElement, smooth = true): void {
	element.scrollTo({
		top: element.scrollHeight,
		behavior: smooth ? 'smooth' : 'auto'
	});
}

export function isAtBottom(element: HTMLElement, threshold = 50): boolean {
	return element.scrollHeight - element.scrollTop - element.clientHeight < threshold;
}
