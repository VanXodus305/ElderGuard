import axios from "axios";

const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY;

// Determine safety level based on VirusTotal stats with refined logic
function determineSafetyLevel(stats) {
  if (!stats) {
    return { isSafe: true, confidence: "unknown" };
  }

  const { malicious = 0, suspicious = 0, harmless = 0 } = stats;
  const total = malicious + suspicious + harmless;

  // If no analysis was done yet or insufficient data
  if (total === 0) {
    return { isSafe: true, confidence: "unknown" };
  }

  // Calculate percentages
  const maliciousPercentage = (malicious / total) * 100;
  const harmlessPercentage = (harmless / total) * 100;

  // SAFE CLASSIFICATION
  // Case 1: No malicious detections at all
  if (malicious === 0) {
    return { isSafe: true, confidence: "high" };
  }

  // Case 2: Only 1-2 malicious detections (likely false positives) with significant harmless votes
  // This handles cases like google.com which might have 1 malicious but 72+ harmless
  if (malicious <= 2 && harmless >= 50) {
    return { isSafe: true, confidence: "high" };
  }

  // Case 3: Low malicious percentage (<3%) even if count is slightly higher
  if (maliciousPercentage < 3) {
    return { isSafe: true, confidence: "medium" };
  }

  // SCAM CLASSIFICATION (High confidence it's malicious)
  // Case 1: High absolute number of malicious detections
  if (malicious > 10) {
    return { isSafe: false, confidence: "high", riskLevel: "scam" };
  }

  // Case 2: High percentage of malicious detections (>20%)
  if (maliciousPercentage > 20) {
    return { isSafe: false, confidence: "high", riskLevel: "scam" };
  }

  // Case 3: Malicious detections more than 20% of harmless votes
  if (harmless > 0 && malicious > harmless * 0.2) {
    return { isSafe: false, confidence: "high", riskLevel: "scam" };
  }

  // LIKELY SCAM CLASSIFICATION (Medium confidence)
  // Case 1: Moderate number of malicious detections (3-10)
  if (malicious > 2 && malicious <= 10) {
    return { isSafe: false, confidence: "medium", riskLevel: "likely-scam" };
  }

  // Case 2: Moderate percentage of malicious (3-20%)
  if (maliciousPercentage > 3 && maliciousPercentage <= 20) {
    return { isSafe: false, confidence: "medium", riskLevel: "likely-scam" };
  }

  // Default: Suspicious activity detected
  if (suspicious > 0 || malicious > 0) {
    return { isSafe: false, confidence: "low", riskLevel: "likely-scam" };
  }

  return { isSafe: true, confidence: "high" };
}

export async function POST(req) {
  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(JSON.stringify({ error: "URL is required" }), {
        status: 400,
      });
    }

    if (!VIRUSTOTAL_API_KEY) {
      return new Response(
        JSON.stringify({ error: "VirusTotal API key not configured" }),
        { status: 500 }
      );
    }

    // Step 1: Submit URL for scanning
    const encodedParams = new URLSearchParams();
    encodedParams.set("url", url);

    const scanResponse = await axios.post(
      "https://www.virustotal.com/api/v3/urls",
      encodedParams,
      {
        headers: {
          accept: "application/json",
          "x-apikey": VIRUSTOTAL_API_KEY,
          "content-type": "application/x-www-form-urlencoded",
        },
      }
    );

    const analysisId = scanResponse.data.data.id;

    // Step 2: Immediately try to get analysis results (no waiting initially)
    // For cached/already analyzed URLs, results will be available instantly
    const analysisResponse = await axios.get(
      `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
      {
        headers: {
          accept: "application/json",
          "x-apikey": VIRUSTOTAL_API_KEY,
        },
      }
    );

    const analysisData = analysisResponse.data.data;
    let stats = analysisData.attributes.stats;

    // If stats are empty (all zeros), the URL is still being analyzed
    // Wait 10 seconds and retry to get the completed analysis
    const statsAreEmpty =
      stats.malicious === 0 &&
      stats.suspicious === 0 &&
      stats.harmless === 0 &&
      stats.undetected === 0;

    if (statsAreEmpty) {
      await new Promise((resolve) => setTimeout(resolve, 12000));

      const retryResponse = await axios.get(
        `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
        {
          headers: {
            accept: "application/json",
            "x-apikey": VIRUSTOTAL_API_KEY,
          },
        }
      );

      stats = retryResponse.data.data.attributes.stats;
    }

    const safetyResult = determineSafetyLevel(stats);

    return new Response(
      JSON.stringify({
        url,
        analysisId,
        stats,
        isSafe: safetyResult.isSafe,
        riskLevel:
          safetyResult.riskLevel ||
          (safetyResult.isSafe ? "safe" : "likely-scam"),
        confidence: safetyResult.confidence,
        analysisStatus: analysisData.attributes.status,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error scanning URL with VirusTotal:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to scan URL",
        message: error.message,
      }),
      { status: 500 }
    );
  }
}
