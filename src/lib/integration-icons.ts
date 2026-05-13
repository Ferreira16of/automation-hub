// Maps integration ids to logo (Simple Icons) slug + brand color.
// Falls back to colored initials when not present.

export interface IconInfo {
  slug?: string;     // simpleicons.org slug
  color: string;     // hex without #
  label?: string;    // override letters
}

const M: Record<string, IconInfo> = {
  // Core / triggers
  "core.start":      { color: "10B981", label: "▶" },
  "core.webhook":    { color: "06B6D4", label: "WH" },
  "core.schedule":   { color: "F59E0B", label: "⏱" },
  "core.http":       { color: "3B82F6", label: "{ }" },
  "core.code":       { color: "A855F7", label: "JS" },
  "core.set":        { color: "8B5CF6", label: "≡" },
  "core.if":         { color: "EAB308", label: "IF" },
  "core.delay":      { color: "64748B", label: "⏸" },
  "core.merge":      { color: "0EA5E9", label: "⇉" },
  "core.switch":     { color: "F97316", label: "⇆" },
  "core.loop":       { color: "EC4899", label: "↻" },

  "trigger.manual":   { color: "10B981", label: "▶" },
  "trigger.webhook":  { color: "06B6D4", label: "WH" },
  "trigger.schedule": { color: "F59E0B", label: "⏱" },
  "trigger.form":     { color: "3B82F6", label: "📋" },
  "trigger.email":    { color: "EF4444", label: "✉" },
  "trigger.telegram":  { slug: "telegram",  color: "26A5E4" },
  "trigger.github":    { slug: "github",    color: "FFFFFF" },
  "trigger.stripe":    { slug: "stripe",    color: "635BFF" },
  "trigger.discord":   { slug: "discord",   color: "5865F2" },
  "trigger.slack":     { slug: "slack",     color: "4A154B" },
  "trigger.shopify":   { slug: "shopify",   color: "7AB55C" },
  "trigger.calendly":  { slug: "calendly",  color: "006BFF" },
  "trigger.typeform":  { slug: "typeform",  color: "262627" },
  "trigger.airtable":  { slug: "airtable",  color: "18BFFF" },
  "trigger.notion":    { slug: "notion",    color: "FFFFFF" },
  "trigger.gmail":     { slug: "gmail",     color: "EA4335" },

  // AI
  openai:        { slug: "openai",        color: "10A37F" },
  anthropic:     { slug: "anthropic",     color: "D4A27F" },
  google_ai:     { slug: "googlegemini",  color: "8E75B2" },
  groq:          { color: "F55036", label: "Gq" },
  huggingface:   { slug: "huggingface",   color: "FFD21E" },
  deepseek:      { color: "4D6BFE", label: "DS" },
  mistral:       { slug: "mistralai",     color: "FA520F" },
  together:      { color: "0F6FFF", label: "T" },
  cohere:        { slug: "cohere",        color: "39594D" },
  perplexity:    { slug: "perplexity",    color: "1FB8CD" },
  xai:           { color: "FFFFFF", label: "𝕏" },
  cerebras:      { color: "F15A29", label: "Cb" },
  fireworks:     { color: "5019C5", label: "🎆" },
  openrouter:    { color: "6467F2", label: "OR" },
  replicate:     { slug: "replicate",     color: "EA2328" },
  ollama:        { slug: "ollama",        color: "FFFFFF" },

  // Image / Video / Audio
  stability:      { color: "8A2BE2", label: "SD" },
  leonardo:       { color: "FFB300", label: "L" },
  ideogram:       { color: "FFFFFF", label: "Id" },
  recraft:        { color: "F73C8D", label: "Rc" },
  fal:            { color: "FFFFFF", label: "fal" },
  openai_image:   { slug: "openai", color: "10A37F" },
  luma:           { color: "C770F2", label: "Lm" },
  runway:         { color: "00FF88", label: "Rw" },
  pika:           { color: "FFFFFF", label: "Pk" },
  elevenlabs:     { slug: "elevenlabs", color: "000000" },
  openai_tts:     { slug: "openai", color: "10A37F" },
  deepgram:       { color: "13EF93", label: "Dg" },
  assemblyai:     { color: "2196F3", label: "Aai" },
  suno:           { color: "FFFFFF", label: "Sn" },
  vapi:           { color: "5DFAB6", label: "Vp" },

  // Vector DB
  pinecone:   { slug: "pinecone",  color: "1B17F5" },
  weaviate:   { color: "00B894", label: "Wv" },
  qdrant:     { slug: "qdrant",    color: "DC244C" },
  chroma:     { color: "FF6F6F", label: "Cr" },

  // Messaging
  telegram:        { slug: "telegram",       color: "26A5E4" },
  discord:         { slug: "discord",        color: "5865F2" },
  slack:           { slug: "slack",          color: "4A154B" },
  twilio:          { slug: "twilio",         color: "F22F46" },
  whatsapp_cloud:  { slug: "whatsapp",       color: "25D366" },
  messagebird:     { color: "2481D7", label: "Mb" },
  vonage:          { color: "871FFF", label: "Vn" },
  msteams:         { slug: "microsoftteams", color: "6264A7" },
  matrix:          { slug: "matrix",         color: "FFFFFF" },
  rocketchat:      { slug: "rocketdotchat",  color: "F5455C" },
  signal_cli:      { slug: "signal",         color: "3A76F0" },

  // Social
  twitter:    { slug: "x",          color: "FFFFFF" },
  linkedin:   { slug: "linkedin",   color: "0A66C2" },
  facebook:   { slug: "facebook",   color: "0866FF" },
  instagram:  { slug: "instagram",  color: "E4405F" },
  threads:    { slug: "threads",    color: "FFFFFF" },
  tiktok:     { slug: "tiktok",     color: "FF0050" },
  reddit:     { slug: "reddit",     color: "FF4500" },
  mastodon:   { slug: "mastodon",   color: "6364FF" },
  bluesky:    { slug: "bluesky",    color: "0085FF" },
  pinterest:  { slug: "pinterest",  color: "BD081C" },

  // Email
  resend:     { slug: "resend",     color: "FFFFFF" },
  sendgrid:   { color: "1A82E2", label: "SG" },
  mailgun:    { slug: "mailgun",    color: "F06B66" },
  postmark:   { color: "FFDE00", label: "Pm" },
  ses:        { slug: "amazonsimpleemailservice", color: "DD344C" },
  brevo:      { color: "0B996E", label: "Bv" },
  mailchimp:  { slug: "mailchimp",  color: "FFE01B" },
  convertkit: { slug: "convertkit", color: "FB6970" },
  klaviyo:    { color: "1E1E1E", label: "Kl" },
  smtp:       { color: "64748B", label: "@" },
  gmail:      { slug: "gmail",      color: "EA4335" },
  outlook:    { slug: "microsoftoutlook", color: "0078D4" },

  // Auth / DB
  clerk:        { color: "6C47FF", label: "Cl" },
  auth0:        { slug: "auth0",        color: "EB5424" },
  supabase:     { slug: "supabase",     color: "3FCF8E" },
  firebase:     { slug: "firebase",     color: "DD2C00" },
  mongodb:      { slug: "mongodb",      color: "47A248" },
  postgrest:    { slug: "postgresql",   color: "4169E1" },
  redis_upstash:{ slug: "redis",        color: "DC382D" },
  planetscale:  { slug: "planetscale",  color: "FFFFFF" },
  neon:         { color: "00E599", label: "Nn" },
  turso:        { color: "4FF8D2", label: "Ts" },
  algolia:      { slug: "algolia",      color: "003DFF" },
  meilisearch:  { slug: "meilisearch",  color: "FF5CAA" },
  elasticsearch:{ slug: "elasticsearch",color: "005571" },

  // Payments
  stripe:           { slug: "stripe",     color: "635BFF" },
  paypal:           { slug: "paypal",     color: "00457C" },
  lemonsqueezy:     { color: "FFC233", label: "🍋" },
  paddle:           { color: "FDDD35", label: "Pd" },
  polar:            { color: "0062FF", label: "Pl" },
  mercadopago:      { slug: "mercadopago", color: "00B1EA" },
  asaas:            { color: "0080FF", label: "As" },
  pagarme:          { color: "65A300", label: "Pg" },
  coinbase_commerce:{ slug: "coinbase",   color: "0052FF" },
  btcpay:           { slug: "bitcoin",    color: "F7931A" },

  // Storage / Media
  cloudinary:   { slug: "cloudinary",  color: "3448C5" },
  uploadcare:   { color: "157CFC", label: "Uc" },
  imagekit:     { color: "1A73E8", label: "Ik" },
  s3:           { slug: "amazons3",    color: "569A31" },
  backblaze:    { slug: "backblaze",   color: "EF0000" },
  dropbox:      { slug: "dropbox",     color: "0061FF" },
  google_drive: { slug: "googledrive", color: "4285F4" },
  onedrive:     { color: "0078D4", label: "OD" },
  ipfs_pinata:  { color: "E956AA", label: "📌" },
  unsplash:     { slug: "unsplash",    color: "FFFFFF" },
  pexels:       { slug: "pexels",      color: "05A081" },
  giphy:        { color: "FF6666", label: "Gif" },

  // Maps / Weather / Finance
  google_maps:  { slug: "googlemaps",  color: "4285F4" },
  mapbox:       { slug: "mapbox",      color: "FFFFFF" },
  here:         { color: "00AFAA", label: "Hr" },
  opencage:     { color: "F49E2A", label: "Oc" },
  geoapify:     { color: "0066FF", label: "Ga" },
  positionstack:{ color: "ED2939", label: "Ps" },
  ipstack:      { color: "82B541", label: "Ip" },
  ipinfo:       { color: "1F70BB", label: "Ii" },
  ipify:        { color: "1ABC9C", label: "ip" },
  rest_countries:{color: "1ABC9C", label: "🌎" },
  openweather:  { color: "EB6E4B", label: "☁" },
  weatherstack: { color: "F2641D", label: "Ws" },
  weatherapi:   { color: "FF6B6B", label: "Wa" },
  tomorrow:     { color: "001D8E", label: "Tm" },
  open_meteo:   { color: "FF3E00", label: "Om" },
  marketstack:  { color: "1B6CFE", label: "Ms" },
  fixer:        { color: "001E50", label: "Fx" },
  currencyapi:  { color: "00B894", label: "Cx" },
  exchangerate: { color: "27AE60", label: "Er" },
  polygon:      { color: "5F5CFF", label: "Pg" },
  alpha_vantage:{ color: "118AB2", label: "Av" },
  finnhub:      { color: "1DB954", label: "Fn" },
  twelvedata:   { color: "1A56DB", label: "12" },

  // Crypto
  coingecko:        { slug: "coingecko",      color: "8DC63F" },
  coinmarketcap:    { slug: "coinmarketcap",  color: "17181B" },
  binance:          { slug: "binance",        color: "F0B90B" },
  kraken:           { color: "5841D8", label: "Kr" },
  etherscan:        { slug: "ethereum",       color: "627EEA" },

  // Productivity
  notion:           { slug: "notion",         color: "FFFFFF" },
  airtable:         { slug: "airtable",       color: "18BFFF" },
  google_sheets:    { slug: "googlesheets",   color: "34A853" },
  google_calendar:  { slug: "googlecalendar", color: "4285F4" },
  google_docs:      { slug: "googledocs",     color: "4285F4" },
  trello:           { slug: "trello",         color: "0052CC" },
  asana:            { slug: "asana",          color: "F06A6A" },
  clickup:          { slug: "clickup",        color: "7B68EE" },
  monday:           { color: "FF3D57", label: "Mo" },
  linear:           { slug: "linear",         color: "5E6AD2" },
  jira:             { slug: "jira",           color: "0052CC" },
  confluence:       { slug: "confluence",     color: "172B4D" },
  calendly:         { slug: "calendly",       color: "006BFF" },
  calcom:           { color: "111827", label: "cal" },
  zoom:             { slug: "zoom",           color: "0B5CFF" },

  // CRM / Support
  hubspot:    { slug: "hubspot",     color: "FF7A59" },
  salesforce: { slug: "salesforce",  color: "00A1E0" },
  pipedrive:  { slug: "pipedrive",   color: "1A1A1A" },
  zoho_crm:   { slug: "zoho",        color: "E42527" },
  intercom:   { slug: "intercom",    color: "1F8DED" },
  zendesk:    { slug: "zendesk",     color: "03363D" },
  freshdesk:  { color: "25C16F", label: "Fd" },
  crisp:      { color: "1972F5", label: "Cs" },

  // E-commerce
  shopify:    { slug: "shopify",     color: "7AB55C" },
  woocommerce:{ slug: "woocommerce", color: "96588A" },

  // Analytics / Monitoring
  posthog:    { slug: "posthog",     color: "F54E00" },
  mixpanel:   { color: "7856FF", label: "Mp" },
  amplitude:  { color: "1E61F0", label: "Am" },
  segment:    { color: "52BD95", label: "Sg" },
  plausible:  { color: "5850EC", label: "Pl" },
  umami:      { color: "111827", label: "Um" },
  sentry:     { slug: "sentry",      color: "362D59" },
  datadog:    { slug: "datadog",     color: "632CA6" },
  newrelic:   { slug: "newrelic",    color: "008C99" },
  logsnag:    { color: "111111", label: "Ls" },

  // DevOps / Dev
  github:     { slug: "github",      color: "FFFFFF" },
  gitlab:     { slug: "gitlab",      color: "FC6D26" },
  bitbucket:  { slug: "bitbucket",   color: "0052CC" },
  vercel:     { slug: "vercel",      color: "FFFFFF" },
  netlify:    { slug: "netlify",     color: "00C7B7" },
  cloudflare: { slug: "cloudflare",  color: "F38020" },
  render:     { slug: "render",      color: "46E3B7" },
  railway:    { slug: "railway",     color: "FFFFFF" },
  fly:        { color: "8B5CF6", label: "Fly" },
  docker_hub: { slug: "docker",      color: "2496ED" },
  npm:        { slug: "npm",         color: "CB3837" },

  // CMS
  wordpress:  { slug: "wordpress",   color: "21759B" },
  ghost:      { slug: "ghost",       color: "FFFFFF" },
  strapi:     { slug: "strapi",      color: "4945FF" },
  contentful: { slug: "contentful",  color: "2478CC" },
  sanity:     { slug: "sanity",      color: "F03E2F" },
  storyblok:  { slug: "storyblok",   color: "09B3AF" },
  webflow:    { slug: "webflow",     color: "146EF5" },

  // Scraping
  scrapingbee:    { color: "FFB800", label: "🐝" },
  scraperapi:     { color: "1B6FFE", label: "Sa" },
  apify:          { color: "00B043", label: "Ap" },
  browserless:    { color: "0EA5E9", label: "Br" },
  firecrawl:      { color: "F97316", label: "🔥" },
  screenshotlayer:{ color: "27B68B", label: "Sl" },
  urlbox:         { color: "8B5CF6", label: "Ub" },
  microlink:      { color: "111111", label: "μ" },

  // Translation
  deepl:           { color: "0F2B46", label: "DL" },
  google_translate:{ slug: "googletranslate", color: "4285F4" },
  libretranslate:  { color: "00CD7B", label: "LT" },

  // Media
  tmdb:        { color: "01D277", label: "TM" },
  youtube:     { slug: "youtube",   color: "FF0000" },
  spotify:     { slug: "spotify",   color: "1DB954" },
  rawg:        { color: "FFFFFF",   label: "🎮" },
  jikan:       { color: "F75A53",   label: "MAL" },
  pokeapi:     { color: "EF5350",   label: "Pk" },
  api_football:{ color: "00C853",   label: "⚽" },
  google_books:{ color: "4285F4",   label: "📚" },
  open_library:{ color: "8B5CF6",   label: "📖" },
  mealdb:      { color: "F59E0B",   label: "🍲" },
  cocktaildb:  { color: "EF4444",   label: "🍹" },
  edamam:      { color: "1FB6FF",   label: "Ed" },
  spoonacular: { color: "FCB100",   label: "Sp" },

  // News / Public
  newsapi:     { color: "F44336", label: "📰" },
  gnews:       { color: "1976D2", label: "GN" },
  currents:    { color: "00B894", label: "Cr" },
  hackernews:  { color: "FF6600", label: "Y" },
  nasa:        { slug: "nasa",     color: "E03C31" },
  spacex:      { slug: "spacex",   color: "FFFFFF" },
  wikipedia:   { slug: "wikipedia",color: "FFFFFF" },
  zenserp:     { color: "F26B38",  label: "Zs" },
  serpapi:     { color: "5E33BF",  label: "SP" },
};

export function getIconInfo(id: string): IconInfo {
  return M[id] ?? { color: "64748B" };
}

export function getIconUrl(id: string): string | null {
  const i = getIconInfo(id);
  return i.slug ? `https://cdn.simpleicons.org/${i.slug}/${i.color}` : null;
}
