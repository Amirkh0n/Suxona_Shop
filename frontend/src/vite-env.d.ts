/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the SuxonaShop backend API. */
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
