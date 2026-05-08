// Catalog of supported integrations (100+). Each defines its credential schema.
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

export type IntegrationCategory =
  | "Core"
  | "AI"
  | "AI Image"
  | "AI Audio"
  | "AI Video"
  | "Vector DB"
  | "Messaging"
  | "Social"
  | "Email"
  | "Database"
  | "Auth"
  | "Payments"
  | "Storage"
  | "Maps"
  | "Weather"
  | "Finance"
  | "Crypto"
  | "Media"
  | "Productivity"
  | "CRM"
  | "Support"
  | "Marketing"
  | "Analytics"
  | "Monitoring"
  | "DevOps"
  | "Dev"
  | "CMS"
  | "Scraping"
  | "Data"
  | "Translation"
  | "Other";

export interface Integration {
  id: string;
  name: string;
  category: IntegrationCategory;
  description: string;
  docsUrl?: string;
  fields: CredentialField[];
  auth?: "bearer" | "api-key-header" | "query-param" | "basic" | "custom" | "none";
}

const apiKey = (label = "API Key", key = "api_key"): CredentialField => ({
  key, label, type: "password", required: true,
});
const text = (key: string, label: string, required = true): CredentialField => ({
  key, label, type: "text", required,
});
const url = (key: string, label: string, required = true): CredentialField => ({
  key, label, type: "url", required,
});
const pass = (key: string, label: string, required = true): CredentialField => ({
  key, label, type: "password", required,
});

export const INTEGRATIONS: Integration[] = [
  // ───── Core ─────
  { id: "core.http", name: "HTTP Request", category: "Core", description: "Faz requisições HTTP arbitrárias.", fields: [], auth: "none" },
  { id: "core.webhook", name: "Webhook", category: "Core", description: "Recebe chamadas externas para iniciar workflows.", fields: [], auth: "none" },
  { id: "core.schedule", name: "Schedule (Cron)", category: "Core", description: "Dispara em intervalos definidos.", fields: [], auth: "none" },
  { id: "core.code", name: "Code (JS)", category: "Core", description: "Executa JavaScript no contexto do workflow.", fields: [], auth: "none" },
  { id: "core.set", name: "Set / Transform", category: "Core", description: "Modifica e mapeia dados entre nós.", fields: [], auth: "none" },
  { id: "core.if", name: "IF / Branch", category: "Core", description: "Ramifica o fluxo conforme uma condição.", fields: [], auth: "none" },
  { id: "core.delay", name: "Delay", category: "Core", description: "Pausa a execução por X ms.", fields: [], auth: "none" },
  { id: "core.merge", name: "Merge", category: "Core", description: "Junta dois ramos em um.", fields: [], auth: "none" },
  { id: "core.switch", name: "Switch", category: "Core", description: "Roteia entre múltiplos caminhos.", fields: [], auth: "none" },
  { id: "core.loop", name: "Loop / Iterate", category: "Core", description: "Itera sobre um array.", fields: [], auth: "none" },

  // ───── AI / LLM ─────
  { id: "openai", name: "OpenAI", category: "AI", auth: "bearer", description: "GPT-5, GPT-4 e modelos relacionados.", docsUrl: "https://platform.openai.com/docs", fields: [apiKey("OpenAI API Key"), text("organization", "Organization (opcional)", false)] },
  { id: "anthropic", name: "Anthropic Claude", category: "AI", auth: "api-key-header", description: "Modelos Claude.", docsUrl: "https://docs.anthropic.com", fields: [apiKey("x-api-key")] },
  { id: "google_ai", name: "Google AI Studio (Gemini)", category: "AI", auth: "query-param", description: "Gemini via Google AI Studio.", docsUrl: "https://ai.google.dev", fields: [apiKey()] },
  { id: "groq", name: "Groq", category: "AI", auth: "bearer", description: "LPU inference (Llama, Mixtral).", fields: [apiKey()] },
  { id: "huggingface", name: "Hugging Face", category: "AI", auth: "bearer", description: "Inference API.", fields: [apiKey("HF Token")] },
  { id: "deepseek", name: "DeepSeek", category: "AI", auth: "bearer", description: "Modelos DeepSeek.", fields: [apiKey()] },
  { id: "mistral", name: "Mistral AI", category: "AI", auth: "bearer", description: "Modelos Mistral.", fields: [apiKey()] },
  { id: "together", name: "Together AI", category: "AI", auth: "bearer", description: "Modelos open-source hospedados.", fields: [apiKey()] },
  { id: "cohere", name: "Cohere", category: "AI", auth: "bearer", description: "Command, Embed, Rerank.", fields: [apiKey()] },
  { id: "perplexity", name: "Perplexity", category: "AI", auth: "bearer", description: "Sonar com web search.", fields: [apiKey()] },
  { id: "xai", name: "xAI Grok", category: "AI", auth: "bearer", description: "Modelos Grok.", fields: [apiKey()] },
  { id: "cerebras", name: "Cerebras", category: "AI", auth: "bearer", description: "Inference em wafer-scale.", fields: [apiKey()] },
  { id: "fireworks", name: "Fireworks AI", category: "AI", auth: "bearer", description: "LLMs open-source.", fields: [apiKey()] },
  { id: "openrouter", name: "OpenRouter", category: "AI", auth: "bearer", description: "Roteador unificado de LLMs.", fields: [apiKey()] },
  { id: "replicate", name: "Replicate", category: "AI", auth: "bearer", description: "Roda modelos open-source.", fields: [apiKey("Token")] },
  { id: "ollama", name: "Ollama (self-hosted)", category: "AI", auth: "none", description: "LLMs locais.", fields: [url("base_url", "Base URL")] },

  // ───── AI Image ─────
  { id: "stability", name: "Stability AI", category: "AI Image", auth: "bearer", description: "Stable Diffusion 3.", fields: [apiKey()] },
  { id: "leonardo", name: "Leonardo.ai", category: "AI Image", auth: "bearer", description: "Geração de imagens.", fields: [apiKey()] },
  { id: "ideogram", name: "Ideogram", category: "AI Image", auth: "api-key-header", description: "Imagens com tipografia.", fields: [apiKey("Api-Key")] },
  { id: "recraft", name: "Recraft", category: "AI Image", auth: "bearer", description: "Vetores e raster.", fields: [apiKey()] },
  { id: "fal", name: "Fal.ai", category: "AI Image", auth: "bearer", description: "Inference rápida (Flux etc).", fields: [apiKey("Key")] },
  { id: "openai_image", name: "OpenAI Images (DALL·E / gpt-image)", category: "AI Image", auth: "bearer", description: "Geração via OpenAI.", fields: [apiKey()] },
  { id: "luma", name: "Luma Dream Machine", category: "AI Video", auth: "bearer", description: "Vídeos com Luma.", fields: [apiKey()] },
  { id: "runway", name: "Runway", category: "AI Video", auth: "bearer", description: "Gen-3, vídeo IA.", fields: [apiKey()] },
  { id: "pika", name: "Pika", category: "AI Video", auth: "bearer", description: "Vídeo IA.", fields: [apiKey()] },

  // ───── AI Audio ─────
  { id: "elevenlabs", name: "ElevenLabs", category: "AI Audio", auth: "api-key-header", description: "TTS e voice cloning.", fields: [apiKey("xi-api-key")] },
  { id: "openai_tts", name: "OpenAI TTS / Whisper", category: "AI Audio", auth: "bearer", description: "TTS e transcrição.", fields: [apiKey()] },
  { id: "deepgram", name: "Deepgram", category: "AI Audio", auth: "custom", description: "Transcrição em tempo real.", fields: [apiKey("Token")] },
  { id: "assemblyai", name: "AssemblyAI", category: "AI Audio", auth: "api-key-header", description: "Transcrição + análise.", fields: [apiKey("Authorization")] },
  { id: "suno", name: "Suno", category: "AI Audio", auth: "bearer", description: "Geração musical.", fields: [apiKey()] },
  { id: "vapi", name: "Vapi", category: "AI Audio", auth: "bearer", description: "Voice agents.", fields: [apiKey()] },

  // ───── Vector DB ─────
  { id: "pinecone", name: "Pinecone", category: "Vector DB", auth: "api-key-header", description: "Banco vetorial gerenciado.", fields: [apiKey("Api-Key"), url("host", "Index Host")] },
  { id: "weaviate", name: "Weaviate", category: "Vector DB", auth: "bearer", description: "Banco vetorial.", fields: [url("url", "Endpoint"), apiKey()] },
  { id: "qdrant", name: "Qdrant", category: "Vector DB", auth: "api-key-header", description: "Banco vetorial.", fields: [url("url", "Endpoint"), apiKey("api-key")] },
  { id: "chroma", name: "Chroma", category: "Vector DB", auth: "none", description: "Banco vetorial open-source.", fields: [url("url", "Endpoint")] },

  // ───── Messaging / Chat ─────
  { id: "telegram", name: "Telegram Bot", category: "Messaging", auth: "custom", description: "Envia mensagens via bot do Telegram.", fields: [pass("bot_token", "Bot Token")] },
  { id: "discord", name: "Discord", category: "Messaging", auth: "bearer", description: "Bot ou webhook do Discord.", fields: [pass("bot_token", "Bot Token", false), { key: "webhook_url", label: "Webhook URL (opcional)", type: "url" }] },
  { id: "slack", name: "Slack", category: "Messaging", auth: "bearer", description: "Bot user OAuth token.", fields: [pass("bot_token", "Bot Token (xoxb-…)")] },
  { id: "twilio", name: "Twilio", category: "Messaging", auth: "basic", description: "SMS, voz e WhatsApp.", fields: [text("account_sid", "Account SID"), pass("auth_token", "Auth Token"), text("from", "Número/Sender", false)] },
  { id: "whatsapp_cloud", name: "WhatsApp Cloud API", category: "Messaging", auth: "bearer", description: "Meta WhatsApp Business.", fields: [pass("access_token", "Access Token"), text("phone_number_id", "Phone Number ID")] },
  { id: "messagebird", name: "MessageBird", category: "Messaging", auth: "custom", description: "SMS e voz.", fields: [apiKey("AccessKey")] },
  { id: "vonage", name: "Vonage (Nexmo)", category: "Messaging", auth: "basic", description: "SMS, voz, WhatsApp.", fields: [text("api_key", "API Key"), pass("api_secret", "API Secret")] },
  { id: "msteams", name: "Microsoft Teams", category: "Messaging", auth: "custom", description: "Webhook de canal.", fields: [url("webhook_url", "Webhook URL")] },
  { id: "matrix", name: "Matrix", category: "Messaging", auth: "bearer", description: "Mensageria descentralizada.", fields: [url("homeserver", "Homeserver"), pass("access_token", "Access Token")] },
  { id: "rocketchat", name: "Rocket.Chat", category: "Messaging", auth: "custom", description: "Chat self-hosted.", fields: [url("base_url", "Base URL"), text("user_id", "User ID"), pass("auth_token", "Auth Token")] },
  { id: "signal_cli", name: "Signal CLI", category: "Messaging", auth: "custom", description: "Bridge HTTP do signal-cli.", fields: [url("base_url", "Base URL")] },

  // ───── Social ─────
  { id: "twitter", name: "X / Twitter", category: "Social", auth: "bearer", description: "API v2 do X.", fields: [pass("bearer_token", "Bearer Token")] },
  { id: "linkedin", name: "LinkedIn", category: "Social", auth: "bearer", description: "Posts e analytics.", fields: [pass("access_token", "Access Token")] },
  { id: "facebook", name: "Facebook Graph", category: "Social", auth: "bearer", description: "Pages e Insights.", fields: [pass("access_token", "Access Token")] },
  { id: "instagram", name: "Instagram Graph", category: "Social", auth: "bearer", description: "Business / Creator.", fields: [pass("access_token", "Access Token")] },
  { id: "threads", name: "Threads", category: "Social", auth: "bearer", description: "Meta Threads API.", fields: [pass("access_token", "Access Token")] },
  { id: "tiktok", name: "TikTok", category: "Social", auth: "bearer", description: "Content Posting API.", fields: [pass("access_token", "Access Token")] },
  { id: "reddit", name: "Reddit", category: "Social", auth: "basic", description: "OAuth API do Reddit.", fields: [text("client_id", "Client ID"), pass("client_secret", "Client Secret")] },
  { id: "mastodon", name: "Mastodon", category: "Social", auth: "bearer", description: "Fediverso.", fields: [url("instance", "Instance URL"), pass("access_token", "Access Token")] },
  { id: "bluesky", name: "Bluesky", category: "Social", auth: "custom", description: "ATProto.", fields: [text("identifier", "Handle"), pass("app_password", "App Password")] },
  { id: "pinterest", name: "Pinterest", category: "Social", auth: "bearer", description: "Pinterest API.", fields: [pass("access_token", "Access Token")] },

  // ───── Email ─────
  { id: "resend", name: "Resend", category: "Email", auth: "bearer", description: "Envio de e-mails transacionais.", fields: [apiKey()] },
  { id: "sendgrid", name: "SendGrid", category: "Email", auth: "bearer", description: "Envio de e-mails em escala.", fields: [apiKey()] },
  { id: "mailgun", name: "Mailgun", category: "Email", auth: "basic", description: "Envio transacional.", fields: [apiKey(), text("domain", "Domain")] },
  { id: "postmark", name: "Postmark", category: "Email", auth: "api-key-header", description: "Envio transacional.", fields: [apiKey("X-Postmark-Server-Token")] },
  { id: "ses", name: "Amazon SES", category: "Email", auth: "custom", description: "AWS Simple Email Service.", fields: [text("region", "Region"), text("access_key_id", "Access Key ID"), pass("secret_access_key", "Secret Access Key")] },
  { id: "brevo", name: "Brevo (Sendinblue)", category: "Email", auth: "api-key-header", description: "Email + automation.", fields: [apiKey("api-key")] },
  { id: "mailchimp", name: "Mailchimp", category: "Marketing", auth: "basic", description: "Marketing por e-mail.", fields: [apiKey(), text("server_prefix", "Server prefix (us1, eu2…)")] },
  { id: "convertkit", name: "ConvertKit", category: "Marketing", auth: "query-param", description: "Email para creators.", fields: [apiKey()] },
  { id: "klaviyo", name: "Klaviyo", category: "Marketing", auth: "api-key-header", description: "Email + SMS marketing.", fields: [apiKey("Authorization")] },
  { id: "smtp", name: "SMTP (genérico)", category: "Email", auth: "basic", description: "Servidor SMTP custom.", fields: [text("host", "Host"), text("port", "Porta"), text("user", "Usuário"), pass("pass", "Senha")] },

  // ───── Auth / Database ─────
  { id: "clerk", name: "Clerk", category: "Auth", auth: "bearer", description: "Autenticação como serviço.", fields: [pass("secret_key", "Secret Key")] },
  { id: "auth0", name: "Auth0", category: "Auth", auth: "bearer", description: "Identity platform.", fields: [text("domain", "Domain"), text("client_id", "Client ID"), pass("client_secret", "Client Secret")] },
  { id: "supabase", name: "Supabase", category: "Database", auth: "api-key-header", description: "Banco e auth Supabase externos.", fields: [url("url", "Project URL"), pass("service_role_key", "Service Role Key")] },
  { id: "firebase", name: "Firebase", category: "Database", auth: "custom", description: "Realtime DB / Firestore.", fields: [text("project_id", "Project ID"), pass("service_account_json", "Service Account JSON")] },
  { id: "mongodb", name: "MongoDB Atlas Data API", category: "Database", auth: "api-key-header", description: "Acesso HTTP ao MongoDB.", fields: [url("endpoint", "Data API Endpoint"), apiKey("api-key")] },
  { id: "postgrest", name: "PostgREST", category: "Database", auth: "bearer", description: "REST sobre Postgres.", fields: [url("base_url", "Base URL"), pass("jwt", "JWT", false)] },
  { id: "redis_upstash", name: "Upstash Redis", category: "Database", auth: "bearer", description: "Redis HTTP.", fields: [url("url", "REST URL"), pass("token", "REST Token")] },
  { id: "planetscale", name: "PlanetScale", category: "Database", auth: "basic", description: "MySQL serverless.", fields: [text("username", "Username"), pass("password", "Password"), text("database", "Database")] },
  { id: "neon", name: "Neon", category: "Database", auth: "bearer", description: "Postgres serverless.", fields: [pass("api_key", "API Key")] },
  { id: "turso", name: "Turso (libSQL)", category: "Database", auth: "bearer", description: "SQLite distribuído.", fields: [url("url", "Database URL"), pass("auth_token", "Auth Token")] },
  { id: "algolia", name: "Algolia", category: "Database", auth: "api-key-header", description: "Busca como serviço.", fields: [text("app_id", "App ID"), apiKey("X-Algolia-API-Key")] },
  { id: "meilisearch", name: "Meilisearch", category: "Database", auth: "bearer", description: "Busca self-hostable.", fields: [url("host", "Host"), pass("master_key", "Master Key")] },
  { id: "elasticsearch", name: "Elasticsearch", category: "Database", auth: "basic", description: "Search & analytics.", fields: [url("url", "URL"), text("username", "Usuário"), pass("password", "Senha")] },

  // ───── Payments ─────
  { id: "stripe", name: "Stripe", category: "Payments", auth: "bearer", description: "Pagamentos e billing.", fields: [pass("secret_key", "Secret Key (sk_…)")] },
  { id: "paypal", name: "PayPal", category: "Payments", auth: "basic", description: "REST API.", fields: [text("client_id", "Client ID"), pass("client_secret", "Client Secret")] },
  { id: "lemonsqueezy", name: "Lemon Squeezy", category: "Payments", auth: "bearer", description: "Merchant of record.", fields: [apiKey()] },
  { id: "paddle", name: "Paddle", category: "Payments", auth: "bearer", description: "Billing global.", fields: [apiKey()] },
  { id: "polar", name: "Polar.sh", category: "Payments", auth: "bearer", description: "Pagamentos para devs.", fields: [apiKey()] },
  { id: "mercadopago", name: "Mercado Pago", category: "Payments", auth: "bearer", description: "Checkout e PIX.", fields: [pass("access_token", "Access Token")] },
  { id: "asaas", name: "Asaas", category: "Payments", auth: "api-key-header", description: "Pagamentos no Brasil.", fields: [apiKey("access_token")] },
  { id: "pagarme", name: "Pagar.me", category: "Payments", auth: "basic", description: "Pagamentos no Brasil.", fields: [apiKey()] },
  { id: "coinbase_commerce", name: "Coinbase Commerce", category: "Payments", auth: "api-key-header", description: "Pagamentos em cripto.", fields: [apiKey("X-CC-Api-Key")] },
  { id: "btcpay", name: "BTCPay Server", category: "Payments", auth: "api-key-header", description: "Self-hosted Bitcoin.", fields: [url("url", "URL"), apiKey("token")] },

  // ───── Storage / Media ─────
  { id: "cloudinary", name: "Cloudinary", category: "Storage", auth: "basic", description: "Hospedagem e transformação de mídia.", fields: [text("cloud_name", "Cloud name"), text("api_key", "API Key"), pass("api_secret", "API Secret")] },
  { id: "uploadcare", name: "Uploadcare", category: "Storage", auth: "basic", description: "CDN e upload.", fields: [text("public_key", "Public Key"), pass("secret_key", "Secret Key")] },
  { id: "imagekit", name: "ImageKit", category: "Storage", auth: "basic", description: "CDN de mídia.", fields: [text("public_key", "Public Key"), pass("private_key", "Private Key"), text("url_endpoint", "URL Endpoint")] },
  { id: "s3", name: "Amazon S3 / R2", category: "Storage", auth: "custom", description: "S3-compatível.", fields: [url("endpoint", "Endpoint", false), text("region", "Region"), text("access_key_id", "Access Key ID"), pass("secret_access_key", "Secret Access Key"), text("bucket", "Bucket")] },
  { id: "backblaze", name: "Backblaze B2", category: "Storage", auth: "basic", description: "Storage barato.", fields: [text("key_id", "Key ID"), pass("application_key", "Application Key")] },
  { id: "dropbox", name: "Dropbox", category: "Storage", auth: "bearer", description: "Arquivos.", fields: [pass("access_token", "Access Token")] },
  { id: "google_drive", name: "Google Drive", category: "Storage", auth: "bearer", description: "Arquivos no Drive.", fields: [pass("access_token", "OAuth Access Token")] },
  { id: "onedrive", name: "OneDrive", category: "Storage", auth: "bearer", description: "Microsoft Graph Files.", fields: [pass("access_token", "Access Token")] },
  { id: "ipfs_pinata", name: "Pinata (IPFS)", category: "Storage", auth: "bearer", description: "Pinning IPFS.", fields: [pass("jwt", "JWT")] },
  { id: "unsplash", name: "Unsplash", category: "Media", auth: "api-key-header", description: "Banco de imagens.", fields: [pass("access_key", "Access Key")] },
  { id: "pexels", name: "Pexels", category: "Media", auth: "api-key-header", description: "Banco de imagens e vídeos.", fields: [apiKey("Authorization")] },
  { id: "giphy", name: "Giphy", category: "Media", auth: "query-param", description: "GIFs.", fields: [apiKey()] },

  // ───── Maps / Geo ─────
  { id: "google_maps", name: "Google Maps", category: "Maps", auth: "query-param", description: "Maps, Places, Directions.", fields: [apiKey()] },
  { id: "mapbox", name: "Mapbox", category: "Maps", auth: "query-param", description: "Mapas e geocoding.", fields: [apiKey("access_token")] },
  { id: "here", name: "HERE", category: "Maps", auth: "query-param", description: "Geocoding e routing.", fields: [apiKey("apiKey")] },
  { id: "opencage", name: "OpenCage Geocoder", category: "Maps", auth: "query-param", description: "Geocoding.", fields: [apiKey("key")] },
  { id: "geoapify", name: "Geoapify", category: "Maps", auth: "query-param", description: "Routing, geocoding.", fields: [apiKey("apiKey")] },
  { id: "positionstack", name: "PositionStack", category: "Maps", auth: "query-param", description: "Geocoding global.", fields: [apiKey("access_key")] },
  { id: "ipstack", name: "IPstack", category: "Data", auth: "query-param", description: "Geolocalização por IP.", fields: [apiKey("access_key")] },
  { id: "ipinfo", name: "IPinfo", category: "Data", auth: "bearer", description: "IP intelligence.", fields: [pass("token", "Token")] },
  { id: "ipify", name: "IPify", category: "Data", auth: "none", description: "Seu IP público (sem chave).", fields: [] },
  { id: "rest_countries", name: "REST Countries", category: "Data", auth: "none", description: "Dados de países (sem chave).", fields: [] },

  // ───── Weather ─────
  { id: "openweather", name: "OpenWeather", category: "Weather", auth: "query-param", description: "Previsão do tempo.", fields: [apiKey()] },
  { id: "weatherstack", name: "Weatherstack", category: "Weather", auth: "query-param", description: "Clima atual e previsão.", fields: [apiKey("access_key")] },
  { id: "weatherapi", name: "WeatherAPI", category: "Weather", auth: "query-param", description: "Clima global.", fields: [apiKey("key")] },
  { id: "tomorrow", name: "Tomorrow.io", category: "Weather", auth: "query-param", description: "Previsão hiperlocal.", fields: [apiKey("apikey")] },
  { id: "open_meteo", name: "Open-Meteo", category: "Weather", auth: "none", description: "Clima open-source (sem chave).", fields: [] },

  // ───── Finance / Crypto ─────
  { id: "aviationstack", name: "Aviationstack", category: "Data", auth: "query-param", description: "Voos em tempo real.", fields: [apiKey("access_key")] },
  { id: "marketstack", name: "Marketstack", category: "Finance", auth: "query-param", description: "Cotações de ações.", fields: [apiKey("access_key")] },
  { id: "fixer", name: "Fixer", category: "Finance", auth: "query-param", description: "Câmbio de moedas.", fields: [apiKey("access_key")] },
  { id: "currencyapi", name: "CurrencyAPI", category: "Finance", auth: "api-key-header", description: "Câmbio.", fields: [apiKey("apikey")] },
  { id: "exchangerate", name: "ExchangeRate.host", category: "Finance", auth: "query-param", description: "Câmbio livre.", fields: [{ key: "access_key", label: "Access Key (opcional)", type: "password" }] },
  { id: "polygon", name: "Polygon.io", category: "Finance", auth: "query-param", description: "Mercado financeiro em tempo real.", fields: [apiKey("apiKey")] },
  { id: "alpha_vantage", name: "Alpha Vantage", category: "Finance", auth: "query-param", description: "Cotações e indicadores.", fields: [apiKey("apikey")] },
  { id: "finnhub", name: "Finnhub", category: "Finance", auth: "query-param", description: "Stock API.", fields: [apiKey("token")] },
  { id: "twelvedata", name: "Twelve Data", category: "Finance", auth: "query-param", description: "Stocks, forex, cripto.", fields: [apiKey("apikey")] },
  { id: "coingecko", name: "CoinGecko", category: "Crypto", auth: "none", description: "Cripto (sem chave para uso básico).", fields: [pass("api_key", "Pro API Key (opcional)", false)] },
  { id: "coinmarketcap", name: "CoinMarketCap", category: "Crypto", auth: "api-key-header", description: "Dados de cripto.", fields: [apiKey("X-CMC_PRO_API_KEY")] },
  { id: "binance", name: "Binance", category: "Crypto", auth: "api-key-header", description: "Exchange API.", fields: [apiKey("X-MBX-APIKEY"), pass("api_secret", "Secret Key")] },
  { id: "kraken", name: "Kraken", category: "Crypto", auth: "custom", description: "Exchange API.", fields: [text("api_key", "API Key"), pass("api_secret", "API Secret")] },
  { id: "etherscan", name: "Etherscan", category: "Crypto", auth: "query-param", description: "Explorer ETH.", fields: [apiKey("apikey")] },

  // ───── Productivity / Workspace ─────
  { id: "notion", name: "Notion", category: "Productivity", auth: "bearer", description: "Banco de dados e páginas.", fields: [pass("token", "Internal Integration Token")] },
  { id: "airtable", name: "Airtable", category: "Productivity", auth: "bearer", description: "Bases e tabelas.", fields: [pass("token", "Personal Access Token")] },
  { id: "google_sheets", name: "Google Sheets", category: "Productivity", auth: "bearer", description: "Planilhas.", fields: [pass("access_token", "OAuth Access Token")] },
  { id: "gmail", name: "Gmail", category: "Email", auth: "bearer", description: "Envio e leitura via OAuth.", fields: [pass("access_token", "Access Token")] },
  { id: "google_calendar", name: "Google Calendar", category: "Productivity", auth: "bearer", description: "Eventos e agendas.", fields: [pass("access_token", "Access Token")] },
  { id: "google_docs", name: "Google Docs", category: "Productivity", auth: "bearer", description: "Documentos.", fields: [pass("access_token", "Access Token")] },
  { id: "outlook", name: "Outlook / Microsoft 365", category: "Email", auth: "bearer", description: "Mail e Calendar via Graph.", fields: [pass("access_token", "Access Token")] },
  { id: "trello", name: "Trello", category: "Productivity", auth: "query-param", description: "Cards e listas.", fields: [text("key", "Key"), pass("token", "Token")] },
  { id: "asana", name: "Asana", category: "Productivity", auth: "bearer", description: "Tarefas e projetos.", fields: [pass("token", "Personal Access Token")] },
  { id: "clickup", name: "ClickUp", category: "Productivity", auth: "api-key-header", description: "Gestão de tarefas.", fields: [apiKey("Authorization")] },
  { id: "monday", name: "Monday.com", category: "Productivity", auth: "api-key-header", description: "Work OS.", fields: [apiKey("Authorization")] },
  { id: "linear", name: "Linear", category: "Productivity", auth: "api-key-header", description: "Issue tracking.", fields: [apiKey("Authorization")] },
  { id: "jira", name: "Jira", category: "Productivity", auth: "basic", description: "Issues Atlassian.", fields: [text("base_url", "Base URL"), text("email", "Email"), pass("api_token", "API Token")] },
  { id: "confluence", name: "Confluence", category: "Productivity", auth: "basic", description: "Wiki Atlassian.", fields: [text("base_url", "Base URL"), text("email", "Email"), pass("api_token", "API Token")] },
  { id: "calendly", name: "Calendly", category: "Productivity", auth: "bearer", description: "Agendamentos.", fields: [pass("token", "Personal Access Token")] },
  { id: "calcom", name: "Cal.com", category: "Productivity", auth: "query-param", description: "Agendamentos open-source.", fields: [apiKey("apiKey")] },
  { id: "zoom", name: "Zoom", category: "Productivity", auth: "bearer", description: "Reuniões.", fields: [pass("access_token", "Access Token")] },

  // ───── CRM / Support ─────
  { id: "hubspot", name: "HubSpot", category: "CRM", auth: "bearer", description: "CRM e marketing.", fields: [pass("access_token", "Private App Token")] },
  { id: "salesforce", name: "Salesforce", category: "CRM", auth: "bearer", description: "CRM enterprise.", fields: [url("instance_url", "Instance URL"), pass("access_token", "Access Token")] },
  { id: "pipedrive", name: "Pipedrive", category: "CRM", auth: "query-param", description: "CRM de vendas.", fields: [apiKey("api_token")] },
  { id: "zoho_crm", name: "Zoho CRM", category: "CRM", auth: "bearer", description: "CRM da Zoho.", fields: [pass("access_token", "Access Token")] },
  { id: "intercom", name: "Intercom", category: "Support", auth: "bearer", description: "Mensagens e CS.", fields: [pass("access_token", "Access Token")] },
  { id: "zendesk", name: "Zendesk", category: "Support", auth: "basic", description: "Suporte.", fields: [text("subdomain", "Subdomain"), text("email", "Email"), pass("api_token", "API Token")] },
  { id: "freshdesk", name: "Freshdesk", category: "Support", auth: "basic", description: "Suporte.", fields: [text("domain", "Domain"), apiKey()] },
  { id: "crisp", name: "Crisp", category: "Support", auth: "basic", description: "Chat de suporte.", fields: [text("identifier", "Identifier"), pass("key", "Key")] },

  // ───── E-commerce ─────
  { id: "shopify", name: "Shopify", category: "Payments", auth: "api-key-header", description: "Admin API.", fields: [text("shop", "shop.myshopify.com"), apiKey("X-Shopify-Access-Token")] },
  { id: "woocommerce", name: "WooCommerce", category: "Payments", auth: "basic", description: "REST API.", fields: [url("url", "Site URL"), text("consumer_key", "Consumer Key"), pass("consumer_secret", "Consumer Secret")] },

  // ───── Analytics / Monitoring ─────
  { id: "posthog", name: "PostHog", category: "Analytics", auth: "bearer", description: "Product analytics.", fields: [url("host", "Host"), pass("api_key", "Project API Key")] },
  { id: "mixpanel", name: "Mixpanel", category: "Analytics", auth: "basic", description: "Analytics.", fields: [text("project_id", "Project ID"), pass("api_secret", "API Secret")] },
  { id: "amplitude", name: "Amplitude", category: "Analytics", auth: "api-key-header", description: "Product analytics.", fields: [apiKey("Authorization")] },
  { id: "segment", name: "Segment", category: "Analytics", auth: "basic", description: "CDP.", fields: [pass("write_key", "Write Key")] },
  { id: "plausible", name: "Plausible", category: "Analytics", auth: "bearer", description: "Analytics privacy-first.", fields: [pass("token", "API Token")] },
  { id: "umami", name: "Umami", category: "Analytics", auth: "bearer", description: "Analytics open-source.", fields: [url("base_url", "Base URL"), pass("token", "Token")] },
  { id: "sentry", name: "Sentry", category: "Monitoring", auth: "bearer", description: "Error tracking.", fields: [pass("token", "Auth Token"), text("org", "Organization")] },
  { id: "datadog", name: "Datadog", category: "Monitoring", auth: "api-key-header", description: "Observabilidade.", fields: [apiKey("DD-API-KEY"), apiKey("DD-APPLICATION-KEY", "app_key")] },
  { id: "newrelic", name: "New Relic", category: "Monitoring", auth: "api-key-header", description: "APM.", fields: [apiKey("Api-Key")] },
  { id: "logsnag", name: "LogSnag", category: "Monitoring", auth: "bearer", description: "Notificações de eventos.", fields: [apiKey()] },

  // ───── DevOps / Dev ─────
  { id: "github", name: "GitHub", category: "Dev", auth: "bearer", description: "REST API e GraphQL.", fields: [apiKey("Personal Access Token")] },
  { id: "gitlab", name: "GitLab", category: "Dev", auth: "api-key-header", description: "REST API.", fields: [apiKey("PRIVATE-TOKEN")] },
  { id: "bitbucket", name: "Bitbucket", category: "Dev", auth: "basic", description: "REST API.", fields: [text("username", "Username"), pass("app_password", "App Password")] },
  { id: "vercel", name: "Vercel", category: "DevOps", auth: "bearer", description: "Deploys e projetos.", fields: [pass("token", "Token")] },
  { id: "netlify", name: "Netlify", category: "DevOps", auth: "bearer", description: "Sites e deploys.", fields: [pass("token", "Personal Access Token")] },
  { id: "cloudflare", name: "Cloudflare", category: "DevOps", auth: "bearer", description: "DNS, Workers, R2.", fields: [pass("api_token", "API Token")] },
  { id: "render", name: "Render", category: "DevOps", auth: "bearer", description: "Deploys.", fields: [pass("api_key", "API Key")] },
  { id: "railway", name: "Railway", category: "DevOps", auth: "bearer", description: "Deploys.", fields: [pass("token", "Token")] },
  { id: "fly", name: "Fly.io", category: "DevOps", auth: "bearer", description: "Apps globais.", fields: [pass("token", "API Token")] },
  { id: "docker_hub", name: "Docker Hub", category: "DevOps", auth: "bearer", description: "Images.", fields: [pass("token", "Token")] },
  { id: "npm", name: "npm Registry", category: "Dev", auth: "bearer", description: "Publish e info.", fields: [pass("token", "Token", false)] },

  // ───── CMS ─────
  { id: "wordpress", name: "WordPress", category: "CMS", auth: "basic", description: "REST API.", fields: [url("base_url", "Base URL"), text("username", "Usuário"), pass("app_password", "Application Password")] },
  { id: "ghost", name: "Ghost", category: "CMS", auth: "custom", description: "Content/Admin API.", fields: [url("base_url", "Base URL"), pass("admin_key", "Admin API Key")] },
  { id: "strapi", name: "Strapi", category: "CMS", auth: "bearer", description: "Headless CMS.", fields: [url("base_url", "Base URL"), pass("token", "API Token")] },
  { id: "contentful", name: "Contentful", category: "CMS", auth: "bearer", description: "Headless CMS.", fields: [text("space_id", "Space ID"), pass("access_token", "Access Token")] },
  { id: "sanity", name: "Sanity", category: "CMS", auth: "bearer", description: "Structured content.", fields: [text("project_id", "Project ID"), text("dataset", "Dataset"), pass("token", "Token")] },
  { id: "storyblok", name: "Storyblok", category: "CMS", auth: "query-param", description: "Headless CMS.", fields: [apiKey("token")] },
  { id: "webflow", name: "Webflow", category: "CMS", auth: "bearer", description: "CMS API.", fields: [pass("token", "Site Token")] },

  // ───── Scraping / Web ─────
  { id: "scrapingbee", name: "ScrapingBee", category: "Scraping", auth: "query-param", description: "Web scraping.", fields: [apiKey("api_key")] },
  { id: "scraperapi", name: "ScraperAPI", category: "Scraping", auth: "query-param", description: "Proxy + scraping.", fields: [apiKey("api_key")] },
  { id: "apify", name: "Apify", category: "Scraping", auth: "bearer", description: "Actors e scraping.", fields: [pass("token", "Token")] },
  { id: "browserless", name: "Browserless", category: "Scraping", auth: "query-param", description: "Headless browsers.", fields: [apiKey("token")] },
  { id: "firecrawl", name: "Firecrawl", category: "Scraping", auth: "bearer", description: "Web → markdown.", fields: [apiKey()] },
  { id: "screenshotlayer", name: "Screenshotlayer", category: "Scraping", auth: "query-param", description: "Captura de telas.", fields: [apiKey("access_key")] },
  { id: "urlbox", name: "Urlbox", category: "Scraping", auth: "query-param", description: "Screenshots.", fields: [text("api_key", "API Key"), pass("api_secret", "API Secret")] },
  { id: "microlink", name: "Microlink", category: "Scraping", auth: "api-key-header", description: "URL preview / data.", fields: [apiKey("x-api-key", "api_key")] },

  // ───── Translation ─────
  { id: "deepl", name: "DeepL", category: "Translation", auth: "api-key-header", description: "Tradução de alta qualidade.", fields: [apiKey("Authorization")] },
  { id: "google_translate", name: "Google Translate", category: "Translation", auth: "query-param", description: "Translation API.", fields: [apiKey("key")] },
  { id: "libretranslate", name: "LibreTranslate", category: "Translation", auth: "custom", description: "Tradução open-source.", fields: [url("url", "Endpoint"), pass("api_key", "API Key", false)] },

  // ───── Media / Entertainment ─────
  { id: "tmdb", name: "TMDB", category: "Media", auth: "bearer", description: "Filmes e séries.", fields: [apiKey("v4 Access Token")] },
  { id: "youtube", name: "YouTube Data", category: "Media", auth: "query-param", description: "API de vídeos do YouTube.", fields: [apiKey()] },
  { id: "spotify", name: "Spotify", category: "Media", auth: "bearer", description: "Catálogo musical.", fields: [text("client_id", "Client ID"), pass("client_secret", "Client Secret")] },
  { id: "rawg", name: "RAWG", category: "Media", auth: "query-param", description: "Database de games.", fields: [apiKey("key")] },
  { id: "jikan", name: "Jikan (MyAnimeList)", category: "Media", auth: "none", description: "Anime e mangá (sem chave).", fields: [] },
  { id: "pokeapi", name: "PokéAPI", category: "Media", auth: "none", description: "Pokémon (sem chave).", fields: [] },
  { id: "api_football", name: "API-Football", category: "Data", auth: "api-key-header", description: "Estatísticas de futebol.", fields: [apiKey("x-apisports-key")] },
  { id: "google_books", name: "Google Books", category: "Data", auth: "query-param", description: "Catálogo de livros.", fields: [apiKey()] },
  { id: "open_library", name: "Open Library", category: "Data", auth: "none", description: "Livros (sem chave).", fields: [] },
  { id: "mealdb", name: "TheMealDB", category: "Data", auth: "none", description: "Receitas.", fields: [] },
  { id: "cocktaildb", name: "TheCocktailDB", category: "Data", auth: "none", description: "Drinks.", fields: [] },
  { id: "edamam", name: "Edamam", category: "Data", auth: "query-param", description: "Receitas e nutrição.", fields: [text("app_id", "App ID"), pass("app_key", "App Key")] },
  { id: "spoonacular", name: "Spoonacular", category: "Data", auth: "query-param", description: "Receitas.", fields: [apiKey("apiKey")] },

  // ───── News / Public APIs ─────
  { id: "newsapi", name: "NewsAPI", category: "Data", auth: "api-key-header", description: "Notícias globais.", fields: [apiKey("X-Api-Key")] },
  { id: "gnews", name: "GNews", category: "Data", auth: "query-param", description: "Notícias.", fields: [apiKey("token")] },
  { id: "currents", name: "Currents API", category: "Data", auth: "query-param", description: "Notícias multilíngues.", fields: [apiKey("apiKey")] },
  { id: "hackernews", name: "Hacker News", category: "Data", auth: "none", description: "API pública (sem chave).", fields: [] },
  { id: "nasa", name: "NASA", category: "Data", auth: "query-param", description: "APIs públicas da NASA.", fields: [apiKey("api_key")] },
  { id: "spacex", name: "SpaceX", category: "Data", auth: "none", description: "API pública (sem chave).", fields: [] },
  { id: "wikipedia", name: "Wikipedia", category: "Data", auth: "none", description: "API pública.", fields: [] },
  { id: "zenserp", name: "Zenserp", category: "Scraping", auth: "api-key-header", description: "SERP scraping.", fields: [apiKey("apikey")] },
  { id: "serpapi", name: "SerpAPI", category: "Scraping", auth: "query-param", description: "Resultados de busca.", fields: [apiKey("api_key")] },
  { id: "numverify", name: "Numverify", category: "Data", auth: "query-param", description: "Validação de telefones.", fields: [apiKey("access_key")] },
  { id: "mailboxlayer", name: "Mailboxlayer", category: "Data", auth: "query-param", description: "Validação de e-mails.", fields: [apiKey("access_key")] },
  { id: "abstract_email", name: "Abstract Email Validation", category: "Data", auth: "query-param", description: "Validação de e-mail.", fields: [apiKey("api_key")] },
  { id: "abstract_phone", name: "Abstract Phone Validation", category: "Data", auth: "query-param", description: "Validação de telefone.", fields: [apiKey("api_key")] },
  { id: "abstract_vat", name: "Abstract VAT Validation", category: "Data", auth: "query-param", description: "Validação de VAT.", fields: [apiKey("api_key")] },
  { id: "worldtime", name: "WorldTime API", category: "Data", auth: "none", description: "Horários globais (sem chave).", fields: [] },
  { id: "holidays", name: "Nager.Date Holidays", category: "Data", auth: "none", description: "Feriados (sem chave).", fields: [] },
  { id: "open_food_facts", name: "Open Food Facts", category: "Data", auth: "none", description: "Catálogo alimentar.", fields: [] },
  { id: "jsonplaceholder", name: "JSONPlaceholder", category: "Other", auth: "none", description: "API fake para testes.", fields: [] },
  { id: "advice_slip", name: "Advice Slip", category: "Other", auth: "none", description: "Conselhos aleatórios.", fields: [] },
  { id: "boredapi", name: "Bored API", category: "Other", auth: "none", description: "Sugestões de atividades.", fields: [] },
  { id: "trivia", name: "Open Trivia DB", category: "Other", auth: "none", description: "Perguntas de trivia.", fields: [] },
  { id: "randomuser", name: "Random User", category: "Other", auth: "none", description: "Usuários fake.", fields: [] },
  { id: "fakestore", name: "FakeStore API", category: "Other", auth: "none", description: "E-commerce fake.", fields: [] },
  { id: "reqres", name: "ReqRes", category: "Other", auth: "none", description: "REST de testes.", fields: [] },
];

export const CATEGORIES = Array.from(new Set(INTEGRATIONS.map((i) => i.category)));

export function getIntegration(id: string) {
  return INTEGRATIONS.find((i) => i.id === id);
}
