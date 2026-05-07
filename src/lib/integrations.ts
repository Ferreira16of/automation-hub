// Catalog of supported integrations (~50). Each defines its credential schema.
export type FieldType = "text" | "password" | "url" | "select";

export interface CredentialField {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  help?: string;
}

export interface Integration {
  id: string;
  name: string;
  category:
    | "AI"
    | "Messaging"
    | "Email"
    | "Database"
    | "Auth"
    | "Payments"
    | "Storage"
    | "Maps"
    | "Weather"
    | "Finance"
    | "Media"
    | "Data"
    | "Dev"
    | "Other"
    | "Core";
  description: string;
  docsUrl?: string;
  fields: CredentialField[];
  // Authorization style hint for HTTP requests built atop this integration
  auth?: "bearer" | "api-key-header" | "query-param" | "basic" | "custom" | "none";
}

const apiKey = (label = "API Key"): CredentialField => ({
  key: "api_key",
  label,
  type: "password",
  required: true,
});

export const INTEGRATIONS: Integration[] = [
  // Core nodes (no credentials)
  { id: "core.http", name: "HTTP Request", category: "Core", description: "Faz requisições HTTP arbitrárias.", fields: [], auth: "none" },
  { id: "core.webhook", name: "Webhook", category: "Core", description: "Recebe chamadas externas para iniciar workflows.", fields: [], auth: "none" },
  { id: "core.schedule", name: "Schedule (Cron)", category: "Core", description: "Dispara em intervalos definidos.", fields: [], auth: "none" },
  { id: "core.code", name: "Code (JS)", category: "Core", description: "Executa JavaScript no contexto do workflow.", fields: [], auth: "none" },
  { id: "core.set", name: "Set / Transform", category: "Core", description: "Modifica e mapeia dados entre nós.", fields: [], auth: "none" },
  { id: "core.if", name: "IF / Branch", category: "Core", description: "Ramifica o fluxo conforme uma condição.", fields: [], auth: "none" },

  // AI
  { id: "openai", name: "OpenAI", category: "AI", description: "GPT-5, GPT-4 e modelos relacionados.", auth: "bearer", docsUrl: "https://platform.openai.com/docs", fields: [apiKey("OpenAI API Key"), { key: "organization", label: "Organization (opcional)", type: "text" }] },
  { id: "anthropic", name: "Anthropic Claude", category: "AI", auth: "api-key-header", description: "Modelos Claude.", docsUrl: "https://docs.anthropic.com", fields: [apiKey("x-api-key")] },
  { id: "google_ai", name: "Google AI Studio (Gemini)", category: "AI", auth: "query-param", description: "Gemini via Google AI Studio.", docsUrl: "https://ai.google.dev", fields: [apiKey()] },
  { id: "groq", name: "Groq", category: "AI", auth: "bearer", description: "LPU inference (Llama, Mixtral).", fields: [apiKey()] },
  { id: "huggingface", name: "Hugging Face", category: "AI", auth: "bearer", description: "Inference API.", fields: [apiKey("HF Token")] },
  { id: "deepseek", name: "DeepSeek", category: "AI", auth: "bearer", description: "Modelos DeepSeek.", fields: [apiKey()] },
  { id: "mistral", name: "Mistral AI", category: "AI", auth: "bearer", description: "Modelos Mistral.", fields: [apiKey()] },
  { id: "together", name: "Together AI", category: "AI", auth: "bearer", description: "Modelos open-source hospedados.", fields: [apiKey()] },

  // Messaging
  { id: "telegram", name: "Telegram Bot", category: "Messaging", auth: "custom", description: "Envia mensagens via bot do Telegram.", fields: [{ key: "bot_token", label: "Bot Token", type: "password", required: true }] },
  { id: "discord", name: "Discord", category: "Messaging", auth: "bearer", description: "Bot ou webhook do Discord.", fields: [{ key: "bot_token", label: "Bot Token", type: "password" }, { key: "webhook_url", label: "Webhook URL (opcional)", type: "url" }] },
  { id: "slack", name: "Slack", category: "Messaging", auth: "bearer", description: "Bot user OAuth token.", fields: [{ key: "bot_token", label: "Bot Token (xoxb-…)", type: "password", required: true }] },
  { id: "twilio", name: "Twilio", category: "Messaging", auth: "basic", description: "SMS, voz e WhatsApp.", fields: [{ key: "account_sid", label: "Account SID", type: "text", required: true }, { key: "auth_token", label: "Auth Token", type: "password", required: true }, { key: "from", label: "Número/Sender", type: "text" }] },

  // Email
  { id: "resend", name: "Resend", category: "Email", auth: "bearer", description: "Envio de e-mails transacionais.", fields: [apiKey()] },
  { id: "sendgrid", name: "SendGrid", category: "Email", auth: "bearer", description: "Envio de e-mails em escala.", fields: [apiKey()] },

  // Auth / Backend
  { id: "clerk", name: "Clerk", category: "Auth", auth: "bearer", description: "Autenticação como serviço.", fields: [{ key: "secret_key", label: "Secret Key", type: "password", required: true }] },
  { id: "supabase", name: "Supabase", category: "Database", auth: "api-key-header", description: "Banco e auth Supabase externos.", fields: [{ key: "url", label: "Project URL", type: "url", required: true }, { key: "service_role_key", label: "Service Role Key", type: "password", required: true }] },
  { id: "firebase", name: "Firebase", category: "Database", auth: "custom", description: "Realtime DB / Firestore.", fields: [{ key: "project_id", label: "Project ID", type: "text", required: true }, { key: "service_account_json", label: "Service Account JSON", type: "password", required: true }] },

  // Payments
  { id: "stripe", name: "Stripe", category: "Payments", auth: "bearer", description: "Pagamentos e billing.", fields: [{ key: "secret_key", label: "Secret Key (sk_…)", type: "password", required: true }] },

  // Storage / Media
  { id: "cloudinary", name: "Cloudinary", category: "Storage", auth: "basic", description: "Hospedagem e transformação de mídia.", fields: [{ key: "cloud_name", label: "Cloud name", type: "text", required: true }, { key: "api_key", label: "API Key", type: "text", required: true }, { key: "api_secret", label: "API Secret", type: "password", required: true }] },
  { id: "unsplash", name: "Unsplash", category: "Media", auth: "api-key-header", description: "Banco de imagens.", fields: [{ key: "access_key", label: "Access Key", type: "password", required: true }] },
  { id: "pexels", name: "Pexels", category: "Media", auth: "api-key-header", description: "Banco de imagens e vídeos.", fields: [apiKey("Authorization")] },

  // Weather / Geo
  { id: "openweather", name: "OpenWeather", category: "Weather", auth: "query-param", description: "Previsão do tempo.", fields: [apiKey()] },
  { id: "weatherstack", name: "Weatherstack", category: "Weather", auth: "query-param", description: "Clima atual e previsão.", fields: [apiKey("access_key")] },
  { id: "ipstack", name: "IPstack", category: "Data", auth: "query-param", description: "Geolocalização por IP.", fields: [apiKey("access_key")] },
  { id: "google_maps", name: "Google Maps", category: "Maps", auth: "query-param", description: "Maps, Places, Directions.", fields: [apiKey()] },
  { id: "mapbox", name: "Mapbox", category: "Maps", auth: "query-param", description: "Mapas e geocoding.", fields: [apiKey("access_token")] },
  { id: "rest_countries", name: "REST Countries", category: "Data", auth: "none", description: "Dados de países (sem chave).", fields: [] },

  // Finance / Travel
  { id: "aviationstack", name: "Aviationstack", category: "Data", auth: "query-param", description: "Voos em tempo real.", fields: [apiKey("access_key")] },
  { id: "marketstack", name: "Marketstack", category: "Finance", auth: "query-param", description: "Cotações de ações.", fields: [apiKey("access_key")] },
  { id: "fixer", name: "Fixer", category: "Finance", auth: "query-param", description: "Câmbio de moedas.", fields: [apiKey("access_key")] },
  { id: "coingecko", name: "CoinGecko", category: "Finance", auth: "none", description: "Cripto (sem chave para uso básico).", fields: [{ key: "api_key", label: "Pro API Key (opcional)", type: "password" }] },
  { id: "polygon", name: "Polygon.io", category: "Finance", auth: "query-param", description: "Mercado financeiro em tempo real.", fields: [apiKey("apiKey")] },
  { id: "alpha_vantage", name: "Alpha Vantage", category: "Finance", auth: "query-param", description: "Cotações e indicadores.", fields: [apiKey("apikey")] },

  // Media / Entertainment
  { id: "tmdb", name: "TMDB", category: "Media", auth: "bearer", description: "Filmes e séries.", fields: [apiKey("v4 Access Token")] },
  { id: "youtube", name: "YouTube Data", category: "Media", auth: "query-param", description: "API de vídeos do YouTube.", fields: [apiKey()] },
  { id: "spotify", name: "Spotify", category: "Media", auth: "bearer", description: "Catálogo musical.", fields: [{ key: "client_id", label: "Client ID", type: "text", required: true }, { key: "client_secret", label: "Client Secret", type: "password", required: true }] },
  { id: "rawg", name: "RAWG", category: "Media", auth: "query-param", description: "Database de games.", fields: [apiKey("key")] },
  { id: "jikan", name: "Jikan (MyAnimeList)", category: "Media", auth: "none", description: "Anime e mangá (sem chave).", fields: [] },
  { id: "pokeapi", name: "PokéAPI", category: "Media", auth: "none", description: "Pokémon (sem chave).", fields: [] },
  { id: "api_football", name: "API-Football", category: "Data", auth: "api-key-header", description: "Estatísticas de futebol.", fields: [apiKey("x-apisports-key")] },
  { id: "google_books", name: "Google Books", category: "Data", auth: "query-param", description: "Catálogo de livros.", fields: [apiKey()] },
  { id: "open_library", name: "Open Library", category: "Data", auth: "none", description: "Livros (sem chave).", fields: [] },

  // Dev
  { id: "github", name: "GitHub", category: "Dev", auth: "bearer", description: "REST API e GraphQL.", fields: [apiKey("Personal Access Token")] },

  // News / Misc
  { id: "newsapi", name: "NewsAPI", category: "Data", auth: "api-key-header", description: "Notícias globais.", fields: [apiKey("X-Api-Key")] },
  { id: "nasa", name: "NASA", category: "Data", auth: "query-param", description: "APIs públicas da NASA.", fields: [apiKey("api_key")] },
  { id: "zenserp", name: "Zenserp", category: "Data", auth: "api-key-header", description: "SERP scraping.", fields: [apiKey("apikey")] },
  { id: "screenshotlayer", name: "Screenshotlayer", category: "Data", auth: "query-param", description: "Captura de telas de URLs.", fields: [apiKey("access_key")] },
  { id: "numverify", name: "Numverify", category: "Data", auth: "query-param", description: "Validação de telefones.", fields: [apiKey("access_key")] },
  { id: "mailboxlayer", name: "Mailboxlayer", category: "Data", auth: "query-param", description: "Validação de e-mails.", fields: [apiKey("access_key")] },
  { id: "jsonplaceholder", name: "JSONPlaceholder", category: "Other", auth: "none", description: "API fake para testes.", fields: [] },
  { id: "advice_slip", name: "Advice Slip", category: "Other", auth: "none", description: "Conselhos aleatórios.", fields: [] },
];

export const CATEGORIES = Array.from(new Set(INTEGRATIONS.map((i) => i.category)));

export function getIntegration(id: string) {
  return INTEGRATIONS.find((i) => i.id === id);
}
