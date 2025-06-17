/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  // 可以添加更多环境变量类型
  readonly VITE_AUTH_STORAGE_KEY: string
  readonly VITE_USER_STORAGE_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}