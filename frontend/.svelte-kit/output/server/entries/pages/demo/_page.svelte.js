import { c as create_ssr_component, f as escape, v as validate_component } from "../../../chunks/ssr.js";
import { r as renderMarkdown } from "../../../chunks/index2.js";
const css$1 = {
  code: ".thinking-section.svelte-1jlyhx.svelte-1jlyhx{border-radius:0.75rem;overflow:hidden}.thinking-header.svelte-1jlyhx.svelte-1jlyhx{cursor:pointer;-webkit-user-select:none;-moz-user-select:none;user-select:none}.thinking-content.svelte-1jlyhx.svelte-1jlyhx{background:linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)}.dark .thinking-content.svelte-1jlyhx.svelte-1jlyhx{background:linear-gradient(135deg, #1e293b 0%, #334155 100%)}.thinking-prose{font-style:italic;color:#6b7280;font-size:0.875rem;line-height:1.5}.dark .thinking-prose{color:#9ca3af}.thinking-prose h1,.thinking-prose h2,.thinking-prose h3,.thinking-prose h4,.thinking-prose h5,.thinking-prose h6{font-style:normal;font-weight:600;color:#4b5563}.dark .thinking-prose h1,.dark .thinking-prose h2,.dark .thinking-prose h3,.dark .thinking-prose h4,.dark .thinking-prose h5,.dark .thinking-prose h6{color:#d1d5db}.thinking-prose code{background-color:#e5e7eb;color:#374151;font-style:normal;padding:0.125rem 0.25rem;border-radius:0.25rem;font-size:0.8rem}.dark .thinking-prose code{background-color:#374151;color:#d1d5db}.thinking-prose pre{background-color:#f3f4f6;border:1px solid #e5e7eb;font-style:normal}.dark .thinking-prose pre{background-color:#374151;border-color:#4b5563}.thinking-prose blockquote{border-left:4px solid #d1d5db;background-color:#f9fafb;font-style:normal;margin:1rem 0;padding:0.75rem 1rem}.dark .thinking-prose blockquote{border-left-color:#6b7280;background-color:#1f2937}.response-prose{color:#374151;line-height:1.7}.dark .response-prose{color:#d1d5db}.response-prose h1,.response-prose h2,.response-prose h3,.response-prose h4,.response-prose h5,.response-prose h6{color:#111827;font-weight:700;margin-top:1.5rem;margin-bottom:0.75rem}.dark .response-prose h1,.dark .response-prose h2,.dark .response-prose h3,.dark .response-prose h4,.dark .response-prose h5,.dark .response-prose h6{color:#f9fafb}.response-prose code{background-color:#f3f4f6;color:#dc2626;padding:0.125rem 0.375rem;border-radius:0.375rem;font-size:0.875rem;font-weight:500}.dark .response-prose code{background-color:#374151;color:#fca5a5}.response-prose pre{background-color:#1f2937;border:1px solid #374151;border-radius:0.5rem;padding:1rem;overflow-x:auto;margin:1rem 0}.response-prose pre code{background-color:transparent;color:#e5e7eb;padding:0;border-radius:0;font-size:0.875rem;font-weight:400}.response-prose blockquote{border-left:4px solid #3b82f6;background-color:#eff6ff;margin:1.5rem 0;padding:1rem 1.5rem;border-radius:0.5rem}.dark .response-prose blockquote{border-left-color:#60a5fa;background-color:#1e3a8a}.thinking-header.svelte-1jlyhx.svelte-1jlyhx:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(0, 0, 0, 0.1)}.dark .thinking-header.svelte-1jlyhx.svelte-1jlyhx:hover{box-shadow:0 4px 12px rgba(0, 0, 0, 0.3)}@media(max-width: 640px){.thinking-prose,.response-prose{font-size:0.875rem}.thinking-header.svelte-1jlyhx.svelte-1jlyhx{padding:0.75rem}.thinking-content.svelte-1jlyhx .p-4.svelte-1jlyhx{padding:0.75rem}}",
  map: `{"version":3,"file":"AIResponse.svelte","sources":["AIResponse.svelte"],"sourcesContent":["<script lang=\\"ts\\">import { renderMarkdown } from \\"$lib/utils\\";\\nimport { slide } from \\"svelte/transition\\";\\nexport let content;\\nexport let isStreaming = false;\\nlet showThinking = false;\\nlet thinkingContent = \\"\\";\\nlet responseContent = \\"\\";\\nfunction parseAIResponse(text) {\\n  const thinkingRegex = /(?:<thinking>([\\\\s\\\\S]*?)<\\\\/thinking>|【思考】([\\\\s\\\\S]*?)【\\\\/思考】)/gi;\\n  const matches = [...text.matchAll(thinkingRegex)];\\n  if (matches.length > 0) {\\n    thinkingContent = matches.map((match) => match[1] || match[2]).join(\\"\\\\n\\\\n\\").trim();\\n    responseContent = text.replace(thinkingRegex, \\"\\").trim();\\n  } else {\\n    thinkingContent = \\"\\";\\n    responseContent = text;\\n  }\\n}\\n$: parseAIResponse(content);\\n$: hasThinking = thinkingContent.length > 0;\\n$: renderedThinking = hasThinking ? renderMarkdown(thinkingContent) : \\"\\";\\n$: renderedResponse = renderMarkdown(responseContent);\\n<\/script>\\n\\n<div class=\\"ai-response\\">\\n\\t<!-- 思考部分 -->\\n\\t{#if hasThinking}\\n\\t\\t<div class=\\"thinking-section mb-4\\">\\n\\t\\t\\t<!-- 思考标题栏 -->\\n\\t\\t\\t<button\\n\\t\\t\\t\\tclass=\\"thinking-header w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-t-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors\\"\\n\\t\\t\\t\\ton:click={() => showThinking = !showThinking}\\n\\t\\t\\t>\\n\\t\\t\\t\\t<div class=\\"flex items-center space-x-2\\">\\n\\t\\t\\t\\t\\t<svg class=\\"w-4 h-4 text-gray-500 dark:text-gray-400\\" fill=\\"none\\" stroke=\\"currentColor\\" viewBox=\\"0 0 24 24\\">\\n\\t\\t\\t\\t\\t\\t<path stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\" stroke-width=\\"2\\" d=\\"M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z\\" />\\n\\t\\t\\t\\t\\t</svg>\\n\\t\\t\\t\\t\\t<span class=\\"text-sm font-medium text-gray-600 dark:text-gray-300\\">\\n\\t\\t\\t\\t\\t\\tAI思考过程\\n\\t\\t\\t\\t\\t</span>\\n\\t\\t\\t\\t\\t<span class=\\"text-xs text-gray-400 dark:text-gray-500 bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded-full\\">\\n\\t\\t\\t\\t\\t\\t{showThinking ? '点击收起' : '点击展开'}\\n\\t\\t\\t\\t\\t</span>\\n\\t\\t\\t\\t</div>\\n\\t\\t\\t\\t<svg \\n\\t\\t\\t\\t\\tclass=\\"w-4 h-4 text-gray-400 transition-transform duration-200 {showThinking ? 'rotate-180' : ''}\\"\\n\\t\\t\\t\\t\\tfill=\\"none\\" \\n\\t\\t\\t\\t\\tstroke=\\"currentColor\\" \\n\\t\\t\\t\\t\\tviewBox=\\"0 0 24 24\\"\\n\\t\\t\\t\\t>\\n\\t\\t\\t\\t\\t<path stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\" stroke-width=\\"2\\" d=\\"M19 9l-7 7-7-7\\" />\\n\\t\\t\\t\\t</svg>\\n\\t\\t\\t</button>\\n\\n\\t\\t\\t<!-- 思考内容 -->\\n\\t\\t\\t{#if showThinking}\\n\\t\\t\\t\\t<div \\n\\t\\t\\t\\t\\tclass=\\"thinking-content border-l border-r border-b border-gray-200 dark:border-gray-600 rounded-b-lg\\"\\n\\t\\t\\t\\t\\ttransition:slide={{ duration: 300 }}\\n\\t\\t\\t\\t>\\n\\t\\t\\t\\t\\t<div class=\\"p-4 bg-gray-25 dark:bg-gray-800/30\\">\\n\\t\\t\\t\\t\\t\\t<div class=\\"prose prose-sm prose-gray dark:prose-invert max-w-none thinking-prose\\">\\n\\t\\t\\t\\t\\t\\t\\t{@html renderedThinking}\\n\\t\\t\\t\\t\\t\\t</div>\\n\\t\\t\\t\\t\\t</div>\\n\\t\\t\\t\\t</div>\\n\\t\\t\\t{/if}\\n\\t\\t</div>\\n\\t{/if}\\n\\n\\t<!-- 正式回答部分 -->\\n\\t<div class=\\"response-section\\">\\n\\t\\t<div class=\\"prose prose-gray dark:prose-invert max-w-none response-prose\\">\\n\\t\\t\\t{@html renderedResponse}\\n\\t\\t\\t{#if isStreaming}\\n\\t\\t\\t\\t<span class=\\"inline-block w-2 h-5 bg-blue-500 animate-pulse ml-1 rounded-sm\\"></span>\\n\\t\\t\\t{/if}\\n\\t\\t</div>\\n\\t</div>\\n</div>\\n\\n<style>\\n\\t/* 思考部分样式 */\\n\\t.thinking-section {\\n\\t\\tborder-radius: 0.75rem;\\n\\t\\toverflow: hidden;\\n\\t}\\n\\n\\t.thinking-header {\\n\\t\\tcursor: pointer;\\n\\t\\t-webkit-user-select: none;\\n\\t\\t   -moz-user-select: none;\\n\\t\\t        user-select: none;\\n\\t}\\n\\n\\t.thinking-content {\\n\\t\\tbackground: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);\\n\\t}\\n\\n\\t:global(.dark) .thinking-content {\\n\\t\\tbackground: linear-gradient(135deg, #1e293b 0%, #334155 100%);\\n\\t}\\n\\n\\t/* 思考内容的特殊样式 */\\n\\t:global(.thinking-prose) {\\n\\t\\tfont-style: italic;\\n\\t\\tcolor: #6b7280;\\n\\t\\tfont-size: 0.875rem;\\n\\t\\tline-height: 1.5;\\n\\t}\\n\\n\\t:global(.dark .thinking-prose) {\\n\\t\\tcolor: #9ca3af;\\n\\t}\\n\\n\\t:global(.thinking-prose h1),\\n\\t:global(.thinking-prose h2),\\n\\t:global(.thinking-prose h3),\\n\\t:global(.thinking-prose h4),\\n\\t:global(.thinking-prose h5),\\n\\t:global(.thinking-prose h6) {\\n\\t\\tfont-style: normal;\\n\\t\\tfont-weight: 600;\\n\\t\\tcolor: #4b5563;\\n\\t}\\n\\n\\t:global(.dark .thinking-prose h1),\\n\\t:global(.dark .thinking-prose h2),\\n\\t:global(.dark .thinking-prose h3),\\n\\t:global(.dark .thinking-prose h4),\\n\\t:global(.dark .thinking-prose h5),\\n\\t:global(.dark .thinking-prose h6) {\\n\\t\\tcolor: #d1d5db;\\n\\t}\\n\\n\\t:global(.thinking-prose code) {\\n\\t\\tbackground-color: #e5e7eb;\\n\\t\\tcolor: #374151;\\n\\t\\tfont-style: normal;\\n\\t\\tpadding: 0.125rem 0.25rem;\\n\\t\\tborder-radius: 0.25rem;\\n\\t\\tfont-size: 0.8rem;\\n\\t}\\n\\n\\t:global(.dark .thinking-prose code) {\\n\\t\\tbackground-color: #374151;\\n\\t\\tcolor: #d1d5db;\\n\\t}\\n\\n\\t:global(.thinking-prose pre) {\\n\\t\\tbackground-color: #f3f4f6;\\n\\t\\tborder: 1px solid #e5e7eb;\\n\\t\\tfont-style: normal;\\n\\t}\\n\\n\\t:global(.dark .thinking-prose pre) {\\n\\t\\tbackground-color: #374151;\\n\\t\\tborder-color: #4b5563;\\n\\t}\\n\\n\\t:global(.thinking-prose blockquote) {\\n\\t\\tborder-left: 4px solid #d1d5db;\\n\\t\\tbackground-color: #f9fafb;\\n\\t\\tfont-style: normal;\\n\\t\\tmargin: 1rem 0;\\n\\t\\tpadding: 0.75rem 1rem;\\n\\t}\\n\\n\\t:global(.dark .thinking-prose blockquote) {\\n\\t\\tborder-left-color: #6b7280;\\n\\t\\tbackground-color: #1f2937;\\n\\t}\\n\\n\\t/* 正式回答样式 */\\n\\t:global(.response-prose) {\\n\\t\\tcolor: #374151;\\n\\t\\tline-height: 1.7;\\n\\t}\\n\\n\\t:global(.dark .response-prose) {\\n\\t\\tcolor: #d1d5db;\\n\\t}\\n\\n\\t:global(.response-prose h1),\\n\\t:global(.response-prose h2),\\n\\t:global(.response-prose h3),\\n\\t:global(.response-prose h4),\\n\\t:global(.response-prose h5),\\n\\t:global(.response-prose h6) {\\n\\t\\tcolor: #111827;\\n\\t\\tfont-weight: 700;\\n\\t\\tmargin-top: 1.5rem;\\n\\t\\tmargin-bottom: 0.75rem;\\n\\t}\\n\\n\\t:global(.dark .response-prose h1),\\n\\t:global(.dark .response-prose h2),\\n\\t:global(.dark .response-prose h3),\\n\\t:global(.dark .response-prose h4),\\n\\t:global(.dark .response-prose h5),\\n\\t:global(.dark .response-prose h6) {\\n\\t\\tcolor: #f9fafb;\\n\\t}\\n\\n\\t:global(.response-prose code) {\\n\\t\\tbackground-color: #f3f4f6;\\n\\t\\tcolor: #dc2626;\\n\\t\\tpadding: 0.125rem 0.375rem;\\n\\t\\tborder-radius: 0.375rem;\\n\\t\\tfont-size: 0.875rem;\\n\\t\\tfont-weight: 500;\\n\\t}\\n\\n\\t:global(.dark .response-prose code) {\\n\\t\\tbackground-color: #374151;\\n\\t\\tcolor: #fca5a5;\\n\\t}\\n\\n\\t:global(.response-prose pre) {\\n\\t\\tbackground-color: #1f2937;\\n\\t\\tborder: 1px solid #374151;\\n\\t\\tborder-radius: 0.5rem;\\n\\t\\tpadding: 1rem;\\n\\t\\toverflow-x: auto;\\n\\t\\tmargin: 1rem 0;\\n\\t}\\n\\n\\t:global(.response-prose pre code) {\\n\\t\\tbackground-color: transparent;\\n\\t\\tcolor: #e5e7eb;\\n\\t\\tpadding: 0;\\n\\t\\tborder-radius: 0;\\n\\t\\tfont-size: 0.875rem;\\n\\t\\tfont-weight: 400;\\n\\t}\\n\\n\\t:global(.response-prose blockquote) {\\n\\t\\tborder-left: 4px solid #3b82f6;\\n\\t\\tbackground-color: #eff6ff;\\n\\t\\tmargin: 1.5rem 0;\\n\\t\\tpadding: 1rem 1.5rem;\\n\\t\\tborder-radius: 0.5rem;\\n\\t}\\n\\n\\t:global(.dark .response-prose blockquote) {\\n\\t\\tborder-left-color: #60a5fa;\\n\\t\\tbackground-color: #1e3a8a;\\n\\t}\\n\\n\\t/* 动画效果 */\\n\\t.thinking-header:hover {\\n\\t\\ttransform: translateY(-1px);\\n\\t\\tbox-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);\\n\\t}\\n\\n\\t:global(.dark) .thinking-header:hover {\\n\\t\\tbox-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);\\n\\t}\\n\\n\\t/* 响应式设计 */\\n\\t@media (max-width: 640px) {\\n\\t\\t:global(.thinking-prose),\\n\\t\\t:global(.response-prose) {\\n\\t\\t\\tfont-size: 0.875rem;\\n\\t\\t}\\n\\t\\t\\n\\t\\t.thinking-header {\\n\\t\\t\\tpadding: 0.75rem;\\n\\t\\t}\\n\\t\\t\\n\\t\\t.thinking-content .p-4 {\\n\\t\\t\\tpadding: 0.75rem;\\n\\t\\t}\\n\\t}\\n</style>\\n"],"names":[],"mappings":"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"}`
};
const AIResponse = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let hasThinking;
  let renderedResponse;
  let { content } = $$props;
  let { isStreaming = false } = $$props;
  let thinkingContent = "";
  let responseContent = "";
  function parseAIResponse(text) {
    const thinkingRegex = /(?:<thinking>([\s\S]*?)<\/thinking>|【思考】([\s\S]*?)【\/思考】)/gi;
    const matches = [...text.matchAll(thinkingRegex)];
    if (matches.length > 0) {
      thinkingContent = matches.map((match) => match[1] || match[2]).join("\n\n").trim();
      responseContent = text.replace(thinkingRegex, "").trim();
    } else {
      thinkingContent = "";
      responseContent = text;
    }
  }
  if ($$props.content === void 0 && $$bindings.content && content !== void 0) $$bindings.content(content);
  if ($$props.isStreaming === void 0 && $$bindings.isStreaming && isStreaming !== void 0) $$bindings.isStreaming(isStreaming);
  $$result.css.add(css$1);
  {
    parseAIResponse(content);
  }
  hasThinking = thinkingContent.length > 0;
  hasThinking ? renderMarkdown(thinkingContent) : "";
  renderedResponse = renderMarkdown(responseContent);
  return `<div class="ai-response"> ${hasThinking ? `<div class="thinking-section mb-4 svelte-1jlyhx"> <button class="thinking-header w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-t-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors svelte-1jlyhx"><div class="flex items-center space-x-2"><svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg> <span class="text-sm font-medium text-gray-600 dark:text-gray-300" data-svelte-h="svelte-509vli">AI思考过程</span> <span class="text-xs text-gray-400 dark:text-gray-500 bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded-full">${escape("点击展开")}</span></div> <svg class="${"w-4 h-4 text-gray-400 transition-transform duration-200 " + escape("", true)}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></button>  ${``}</div>` : ``}  <div class="response-section"><div class="prose prose-gray dark:prose-invert max-w-none response-prose"><!-- HTML_TAG_START -->${renderedResponse}<!-- HTML_TAG_END --> ${isStreaming ? `<span class="inline-block w-2 h-5 bg-blue-500 animate-pulse ml-1 rounded-sm"></span>` : ``}</div></div> </div>`;
});
const css = {
  code: ".container.svelte-1lehx3z{min-height:100vh;background:linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)}.dark .container.svelte-1lehx3z{background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%)}",
  map: '{"version":3,"file":"+page.svelte","sources":["+page.svelte"],"sourcesContent":["<script lang=\\"ts\\">import AIResponse from \\"$lib/components/Chat/AIResponse.svelte\\";\\nconst sampleResponse = `<thinking>\\n\\\\u7528\\\\u6237\\\\u8BE2\\\\u95EE\\\\u5982\\\\u4F55\\\\u4F18\\\\u5316\\\\u7F51\\\\u7AD9\\\\u6027\\\\u80FD\\\\uFF0C\\\\u8FD9\\\\u662F\\\\u4E00\\\\u4E2A\\\\u5F88\\\\u5E38\\\\u89C1\\\\u7684\\\\u95EE\\\\u9898\\\\u3002\\\\u6211\\\\u9700\\\\u8981\\\\u4ECE\\\\u591A\\\\u4E2A\\\\u89D2\\\\u5EA6\\\\u6765\\\\u56DE\\\\u7B54\\\\uFF1A\\n\\n1. \\\\u524D\\\\u7AEF\\\\u4F18\\\\u5316 - \\\\u4EE3\\\\u7801\\\\u5206\\\\u5272\\\\u3001\\\\u61D2\\\\u52A0\\\\u8F7D\\\\u3001\\\\u56FE\\\\u7247\\\\u4F18\\\\u5316\\\\u7B49\\n2. \\\\u540E\\\\u7AEF\\\\u4F18\\\\u5316 - \\\\u7F13\\\\u5B58\\\\u3001\\\\u6570\\\\u636E\\\\u5E93\\\\u4F18\\\\u5316\\\\u3001CDN\\\\u7B49  \\n3. \\\\u7F51\\\\u7EDC\\\\u4F18\\\\u5316 - HTTP/2\\\\u3001\\\\u538B\\\\u7F29\\\\u7B49\\n4. \\\\u76D1\\\\u63A7\\\\u548C\\\\u6D4B\\\\u91CF - \\\\u6027\\\\u80FD\\\\u6307\\\\u6807\\\\u3001\\\\u5DE5\\\\u5177\\\\u7B49\\n\\n\\\\u6211\\\\u5E94\\\\u8BE5\\\\u63D0\\\\u4F9B\\\\u5177\\\\u4F53\\\\u53EF\\\\u884C\\\\u7684\\\\u5EFA\\\\u8BAE\\\\uFF0C\\\\u800C\\\\u4E0D\\\\u662F\\\\u6CDB\\\\u6CDB\\\\u800C\\\\u8C08\\\\u3002\\n</thinking>\\n\\n# \\\\u7F51\\\\u7AD9\\\\u6027\\\\u80FD\\\\u4F18\\\\u5316\\\\u6307\\\\u5357\\n\\n\\\\u7F51\\\\u7AD9\\\\u6027\\\\u80FD\\\\u4F18\\\\u5316\\\\u662F\\\\u4E00\\\\u4E2A\\\\u7CFB\\\\u7EDF\\\\u6027\\\\u5DE5\\\\u7A0B\\\\uFF0C\\\\u9700\\\\u8981\\\\u4ECE\\\\u591A\\\\u4E2A\\\\u7EF4\\\\u5EA6\\\\u8FDB\\\\u884C\\\\u8003\\\\u8651\\\\u3002\\\\u4EE5\\\\u4E0B\\\\u662F\\\\u4E00\\\\u4E9B\\\\u5173\\\\u952E\\\\u7684\\\\u4F18\\\\u5316\\\\u7B56\\\\u7565\\\\uFF1A\\n\\n## \\\\u{1F680} \\\\u524D\\\\u7AEF\\\\u4F18\\\\u5316\\n\\n### \\\\u4EE3\\\\u7801\\\\u4F18\\\\u5316\\n- **\\\\u4EE3\\\\u7801\\\\u5206\\\\u5272**\\\\uFF1A\\\\u4F7F\\\\u7528\\\\u52A8\\\\u6001\\\\u5BFC\\\\u5165(dynamic imports)\\\\u6309\\\\u9700\\\\u52A0\\\\u8F7D\\\\u4EE3\\\\u7801\\n- **Tree Shaking**\\\\uFF1A\\\\u79FB\\\\u9664\\\\u672A\\\\u4F7F\\\\u7528\\\\u7684\\\\u4EE3\\\\u7801\\n- **\\\\u538B\\\\u7F29\\\\u6DF7\\\\u6DC6**\\\\uFF1A\\\\u4F7F\\\\u7528\\\\u5DE5\\\\u5177\\\\u5982Terser\\\\u538B\\\\u7F29JavaScript\\\\u4EE3\\\\u7801\\n\\n### \\\\u8D44\\\\u6E90\\\\u4F18\\\\u5316\\n- **\\\\u56FE\\\\u7247\\\\u4F18\\\\u5316**\\\\uFF1A\\n  - \\\\u4F7F\\\\u7528\\\\u73B0\\\\u4EE3\\\\u683C\\\\u5F0F\\\\u5982WebP\\\\u3001AVIF\\n  - \\\\u5B9E\\\\u73B0\\\\u54CD\\\\u5E94\\\\u5F0F\\\\u56FE\\\\u7247\\n  - \\\\u6DFB\\\\u52A0\\\\u61D2\\\\u52A0\\\\u8F7D\\n- **\\\\u5B57\\\\u4F53\\\\u4F18\\\\u5316**\\\\uFF1A\\\\u4F7F\\\\u7528font-display: swap\\\\uFF0C\\\\u9884\\\\u52A0\\\\u8F7D\\\\u5173\\\\u952E\\\\u5B57\\\\u4F53\\n\\n## \\\\u26A1 \\\\u540E\\\\u7AEF\\\\u4F18\\\\u5316\\n\\n### \\\\u7F13\\\\u5B58\\\\u7B56\\\\u7565\\n- **\\\\u6D4F\\\\u89C8\\\\u5668\\\\u7F13\\\\u5B58**\\\\uFF1A\\\\u8BBE\\\\u7F6E\\\\u5408\\\\u9002\\\\u7684Cache-Control\\\\u5934\\n- **CDN\\\\u7F13\\\\u5B58**\\\\uFF1A\\\\u4F7F\\\\u7528\\\\u5185\\\\u5BB9\\\\u5206\\\\u53D1\\\\u7F51\\\\u7EDC\\n- **\\\\u670D\\\\u52A1\\\\u5668\\\\u7F13\\\\u5B58**\\\\uFF1ARedis\\\\u3001Memcached\\\\u7B49\\n\\n### \\\\u6570\\\\u636E\\\\u5E93\\\\u4F18\\\\u5316\\n- \\\\u6DFB\\\\u52A0\\\\u9002\\\\u5F53\\\\u7684\\\\u7D22\\\\u5F15\\n- \\\\u4F18\\\\u5316\\\\u67E5\\\\u8BE2\\\\u8BED\\\\u53E5\\n- \\\\u4F7F\\\\u7528\\\\u8FDE\\\\u63A5\\\\u6C60\\n\\n## \\\\u{1F4CA} \\\\u6027\\\\u80FD\\\\u76D1\\\\u63A7\\n\\n\\\\u4F7F\\\\u7528\\\\u5DE5\\\\u5177\\\\u5982\\\\uFF1A\\n- **Lighthouse**\\\\uFF1A\\\\u7EFC\\\\u5408\\\\u6027\\\\u80FD\\\\u8BC4\\\\u4F30\\n- **WebPageTest**\\\\uFF1A\\\\u8BE6\\\\u7EC6\\\\u7684\\\\u6027\\\\u80FD\\\\u5206\\\\u6790\\n- **Core Web Vitals**\\\\uFF1A\\\\u5173\\\\u6CE8\\\\u7528\\\\u6237\\\\u4F53\\\\u9A8C\\\\u6307\\\\u6807\\n\\n> \\\\u{1F4A1} **\\\\u63D0\\\\u793A**\\\\uFF1A\\\\u6027\\\\u80FD\\\\u4F18\\\\u5316\\\\u662F\\\\u4E00\\\\u4E2A\\\\u6301\\\\u7EED\\\\u7684\\\\u8FC7\\\\u7A0B\\\\uFF0C\\\\u9700\\\\u8981\\\\u5B9A\\\\u671F\\\\u76D1\\\\u63A7\\\\u548C\\\\u8C03\\\\u6574\\\\u3002\\n\\n\\\\u8BB0\\\\u4F4F\\\\uFF0C**\\\\u6D4B\\\\u91CF\\\\u6BD4\\\\u731C\\\\u6D4B\\\\u66F4\\\\u91CD\\\\u8981**\\\\uFF01`;\\nconst sampleResponse2 = `\\\\u3010\\\\u601D\\\\u8003\\\\u3011\\n\\\\u8FD9\\\\u4E2A\\\\u95EE\\\\u9898\\\\u6D89\\\\u53CA\\\\u5230React\\\\u7684\\\\u72B6\\\\u6001\\\\u7BA1\\\\u7406\\\\u3002\\\\u7528\\\\u6237\\\\u53EF\\\\u80FD\\\\u662F\\\\u521D\\\\u5B66\\\\u8005\\\\uFF0C\\\\u6211\\\\u9700\\\\u8981\\\\u89E3\\\\u91CA\\\\u6E05\\\\u695AuseState\\\\u7684\\\\u5DE5\\\\u4F5C\\\\u539F\\\\u7406\\\\uFF0C\\\\u5305\\\\u62EC\\\\uFF1A\\n\\n1. \\\\u72B6\\\\u6001\\\\u7684\\\\u5F02\\\\u6B65\\\\u66F4\\\\u65B0\\\\u7279\\\\u6027\\n2. \\\\u51FD\\\\u6570\\\\u5F0F\\\\u66F4\\\\u65B0\\\\u7684\\\\u6982\\\\u5FF5\\n3. \\\\u4E3A\\\\u4EC0\\\\u4E48\\\\u76F4\\\\u63A5\\\\u4FEE\\\\u6539\\\\u72B6\\\\u6001\\\\u4E0D\\\\u4F1A\\\\u89E6\\\\u53D1\\\\u91CD\\\\u65B0\\\\u6E32\\\\u67D3\\n4. \\\\u63D0\\\\u4F9B\\\\u5177\\\\u4F53\\\\u7684\\\\u4EE3\\\\u7801\\\\u793A\\\\u4F8B\\n\\n\\\\u6211\\\\u5E94\\\\u8BE5\\\\u7528\\\\u7B80\\\\u5355\\\\u6613\\\\u61C2\\\\u7684\\\\u8BED\\\\u8A00\\\\u6765\\\\u89E3\\\\u91CA\\\\u8FD9\\\\u4E9B\\\\u6982\\\\u5FF5\\\\u3002\\n\\\\u3010/\\\\u601D\\\\u8003\\\\u3011\\n\\n# React useState \\\\u8BE6\\\\u89E3\\n\\n\\\\`useState\\\\` \\\\u662FReact\\\\u4E2D\\\\u6700\\\\u57FA\\\\u7840\\\\u4E5F\\\\u662F\\\\u6700\\\\u91CD\\\\u8981\\\\u7684Hook\\\\u4E4B\\\\u4E00\\\\u3002\\\\u8BA9\\\\u6211\\\\u6765\\\\u8BE6\\\\u7EC6\\\\u89E3\\\\u91CA\\\\u5B83\\\\u7684\\\\u5DE5\\\\u4F5C\\\\u539F\\\\u7406\\\\u3002\\n\\n## \\\\u57FA\\\\u672C\\\\u7528\\\\u6CD5\\n\\n\\\\`\\\\`\\\\`javascript\\nimport React, { useState } from \'react\';\\n\\nfunction Counter() {\\n  const [count, setCount] = useState(0);\\n  \\n  return (\\n    <div>\\n      <p>\\\\u5F53\\\\u524D\\\\u8BA1\\\\u6570: {count}</p>\\n      <button onClick={() => setCount(count + 1)}>\\n        \\\\u589E\\\\u52A0\\n      </button>\\n    </div>\\n  );\\n}\\n\\\\`\\\\`\\\\`\\n\\n## \\\\u{1F511} \\\\u5173\\\\u952E\\\\u6982\\\\u5FF5\\n\\n### 1. \\\\u72B6\\\\u6001\\\\u662F\\\\u5F02\\\\u6B65\\\\u66F4\\\\u65B0\\\\u7684\\nReact\\\\u4F1A\\\\u6279\\\\u91CF\\\\u5904\\\\u7406\\\\u72B6\\\\u6001\\\\u66F4\\\\u65B0\\\\uFF0C\\\\u8FD9\\\\u610F\\\\u5473\\\\u7740\\\\u72B6\\\\u6001\\\\u4E0D\\\\u4F1A\\\\u7ACB\\\\u5373\\\\u6539\\\\u53D8\\\\uFF1A\\n\\n\\\\`\\\\`\\\\`javascript\\nfunction handleClick() {\\n  setCount(count + 1);\\n  console.log(count); // \\\\u8FD9\\\\u91CC\\\\u6253\\\\u5370\\\\u7684\\\\u4ECD\\\\u7136\\\\u662F\\\\u65E7\\\\u503C\\\\uFF01\\n}\\n\\\\`\\\\`\\\\`\\n\\n### 2. \\\\u51FD\\\\u6570\\\\u5F0F\\\\u66F4\\\\u65B0\\n\\\\u5F53\\\\u65B0\\\\u72B6\\\\u6001\\\\u4F9D\\\\u8D56\\\\u4E8E\\\\u524D\\\\u4E00\\\\u4E2A\\\\u72B6\\\\u6001\\\\u65F6\\\\uFF0C\\\\u4F7F\\\\u7528\\\\u51FD\\\\u6570\\\\u5F0F\\\\u66F4\\\\u65B0\\\\u66F4\\\\u5B89\\\\u5168\\\\uFF1A\\n\\n\\\\`\\\\`\\\\`javascript\\n// \\\\u2705 \\\\u63A8\\\\u8350\\nsetCount(prevCount => prevCount + 1);\\n\\n// \\\\u274C \\\\u53EF\\\\u80FD\\\\u6709\\\\u95EE\\\\u9898\\nsetCount(count + 1);\\n\\\\`\\\\`\\\\`\\n\\n### 3. \\\\u5BF9\\\\u8C61\\\\u548C\\\\u6570\\\\u7EC4\\\\u7684\\\\u66F4\\\\u65B0\\n\\\\u72B6\\\\u6001\\\\u662F\\\\u4E0D\\\\u53EF\\\\u53D8\\\\u7684\\\\uFF0C\\\\u5FC5\\\\u987B\\\\u521B\\\\u5EFA\\\\u65B0\\\\u7684\\\\u5BF9\\\\u8C61\\\\u6216\\\\u6570\\\\u7EC4\\\\uFF1A\\n\\n\\\\`\\\\`\\\\`javascript\\n// \\\\u5BF9\\\\u8C61\\\\u66F4\\\\u65B0\\nsetUser(prevUser => ({\\n  ...prevUser,\\n  name: \'New Name\'\\n}));\\n\\n// \\\\u6570\\\\u7EC4\\\\u66F4\\\\u65B0\\nsetItems(prevItems => [...prevItems, newItem]);\\n\\\\`\\\\`\\\\`\\n\\n## \\\\u26A0\\\\uFE0F \\\\u5E38\\\\u89C1\\\\u9677\\\\u9631\\n\\n1. **\\\\u76F4\\\\u63A5\\\\u4FEE\\\\u6539\\\\u72B6\\\\u6001**\\\\uFF1A\\\\u6C38\\\\u8FDC\\\\u4E0D\\\\u8981\\\\u76F4\\\\u63A5\\\\u4FEE\\\\u6539\\\\u72B6\\\\u6001\\\\u5BF9\\\\u8C61\\n2. **\\\\u5728\\\\u5FAA\\\\u73AF\\\\u4E2D\\\\u591A\\\\u6B21\\\\u8C03\\\\u7528setState**\\\\uFF1A\\\\u53EF\\\\u80FD\\\\u5BFC\\\\u81F4\\\\u610F\\\\u5916\\\\u7684\\\\u7ED3\\\\u679C\\n3. **\\\\u5FD8\\\\u8BB0\\\\u72B6\\\\u6001\\\\u66F4\\\\u65B0\\\\u662F\\\\u5F02\\\\u6B65\\\\u7684**\\\\uFF1A\\\\u4E0D\\\\u8981\\\\u671F\\\\u671B\\\\u72B6\\\\u6001\\\\u7ACB\\\\u5373\\\\u6539\\\\u53D8\\n\\n\\\\u5E0C\\\\u671B\\\\u8FD9\\\\u4E2A\\\\u89E3\\\\u91CA\\\\u5BF9\\\\u4F60\\\\u6709\\\\u5E2E\\\\u52A9\\\\uFF01`;\\n<\/script>\\n\\n<div class=\\"container mx-auto p-8 max-w-4xl\\">\\n\\t<h1 class=\\"text-3xl font-bold mb-8 text-gray-900 dark:text-white\\">\\n\\t\\tAI回答样式演示\\n\\t</h1>\\n\\t\\n\\t<div class=\\"space-y-8\\">\\n\\t\\t<div class=\\"bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700\\">\\n\\t\\t\\t<h2 class=\\"text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200\\">\\n\\t\\t\\t\\t示例1：使用 &lt;thinking&gt; 标签\\n\\t\\t\\t</h2>\\n\\t\\t\\t<div class=\\"bg-gray-50 dark:bg-gray-700 rounded-lg p-4\\">\\n\\t\\t\\t\\t<AIResponse content={sampleResponse} />\\n\\t\\t\\t</div>\\n\\t\\t</div>\\n\\n\\t\\t<div class=\\"bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700\\">\\n\\t\\t\\t<h2 class=\\"text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200\\">\\n\\t\\t\\t\\t示例2：使用【思考】标签\\n\\t\\t\\t</h2>\\n\\t\\t\\t<div class=\\"bg-gray-50 dark:bg-gray-700 rounded-lg p-4\\">\\n\\t\\t\\t\\t<AIResponse content={sampleResponse2} />\\n\\t\\t\\t</div>\\n\\t\\t</div>\\n\\n\\t\\t<div class=\\"bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700\\">\\n\\t\\t\\t<h2 class=\\"text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200\\">\\n\\t\\t\\t\\t示例3：流式输入效果\\n\\t\\t\\t</h2>\\n\\t\\t\\t<div class=\\"bg-gray-50 dark:bg-gray-700 rounded-lg p-4\\">\\n\\t\\t\\t\\t<AIResponse content=\\"这是一个正在输入的AI回答...\\" isStreaming={true} />\\n\\t\\t\\t</div>\\n\\t\\t</div>\\n\\t</div>\\n\\n\\t<div class=\\"mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800\\">\\n\\t\\t<h3 class=\\"text-lg font-semibold mb-3 text-blue-800 dark:text-blue-200\\">\\n\\t\\t\\t💡 使用说明\\n\\t\\t</h3>\\n\\t\\t<div class=\\"text-sm text-blue-700 dark:text-blue-300 space-y-2\\">\\n\\t\\t\\t<p><strong>思考标记支持：</strong></p>\\n\\t\\t\\t<ul class=\\"list-disc list-inside space-y-1 ml-4\\">\\n\\t\\t\\t\\t<li><code>&lt;thinking&gt;...&lt;/thinking&gt;</code> - XML风格标记</li>\\n\\t\\t\\t\\t<li><code>【思考】...【/思考】</code> - 中文标记</li>\\n\\t\\t\\t</ul>\\n\\t\\t\\t<p class=\\"mt-3\\"><strong>功能特性：</strong></p>\\n\\t\\t\\t<ul class=\\"list-disc list-inside space-y-1 ml-4\\">\\n\\t\\t\\t\\t<li>思考部分默认折叠，点击可展开</li>\\n\\t\\t\\t\\t<li>思考内容使用斜体和灰色显示</li>\\n\\t\\t\\t\\t<li>正式回答使用正常样式</li>\\n\\t\\t\\t\\t<li>支持Markdown渲染</li>\\n\\t\\t\\t\\t<li>支持流式输入效果</li>\\n\\t\\t\\t</ul>\\n\\t\\t</div>\\n\\t</div>\\n</div>\\n\\n<style>\\n\\t.container {\\n\\t\\tmin-height: 100vh;\\n\\t\\tbackground: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);\\n\\t}\\n\\t\\n\\t:global(.dark) .container {\\n\\t\\tbackground: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AA6LC,yBAAW,CACV,UAAU,CAAE,KAAK,CACjB,UAAU,CAAE,gBAAgB,MAAM,CAAC,CAAC,OAAO,CAAC,EAAE,CAAC,CAAC,OAAO,CAAC,IAAI,CAC7D,CAEQ,KAAM,CAAC,yBAAW,CACzB,UAAU,CAAE,gBAAgB,MAAM,CAAC,CAAC,OAAO,CAAC,EAAE,CAAC,CAAC,OAAO,CAAC,IAAI,CAC7D"}'
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  const sampleResponse = `<thinking>
用户询问如何优化网站性能，这是一个很常见的问题。我需要从多个角度来回答：

1. 前端优化 - 代码分割、懒加载、图片优化等
2. 后端优化 - 缓存、数据库优化、CDN等  
3. 网络优化 - HTTP/2、压缩等
4. 监控和测量 - 性能指标、工具等

我应该提供具体可行的建议，而不是泛泛而谈。
</thinking>

# 网站性能优化指南

网站性能优化是一个系统性工程，需要从多个维度进行考虑。以下是一些关键的优化策略：

## 🚀 前端优化

### 代码优化
- **代码分割**：使用动态导入(dynamic imports)按需加载代码
- **Tree Shaking**：移除未使用的代码
- **压缩混淆**：使用工具如Terser压缩JavaScript代码

### 资源优化
- **图片优化**：
  - 使用现代格式如WebP、AVIF
  - 实现响应式图片
  - 添加懒加载
- **字体优化**：使用font-display: swap，预加载关键字体

## ⚡ 后端优化

### 缓存策略
- **浏览器缓存**：设置合适的Cache-Control头
- **CDN缓存**：使用内容分发网络
- **服务器缓存**：Redis、Memcached等

### 数据库优化
- 添加适当的索引
- 优化查询语句
- 使用连接池

## 📊 性能监控

使用工具如：
- **Lighthouse**：综合性能评估
- **WebPageTest**：详细的性能分析
- **Core Web Vitals**：关注用户体验指标

> 💡 **提示**：性能优化是一个持续的过程，需要定期监控和调整。

记住，**测量比猜测更重要**！`;
  const sampleResponse2 = `【思考】
这个问题涉及到React的状态管理。用户可能是初学者，我需要解释清楚useState的工作原理，包括：

1. 状态的异步更新特性
2. 函数式更新的概念
3. 为什么直接修改状态不会触发重新渲染
4. 提供具体的代码示例

我应该用简单易懂的语言来解释这些概念。
【/思考】

# React useState 详解

\`useState\` 是React中最基础也是最重要的Hook之一。让我来详细解释它的工作原理。

## 基本用法

\`\`\`javascript
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>当前计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        增加
      </button>
    </div>
  );
}
\`\`\`

## 🔑 关键概念

### 1. 状态是异步更新的
React会批量处理状态更新，这意味着状态不会立即改变：

\`\`\`javascript
function handleClick() {
  setCount(count + 1);
  console.log(count); // 这里打印的仍然是旧值！
}
\`\`\`

### 2. 函数式更新
当新状态依赖于前一个状态时，使用函数式更新更安全：

\`\`\`javascript
// ✅ 推荐
setCount(prevCount => prevCount + 1);

// ❌ 可能有问题
setCount(count + 1);
\`\`\`

### 3. 对象和数组的更新
状态是不可变的，必须创建新的对象或数组：

\`\`\`javascript
// 对象更新
setUser(prevUser => ({
  ...prevUser,
  name: 'New Name'
}));

// 数组更新
setItems(prevItems => [...prevItems, newItem]);
\`\`\`

## ⚠️ 常见陷阱

1. **直接修改状态**：永远不要直接修改状态对象
2. **在循环中多次调用setState**：可能导致意外的结果
3. **忘记状态更新是异步的**：不要期望状态立即改变

希望这个解释对你有帮助！`;
  $$result.css.add(css);
  return `<div class="container mx-auto p-8 max-w-4xl svelte-1lehx3z"><h1 class="text-3xl font-bold mb-8 text-gray-900 dark:text-white" data-svelte-h="svelte-1tslsoy">AI回答样式演示</h1> <div class="space-y-8"><div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700"><h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200" data-svelte-h="svelte-vwawco">示例1：使用 &lt;thinking&gt; 标签</h2> <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">${validate_component(AIResponse, "AIResponse").$$render($$result, { content: sampleResponse }, {}, {})}</div></div> <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700"><h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200" data-svelte-h="svelte-1o6bp01">示例2：使用【思考】标签</h2> <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">${validate_component(AIResponse, "AIResponse").$$render($$result, { content: sampleResponse2 }, {}, {})}</div></div> <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700"><h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200" data-svelte-h="svelte-1gv83wd">示例3：流式输入效果</h2> <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">${validate_component(AIResponse, "AIResponse").$$render(
    $$result,
    {
      content: "这是一个正在输入的AI回答...",
      isStreaming: true
    },
    {},
    {}
  )}</div></div></div> <div class="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800" data-svelte-h="svelte-1hu7eyb"><h3 class="text-lg font-semibold mb-3 text-blue-800 dark:text-blue-200">💡 使用说明</h3> <div class="text-sm text-blue-700 dark:text-blue-300 space-y-2"><p><strong>思考标记支持：</strong></p> <ul class="list-disc list-inside space-y-1 ml-4"><li><code>&lt;thinking&gt;...&lt;/thinking&gt;</code> - XML风格标记</li> <li><code>【思考】...【/思考】</code> - 中文标记</li></ul> <p class="mt-3"><strong>功能特性：</strong></p> <ul class="list-disc list-inside space-y-1 ml-4"><li>思考部分默认折叠，点击可展开</li> <li>思考内容使用斜体和灰色显示</li> <li>正式回答使用正常样式</li> <li>支持Markdown渲染</li> <li>支持流式输入效果</li></ul></div></div> </div>`;
});
export {
  Page as default
};
