export function getRuntimeConfig() {
  const config = window.__APP_CONFIG__ || {};

  return {
    apiBase: config.apiBase || "/api"
  };
}
