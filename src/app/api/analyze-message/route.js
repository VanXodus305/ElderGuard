export async function POST(req) {
  try {
    const { text, metadata } = await req.json();

    if (!text) {
      return new Response(JSON.stringify({ error: "Text is required" }), {
        status: 400,
      });
    }

    // Call the external ML API from the backend (no CORS issues)
    const response = await fetch(
      "https://scam-detection-iitkgp.onrender.com/predict",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          metadata: metadata || {},
        }),
      }
    );

    if (!response.ok) {
      console.error("ML API error:", response.status, response.statusText);
      return new Response(
        JSON.stringify({
          error: "Failed to analyze message",
          status: response.status,
        }),
        { status: response.status }
      );
    }

    const mlResult = await response.json();
    console.log("ML API result:", mlResult);
    return new Response(JSON.stringify(mlResult), { status: 200 });
  } catch (error) {
    console.error("Error in analyze-message proxy:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to analyze message",
        message: error.message,
      }),
      { status: 500 }
    );
  }
}
