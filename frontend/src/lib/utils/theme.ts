import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'light' | 'dark';

// 创建主题store
function createThemeStore() {
	// 从localStorage获取保存的主题，默认为light
	const defaultTheme: Theme = 'light';
	const initialTheme = browser 
		? (localStorage.getItem('theme') as Theme) || defaultTheme
		: defaultTheme;

	const { subscribe, set, update } = writable<Theme>(initialTheme);

	return {
		subscribe,
		set: (theme: Theme) => {
			if (browser) {
				localStorage.setItem('theme', theme);
				// 更新HTML class
				document.documentElement.classList.remove('light', 'dark');
				document.documentElement.classList.add(theme);
			}
			set(theme);
		},
		toggle: () => {
			update(currentTheme => {
				const newTheme = currentTheme === 'light' ? 'dark' : 'light';
				if (browser) {
					localStorage.setItem('theme', newTheme);
					// 更新HTML class
					document.documentElement.classList.remove('light', 'dark');
					document.documentElement.classList.add(newTheme);
				}
				return newTheme;
			});
		},
		init: () => {
			if (browser) {
				const savedTheme = localStorage.getItem('theme') as Theme;
				const theme = savedTheme || defaultTheme;
				document.documentElement.classList.remove('light', 'dark');
				document.documentElement.classList.add(theme);
				set(theme);
			}
		}
	};
}

export const theme = createThemeStore();
