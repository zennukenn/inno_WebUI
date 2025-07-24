/**
 * 智能内容解析器
 * 用于识别和分类模型返回的不同类型内容
 */

export interface ContentBlock {
	type: 'thinking' | 'main' | 'code' | 'list' | 'quote' | 'heading' | 'table' | 'math';
	content: string;
	language?: string; // 用于代码块
	level?: number; // 用于标题级别
	metadata?: Record<string, any>;
}

export interface ParsedContent {
	blocks: ContentBlock[];
	hasThinking: boolean;
	hasCode: boolean;
	mainContentBlocks: ContentBlock[];
}

/**
 * 解析内容的主函数
 */
export function parseContent(content: string): ParsedContent {
	const blocks: ContentBlock[] = [];
	const lines = content.split('\n');
	let currentBlock: ContentBlock | null = null;
	let inCodeBlock = false;
	let codeLanguage = '';
	let inThinking = false;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const trimmedLine = line.trim();

		// 检测思考过程标记
		if (isThinkingStart(trimmedLine)) {
			// 保存当前块
			if (currentBlock) {
				blocks.push(currentBlock);
				currentBlock = null;
			}
			inThinking = true;
			continue;
		}

		if (isThinkingEnd(trimmedLine)) {
			// 保存思考块
			if (currentBlock && currentBlock.type === 'thinking') {
				blocks.push(currentBlock);
				currentBlock = null;
			}
			inThinking = false;
			continue;
		}

		// 检测代码块
		const codeBlockMatch = trimmedLine.match(/^```(\w+)?/);
		if (codeBlockMatch) {
			// 保存当前块
			if (currentBlock) {
				blocks.push(currentBlock);
			}
			
			if (!inCodeBlock) {
				// 开始代码块
				inCodeBlock = true;
				codeLanguage = codeBlockMatch[1] || '';
				currentBlock = {
					type: 'code',
					content: '',
					language: codeLanguage
				};
			} else {
				// 结束代码块
				if (currentBlock) {
					blocks.push(currentBlock);
				}
				inCodeBlock = false;
				codeLanguage = '';
				currentBlock = null;
			}
			continue;
		}

		// 在代码块内
		if (inCodeBlock && currentBlock) {
			currentBlock.content += (currentBlock.content ? '\n' : '') + line;
			continue;
		}

		// 检测标题
		const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.+)/);
		if (headingMatch && !inThinking) {
			// 保存当前块
			if (currentBlock) {
				blocks.push(currentBlock);
			}
			blocks.push({
				type: 'heading',
				content: headingMatch[2],
				level: headingMatch[1].length
			});
			currentBlock = null;
			continue;
		}

		// 检测列表
		if (isListItem(trimmedLine) && !inThinking) {
			if (!currentBlock || currentBlock.type !== 'list') {
				// 保存当前块并开始新的列表块
				if (currentBlock) {
					blocks.push(currentBlock);
				}
				currentBlock = {
					type: 'list',
					content: line
				};
			} else {
				// 继续列表
				currentBlock.content += '\n' + line;
			}
			continue;
		}

		// 检测引用
		if (trimmedLine.startsWith('>') && !inThinking) {
			if (!currentBlock || currentBlock.type !== 'quote') {
				// 保存当前块并开始新的引用块
				if (currentBlock) {
					blocks.push(currentBlock);
				}
				currentBlock = {
					type: 'quote',
					content: line
				};
			} else {
				// 继续引用
				currentBlock.content += '\n' + line;
			}
			continue;
		}

		// 检测数学公式
		if (isMathBlock(trimmedLine)) {
			// 保存当前块
			if (currentBlock) {
				blocks.push(currentBlock);
			}
			blocks.push({
				type: 'math',
				content: trimmedLine
			});
			currentBlock = null;
			continue;
		}

		// 处理普通文本
		const blockType = inThinking ? 'thinking' : 'main';
		
		if (!currentBlock || currentBlock.type !== blockType) {
			// 保存当前块并开始新块
			if (currentBlock) {
				blocks.push(currentBlock);
			}
			currentBlock = {
				type: blockType,
				content: line
			};
		} else {
			// 继续当前块
			if (trimmedLine || currentBlock.content.trim()) {
				currentBlock.content += '\n' + line;
			}
		}
	}

	// 保存最后一个块
	if (currentBlock) {
		blocks.push(currentBlock);
	}

	// 清理空块和处理内容
	const cleanedBlocks = blocks
		.filter(block => block.content.trim())
		.map(block => ({
			...block,
			content: block.content.trim()
		}));

	const hasThinking = cleanedBlocks.some(block => block.type === 'thinking');
	const hasCode = cleanedBlocks.some(block => block.type === 'code');
	const mainContentBlocks = cleanedBlocks.filter(block => block.type !== 'thinking');

	return {
		blocks: cleanedBlocks,
		hasThinking,
		hasCode,
		mainContentBlocks
	};
}

/**
 * 检测思考过程开始标记
 */
function isThinkingStart(line: string): boolean {
	const thinkingPatterns = [
		/^<thinking>/i,
		/^<think>/i,
		/^思考[:：]/i,
		/^让我想想/i,
		/^我需要思考/i,
		/^分析[:：]/i,
		/^reasoning[:：]/i,
		/^thought[:：]/i
	];
	
	return thinkingPatterns.some(pattern => pattern.test(line));
}

/**
 * 检测思考过程结束标记
 */
function isThinkingEnd(line: string): boolean {
	const endPatterns = [
		/^<\/thinking>/i,
		/^<\/think>/i,
		/^思考结束/i,
		/^分析结束/i,
		/^结论[:：]/i,
		/^答案[:：]/i,
		/^回答[:：]/i
	];
	
	return endPatterns.some(pattern => pattern.test(line));
}

/**
 * 检测列表项
 */
function isListItem(line: string): boolean {
	return /^[\s]*[-*+]\s+/.test(line) || /^[\s]*\d+\.\s+/.test(line);
}

/**
 * 检测数学公式
 */
function isMathBlock(line: string): boolean {
	return /^\$\$.*\$\$$/.test(line) || /^\\\[.*\\\]$/.test(line);
}

/**
 * 获取内容摘要
 */
export function getContentSummary(parsed: ParsedContent): string {
	const { blocks, hasThinking, hasCode } = parsed;
	const mainBlocks = blocks.filter(block => block.type === 'main');
	
	if (mainBlocks.length === 0) {
		return hasThinking ? '思考过程' : '内容';
	}
	
	const firstMainBlock = mainBlocks[0];
	const summary = firstMainBlock.content.substring(0, 100);
	
	const features = [];
	if (hasThinking) features.push('包含思考过程');
	if (hasCode) features.push('包含代码');
	
	return features.length > 0 ? `${summary}... (${features.join('、')})` : summary;
}
