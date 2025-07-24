
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * Environment variables [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env`. Like [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), this module cannot be imported into client-side code. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * _Unlike_ [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), the values exported from this module are statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * ```ts
 * import { API_KEY } from '$env/static/private';
 * ```
 * 
 * Note that all environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * 
 * ```
 * MY_FEATURE_FLAG=""
 * ```
 * 
 * You can override `.env` values from the command line like so:
 * 
 * ```bash
 * MY_FEATURE_FLAG="enabled" npm run dev
 * ```
 */
declare module '$env/static/private' {
	export const LESSOPEN: string;
	export const LIBRARY_PATH: string;
	export const NV_LIBCUBLAS_VERSION: string;
	export const NV_NVPROF_DEV_PACKAGE: string;
	export const LANGUAGE: string;
	export const NVSHMEM_DIR: string;
	export const NV_CUDA_NSIGHT_COMPUTE_VERSION: string;
	export const npm_config_user_agent: string;
	export const HOSTNAME: string;
	export const GIT_ASKPASS: string;
	export const npm_node_execpath: string;
	export const SHLVL: string;
	export const LD_LIBRARY_PATH: string;
	export const BROWSER: string;
	export const NV_LIBNCCL_PACKAGE_VERSION: string;
	export const npm_config_noproxy: string;
	export const LESS: string;
	export const HOME: string;
	export const CONDA_SHLVL: string;
	export const OLDPWD: string;
	export const NV_CUDNN_PACKAGE_NAME: string;
	export const TERM_PROGRAM_VERSION: string;
	export const NV_LIBCUBLAS_DEV_VERSION: string;
	export const NVM_BIN: string;
	export const VSCODE_IPC_HOOK_CLI: string;
	export const npm_package_json: string;
	export const NVM_INC: string;
	export const PAGER: string;
	export const VSCODE_GIT_ASKPASS_MAIN: string;
	export const VSCODE_GIT_ASKPASS_NODE: string;
	export const npm_config_userconfig: string;
	export const npm_config_local_prefix: string;
	export const NV_LIBNCCL_DEV_PACKAGE_VERSION: string;
	export const PYDEVD_DISABLE_FILE_VALIDATION: string;
	export const BUNDLED_DEBUGPY_PATH: string;
	export const COLORTERM: string;
	export const _CE_M: string;
	export const NV_LIBNPP_PACKAGE: string;
	export const REMOTE_CONTAINERS: string;
	export const COLOR: string;
	export const NV_CUDNN_PACKAGE: string;
	export const CUDA_VERSION: string;
	export const NVM_DIR: string;
	export const DEBUGINFOD_URLS: string;
	export const NV_NVPROF_VERSION: string;
	export const REMOTE_CONTAINERS_IPC: string;
	export const NV_LIBCUBLAS_PACKAGE_NAME: string;
	export const NVIDIA_REQUIRE_CUDA: string;
	export const _: string;
	export const npm_config_prefix: string;
	export const npm_config_npm_version: string;
	export const NV_LIBCUSPARSE_VERSION: string;
	export const NVIDIA_DRIVER_CAPABILITIES: string;
	export const NV_CUDA_LIB_VERSION: string;
	export const NV_LIBNCCL_PACKAGE_NAME: string;
	export const NV_NVML_DEV_VERSION: string;
	export const NV_LIBNPP_DEV_PACKAGE: string;
	export const TERM: string;
	export const npm_config_cache: string;
	export const NV_CUDA_CUDART_VERSION: string;
	export const _CE_CONDA: string;
	export const NV_CUDNN_PACKAGE_DEV: string;
	export const npm_config_node_gyp: string;
	export const PATH: string;
	export const NV_LIBCUBLAS_DEV_PACKAGE_NAME: string;
	export const NV_LIBCUBLAS_PACKAGE: string;
	export const NVARCH: string;
	export const NODE: string;
	export const npm_package_name: string;
	export const NV_LIBNCCL_DEV_PACKAGE_NAME: string;
	export const NV_LIBCUSPARSE_DEV_VERSION: string;
	export const REMOTE_CONTAINERS_SOCKETS: string;
	export const NV_LIBNCCL_PACKAGE: string;
	export const VSCODE_DEBUGPY_ADAPTER_ENDPOINTS: string;
	export const NVIDIA_PRODUCT_NAME: string;
	export const LANG: string;
	export const NV_CUDA_CUDART_DEV_VERSION: string;
	export const LS_COLORS: string;
	export const VSCODE_GIT_IPC_HANDLE: string;
	export const TERM_PROGRAM: string;
	export const npm_lifecycle_script: string;
	export const CONDA_PYTHON_EXE: string;
	export const DEBIAN_FRONTEND: string;
	export const SHELL: string;
	export const NV_LIBCUBLAS_DEV_PACKAGE: string;
	export const npm_package_version: string;
	export const npm_lifecycle_event: string;
	export const NV_CUDA_NSIGHT_COMPUTE_DEV_PACKAGE: string;
	export const NV_LIBNCCL_DEV_PACKAGE: string;
	export const LESSCLOSE: string;
	export const NV_NVTX_VERSION: string;
	export const NV_LIBNPP_VERSION: string;
	export const VSCODE_GIT_ASKPASS_EXTRA_ARGS: string;
	export const GIT_PAGER: string;
	export const NV_CUDNN_VERSION: string;
	export const npm_config_globalconfig: string;
	export const npm_config_init_module: string;
	export const PWD: string;
	export const LC_ALL: string;
	export const CUDA_HOME: string;
	export const npm_execpath: string;
	export const CONDA_EXE: string;
	export const NVM_CD_FLAGS: string;
	export const npm_config_global_prefix: string;
	export const npm_command: string;
	export const NVIDIA_VISIBLE_DEVICES: string;
	export const NCCL_VERSION: string;
	export const GDRCOPY_HOME: string;
	export const NV_LIBNPP_DEV_VERSION: string;
	export const INIT_CWD: string;
	export const EDITOR: string;
	export const NODE_ENV: string;
}

/**
 * Similar to [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private), except that it only includes environment variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Values are replaced statically at build time.
 * 
 * ```ts
 * import { PUBLIC_BASE_URL } from '$env/static/public';
 * ```
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to runtime environment variables, as defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * This module cannot be imported into client-side code.
 * 
 * Dynamic environment variables cannot be used during prerendering.
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * console.log(env.DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 * 
 * > In `dev`, `$env/dynamic` always includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 */
declare module '$env/dynamic/private' {
	export const env: {
		LESSOPEN: string;
		LIBRARY_PATH: string;
		NV_LIBCUBLAS_VERSION: string;
		NV_NVPROF_DEV_PACKAGE: string;
		LANGUAGE: string;
		NVSHMEM_DIR: string;
		NV_CUDA_NSIGHT_COMPUTE_VERSION: string;
		npm_config_user_agent: string;
		HOSTNAME: string;
		GIT_ASKPASS: string;
		npm_node_execpath: string;
		SHLVL: string;
		LD_LIBRARY_PATH: string;
		BROWSER: string;
		NV_LIBNCCL_PACKAGE_VERSION: string;
		npm_config_noproxy: string;
		LESS: string;
		HOME: string;
		CONDA_SHLVL: string;
		OLDPWD: string;
		NV_CUDNN_PACKAGE_NAME: string;
		TERM_PROGRAM_VERSION: string;
		NV_LIBCUBLAS_DEV_VERSION: string;
		NVM_BIN: string;
		VSCODE_IPC_HOOK_CLI: string;
		npm_package_json: string;
		NVM_INC: string;
		PAGER: string;
		VSCODE_GIT_ASKPASS_MAIN: string;
		VSCODE_GIT_ASKPASS_NODE: string;
		npm_config_userconfig: string;
		npm_config_local_prefix: string;
		NV_LIBNCCL_DEV_PACKAGE_VERSION: string;
		PYDEVD_DISABLE_FILE_VALIDATION: string;
		BUNDLED_DEBUGPY_PATH: string;
		COLORTERM: string;
		_CE_M: string;
		NV_LIBNPP_PACKAGE: string;
		REMOTE_CONTAINERS: string;
		COLOR: string;
		NV_CUDNN_PACKAGE: string;
		CUDA_VERSION: string;
		NVM_DIR: string;
		DEBUGINFOD_URLS: string;
		NV_NVPROF_VERSION: string;
		REMOTE_CONTAINERS_IPC: string;
		NV_LIBCUBLAS_PACKAGE_NAME: string;
		NVIDIA_REQUIRE_CUDA: string;
		_: string;
		npm_config_prefix: string;
		npm_config_npm_version: string;
		NV_LIBCUSPARSE_VERSION: string;
		NVIDIA_DRIVER_CAPABILITIES: string;
		NV_CUDA_LIB_VERSION: string;
		NV_LIBNCCL_PACKAGE_NAME: string;
		NV_NVML_DEV_VERSION: string;
		NV_LIBNPP_DEV_PACKAGE: string;
		TERM: string;
		npm_config_cache: string;
		NV_CUDA_CUDART_VERSION: string;
		_CE_CONDA: string;
		NV_CUDNN_PACKAGE_DEV: string;
		npm_config_node_gyp: string;
		PATH: string;
		NV_LIBCUBLAS_DEV_PACKAGE_NAME: string;
		NV_LIBCUBLAS_PACKAGE: string;
		NVARCH: string;
		NODE: string;
		npm_package_name: string;
		NV_LIBNCCL_DEV_PACKAGE_NAME: string;
		NV_LIBCUSPARSE_DEV_VERSION: string;
		REMOTE_CONTAINERS_SOCKETS: string;
		NV_LIBNCCL_PACKAGE: string;
		VSCODE_DEBUGPY_ADAPTER_ENDPOINTS: string;
		NVIDIA_PRODUCT_NAME: string;
		LANG: string;
		NV_CUDA_CUDART_DEV_VERSION: string;
		LS_COLORS: string;
		VSCODE_GIT_IPC_HANDLE: string;
		TERM_PROGRAM: string;
		npm_lifecycle_script: string;
		CONDA_PYTHON_EXE: string;
		DEBIAN_FRONTEND: string;
		SHELL: string;
		NV_LIBCUBLAS_DEV_PACKAGE: string;
		npm_package_version: string;
		npm_lifecycle_event: string;
		NV_CUDA_NSIGHT_COMPUTE_DEV_PACKAGE: string;
		NV_LIBNCCL_DEV_PACKAGE: string;
		LESSCLOSE: string;
		NV_NVTX_VERSION: string;
		NV_LIBNPP_VERSION: string;
		VSCODE_GIT_ASKPASS_EXTRA_ARGS: string;
		GIT_PAGER: string;
		NV_CUDNN_VERSION: string;
		npm_config_globalconfig: string;
		npm_config_init_module: string;
		PWD: string;
		LC_ALL: string;
		CUDA_HOME: string;
		npm_execpath: string;
		CONDA_EXE: string;
		NVM_CD_FLAGS: string;
		npm_config_global_prefix: string;
		npm_command: string;
		NVIDIA_VISIBLE_DEVICES: string;
		NCCL_VERSION: string;
		GDRCOPY_HOME: string;
		NV_LIBNPP_DEV_VERSION: string;
		INIT_CWD: string;
		EDITOR: string;
		NODE_ENV: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * Similar to [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), but only includes variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Note that public dynamic environment variables must all be sent from the server to the client, causing larger network requests — when possible, use `$env/static/public` instead.
 * 
 * Dynamic environment variables cannot be used during prerendering.
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.PUBLIC_DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
