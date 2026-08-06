const INDEXNOW_KEY = process.env.INDEXNOW_KEY || ""
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

export async function pingIndexNow(urls: string[]): Promise<void> {
  try {
    if (!INDEXNOW_KEY || !urls.length) return

    const host = new URL(SITE_URL).hostname
    await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        host,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: urls,
      }),
    })
  } catch {
    // silent fail
  }
}

export async function pingGoogleIndexing(url: string): Promise<void> {
  try {
    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
    if (!serviceAccountJson) return

    // Google Indexing API requires OAuth2 with a service account.
    // Parse GOOGLE_SERVICE_ACCOUNT_JSON, obtain a JWT bearer token,
    // then POST to https://indexing.googleapis.com/v3/urlNotifications:publish
    // with body { url, type: "URL_UPDATED" }.
    // Full implementation requires google-auth-library or manual JWT signing.
  } catch {
    // silent fail
  }
}
