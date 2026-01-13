export async function POST(req) {
  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(JSON.stringify({ error: "URL is required" }), {
        status: 400,
      });
    }

    // Make a HEAD request first (faster, only gets headers)
    // If that fails, try GET request
    let expandedUrl = url;

    try {
      const headResponse = await fetch(url, {
        method: "HEAD",
        redirect: "follow",
        timeout: 5000,
      });

      // Get the final URL after redirects
      expandedUrl = headResponse.url || url;
    } catch (headError) {
      // If HEAD fails, try GET request
      try {
        const getResponse = await fetch(url, {
          method: "GET",
          redirect: "follow",
          timeout: 5000,
          // Limit to first 1KB to avoid downloading large files
          size: 1024,
        });

        expandedUrl = getResponse.url || url;
      } catch (getError) {
        // If both fail, return original URL
        console.error("Error expanding URL:", getError.message);
        expandedUrl = url;
      }
    }

    return new Response(
      JSON.stringify({
        originalUrl: url,
        expandedUrl: expandedUrl,
        wasExpanded: expandedUrl !== url,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in expand-url:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to expand URL",
        message: error.message,
      }),
      { status: 500 }
    );
  }
}
