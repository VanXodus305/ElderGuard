import { translate } from "@vitalets/google-translate-api";

// Common transliteration patterns for Indian languages written in Latin
const TRANSLITERATION_PATTERNS = {
  hi: {
    patterns: [
      /\b(kaise|kaisa|kya|hai|hoon|ho|aap|main|mein|tum|tumhe|uske|iska|use|inhe|unhe|kuch|baat|tha|the|hoon|hun|mere|tera|apka|uska|jisme|isliye|lekin|par|aur|isliye|bilkul|zyada)\b/gi,
      /[aeiou]ng\b/g, // -ing suffix common in Hinglish
      /ch[a-z]+/gi, // ch combinations
      /sh[a-z]+/gi, // sh combinations
    ],
    minMatch: 1,
  },
  ta: {
    patterns: [
      /\b(naan|neenga|aandavan|enga|apdiye|apdilum|rendum|moonru|enna|ippadi|ille|aagum|vendam|irukkum)\b/gi,
    ],
    minMatch: 1,
  },
  te: {
    patterns: [
      /\b(nenu|meru|meeru|baaga|ledu|undi|raadu|vundi|antey|anthe|adi|okati)\b/gi,
    ],
    minMatch: 1,
  },
  bn: {
    patterns: [
      /\b(ami|tumi|apni|kemon|acho|nai|hobo|korbo|cholun|ekhane|amar|tomader)\b/gi,
    ],
    minMatch: 1,
  },
  gu: {
    patterns: [/\b(hu|tu|aapne|kyu|shu|ane|tane|nai|aaje|aama)\b/gi],
    minMatch: 1,
  },
  ml: {
    patterns: [
      /\b(njan|nee|ninne|enne|aayirikkum|alla|ille|podo|aano|ayyo)\b/gi,
    ],
    minMatch: 1,
  },
};

function detectTransliteration(text) {
  for (const [langCode, config] of Object.entries(TRANSLITERATION_PATTERNS)) {
    let matches = 0;
    for (const pattern of config.patterns) {
      const found = (text.match(pattern) || []).length;
      matches += found;
    }
    if (matches >= config.minMatch) {
      return langCode; // Return language code if transliteration detected
    }
  }
  return null;
}

export async function POST(req) {
  let text = null;
  try {
    const body = await req.json();
    text = body.text;

    if (!text || typeof text !== "string") {
      return Response.json({ error: "Invalid text provided" }, { status: 400 });
    }

    let detectedLang = "en";
    let detectionMethod = "google";

    // First try to detect transliteration patterns
    const translitLang = detectTransliteration(text);
    if (translitLang) {
      detectedLang = translitLang;
      detectionMethod = "transliteration";
    } else {
      // Try to use franc for robust language detection
      try {
        const francModule = await import("franc");
        const detect = francModule.default;
        if (typeof detect === "function") {
          const francResult = detect(text);
          if (francResult && francResult !== "eng") {
            detectedLang = francResult;
            detectionMethod = "franc";
          }
        }
      } catch (e) {
        console.error("Franc detection error:", e);
        // Continue with Google Translate detection
      }
    }

    const result = await translate(text, { to: "en" });

    // Extract detected language from Google Translate result (if not already detected)
    if (detectionMethod === "google") {
      if (result.from?.language?.iso) {
        detectedLang = result.from.language.iso;
      } else if (result.from?.lang) {
        detectedLang = result.from.lang;
      }
    }

    return Response.json({
      originalText: text,
      translatedText: result.text,
      detectedLanguage: detectedLang,
      wasTranslated: result.text !== text,
      detectionMethod,
    });
  } catch (error) {
    console.error("Translation error:", error);
    // Return the original text if translation fails
    return Response.json(
      {
        originalText: text || "",
        translatedText: text || "",
        detectedLanguage: "unknown",
        wasTranslated: false,
        error: "Translation failed, using original text",
      },
      { status: 200 }
    );
  }
}
