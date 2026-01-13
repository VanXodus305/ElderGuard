"use client";

import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Textarea,
  Badge,
  Chip,
  Skeleton,
} from "@heroui/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useFontSize } from "@/components/Navbar";
import {
  FiSend,
  FiCheckCircle,
  FiAlertTriangle,
  FiAlertOctagon,
  FiLink2,
  FiPhone,
  FiMessageCircle,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { fontSizeMap, fontSize } = useFontSize();

  // Dynamically adjust heading sizes based on font size context
  const getHeadingClass = (baseSize) => {
    const sizeMap = {
      small: {
        2: "text-lg",
        3: "text-xl",
      },
      base: {
        2: "text-2xl",
        3: "text-3xl",
      },
      large: {
        2: "text-3xl",
        3: "text-4xl",
      },
      xl: {
        2: "text-4xl",
        3: "text-5xl",
      },
    };
    return sizeMap[fontSize]?.[baseSize] || sizeMap.base[baseSize];
  };

  const getFontSize = () => {
    const sizes = {
      small: "0.875rem",
      base: "1rem",
      large: "1.125rem",
      xl: "1.25rem",
    };
    return sizes[fontSize] || sizes.base;
  };

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingStartTime, setLoadingStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      if (session?.user?.profileComplete === false) {
        router.push("/profile-setup");
      } else {
        fetchProfile();
      }
    }
  }, [status, session, router]);

  // Update elapsed time while loading
  React.useEffect(() => {
    let interval;
    if (loading && loadingStartTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - loadingStartTime) / 1000);
        setElapsedTime(elapsed);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [loading, loadingStartTime]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  // Extract URLs from message - handles both full URLs and domain names
  const extractUrls = (text) => {
    const urls = new Set();

    // Match full URLs with protocol (http://, https://)
    const fullUrlRegex = /(https?:\/\/[^\s]+)/g;
    const fullUrlMatches = text.match(fullUrlRegex) || [];
    fullUrlMatches.forEach((url) => urls.add(url));

    // Match domain names without protocol (e.g., google.com, example.co.uk)
    // Pattern: word characters, hyphens, dots followed by a valid TLD
    const domainRegex =
      /(?<![/\w.-])([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(?![/\w.-])/g;
    const domainMatches = text.match(domainRegex) || [];
    domainMatches.forEach((domain) => {
      // Avoid adding if it's part of an already captured full URL
      if (!fullUrlMatches.some((url) => url.includes(domain))) {
        urls.add(`https://${domain}`);
      }
    });

    return Array.from(urls);
  };

  const handleAnalyzeMessage = async () => {
    if (!message.trim()) {
      alert("Please enter a message to analyze");
      return;
    }

    setLoading(true);
    setLoadingStartTime(Date.now());
    setElapsedTime(0);

    try {
      // Step 0: Translate message to English if needed
      let messageToAnalyze = message.trim();
      let detectedLanguage = "en";
      let wasTranslated = false;

      try {
        const translationResponse = await fetch("/api/translate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: message.trim() }),
        });

        if (translationResponse.ok) {
          const translationData = await translationResponse.json();
          messageToAnalyze = translationData.translatedText;
          detectedLanguage = translationData.detectedLanguage;
          wasTranslated = translationData.wasTranslated;
          // console.log(
          //   `Detected language: ${detectedLanguage}, Translated: ${wasTranslated}`
          // );
        }
      } catch (error) {
        console.error("Translation error (continuing with original):", error);
        // Continue with original message if translation fails
      }

      // Extract URLs before Step 1 for metadata
      const urls = extractUrls(message);

      // Calculate metadata features from message
      const messageUpperCase = messageToAnalyze.toUpperCase();
      const otpKeywords = /OTP|PIN|PASSWORD|VERIFY|CONFIRM/i;
      const urgencyKeywords = /URGENT|IMMEDIATELY|NOW|ASAP|QUICKLY|HURRY|RUSH/i;
      const threatKeywords =
        /FREEZE|BLOCK|CANCEL|SUSPEND|DELETE|ACCOUNT|CLOSE/i;
      const upiKeywords = /UPI|GPAY|PAYTM|PHONEPE|RUPAY/i;

      const metadata = {
        has_otp: otpKeywords.test(messageToAnalyze) ? 1 : 0,
        has_urgency: urgencyKeywords.test(messageToAnalyze) ? 1 : 0,
        has_threat: threatKeywords.test(messageToAnalyze) ? 1 : 0,
        has_upi: upiKeywords.test(messageToAnalyze) ? 1 : 0,
        has_url: urls.length > 0 ? 1 : 0,
        severity: 0,
      };

      // Calculate severity (0-1 scale)
      let severityScore = 0;
      if (metadata.has_otp) severityScore += 0.2;
      if (metadata.has_urgency) severityScore += 0.2;
      if (metadata.has_threat) severityScore += 0.2;
      if (metadata.has_upi) severityScore += 0.2;
      if (metadata.has_url) severityScore += 0.2;
      metadata.severity = Math.min(severityScore, 1);

      // console.log("Message Metadata:", metadata);

      // Step 1: Call ML API to analyze message content
      let mlResult = { prediction: "safe", confidence: 0 };
      try {
        const mlResponse = await fetch("/api/analyze-message", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: messageToAnalyze,
            metadata: metadata,
          }),
        });

        if (mlResponse.ok) {
          mlResult = await mlResponse.json();
          // console.log("ML API Result:", mlResult);
        } else {
          console.error("ML API returned error:", mlResponse.status);
        }
      } catch (error) {
        console.error("Error calling ML API:", error);
        // Continue with default safe prediction if ML API fails
      }

      // Step 2: Scan URLs with VirusTotal API
      let linkScores = [];
      if (urls.length > 0) {
        linkScores = await Promise.all(
          urls.map(async (url) => {
            try {
              const response = await fetch("/api/scan-url", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ url }),
              });

              if (response.ok) {
                const data = await response.json();
                return {
                  url,
                  isSafe: data.isSafe,
                  riskLevel: data.riskLevel,
                  stats: data.stats,
                  confidence: data.confidence,
                  httpWarning: data.httpWarning,
                };
              } else {
                // Fallback if API fails
                return {
                  url,
                  isSafe: true,
                  riskLevel: "unknown",
                  error: "Could not scan URL",
                };
              }
            } catch (error) {
              console.error(`Error scanning URL ${url}:`, error);
              return {
                url,
                isSafe: true,
                riskLevel: "unknown",
                error: "Scan failed",
              };
            }
          })
        );
      }

      // Step 3: Determine final risk level by combining ML result and link analysis
      let finalRiskLevel = "safe";

      // If ML model predicts scam, it's a scam
      if (mlResult.prediction.toLowerCase() === "scam") {
        finalRiskLevel = "scam";
      } else {
        // ML says safe, so check links
        const hasScamLink = linkScores.some(
          (link) => link.riskLevel === "scam"
        );
        const hasLikelyScamLink = linkScores.some(
          (link) => link.riskLevel === "likely-scam"
        );
        const hasUnsafeLink = linkScores.some((link) => !link.isSafe);

        if (hasScamLink) {
          // If any link is confirmed scam, the message is a scam
          finalRiskLevel = "scam";
        } else if (hasLikelyScamLink || hasUnsafeLink) {
          // If any link is likely scam or unsafe, the message is likely scam
          finalRiskLevel = "likely-scam";
        } else {
          // All links and message are safe
          finalRiskLevel = "safe";
        }
      }

      setAnalysisResult({
        message,
        messageToAnalyze,
        detectedLanguage,
        wasTranslated,
        mlPrediction: mlResult.prediction,
        mlConfidence: mlResult.confidence,
        urls: linkScores,
        riskLevel: finalRiskLevel,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error analyzing message:", error);
      alert("Failed to analyze message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReportScam = () => {
    // Dummy report button - to be implemented later
    alert(
      "Thank you for reporting this message. Our team will review it shortly."
    );
    // TODO: Implement actual reporting functionality
    // - Send report to backend with message details, analysis results, etc.
    // - Track reported scams for ML model improvement
    // - Notify moderators
  };

  const handleEmergencyContact = (method, contact) => {
    if (!contact) {
      alert("Please set up emergency contacts first");
      router.push("/profile");
      return;
    }

    if (method === "whatsapp") {
      // Build detailed report message
      let reportMessage = `SCAM ALERT REPORT\n\n`;
      reportMessage += `Risk Level: ${getRiskLevelText().title}\n`;
      reportMessage += `${getRiskLevelText().description}\n\n`;
      reportMessage += `Message Content:\n${analysisResult.message}\n\n`;

      if (analysisResult.urls.length > 0) {
        reportMessage += `Links Found (${analysisResult.urls.length}):\n`;
        analysisResult.urls.forEach((link) => {
          reportMessage += `• ${link.url}\n`;
          reportMessage += `  Status: ${link.isSafe ? "Safe" : "Unsafe"}\n`;
        });
        reportMessage += "\n";
      }

      reportMessage += `Time: ${new Date().toLocaleString()}\n`;
      reportMessage += `\nPlease help me verify this message. I used ElderGuard to analyze it.`;

      const phone = contact.whatsapp || contact.phone;
      const whatsappUrl = `https://wa.me/${phone.replace(
        /[^0-9+]/g,
        ""
      )}?text=${encodeURIComponent(reportMessage)}`;
      window.open(whatsappUrl, "_blank");
    } else if (method === "call") {
      const phone = contact.phone;
      window.location.href = `tel:${phone}`;
    }
  };

  const getRiskLevelColor = () => {
    switch (analysisResult?.riskLevel) {
      case "safe":
        return "success";
      case "likely-scam":
        return "warning";
      case "scam":
        return "danger";
      default:
        return "default";
    }
  };

  const getRiskLevelIcon = () => {
    switch (analysisResult?.riskLevel) {
      case "safe":
        return <FiCheckCircle className="w-6 h-6" />;
      case "likely-scam":
        return <FiAlertTriangle className="w-6 h-6" />;
      case "scam":
        return <FiAlertOctagon className="w-6 h-6" />;
      default:
        return null;
    }
  };

  const getRiskLevelText = () => {
    switch (analysisResult?.riskLevel) {
      case "safe":
        return {
          title: "Message is Safe",
          description: "This message appears to be legitimate.",
        };
      case "likely-scam":
        return {
          title: "Likely Scam",
          description: "This message shows suspicious signs. Be cautious.",
        };
      case "scam":
        return {
          title: "Scam Detected",
          description: "This message is highly likely to be a scam.",
        };
      default:
        return { title: "", description: "" };
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-emerald-600 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-background-200 to-background-100 py-6 sm:py-12 px-4 sm:px-6"
      style={{ fontSize: getFontSize() }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1
            className={`${getHeadingClass(
              3
            )} font-bold text-emerald-900 mb-2 sm:mb-3`}
          >
            Welcome, {session?.user?.name || "User"}! 👋
          </h1>
          <p className="text-sm sm:text-lg text-emerald-700">
            Paste a message below to check if it's safe or a potential scam
          </p>
        </div>

        {/* Main Content Grid - Two columns on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Input Card - Left column */}
          <Card className="border-2 border-emerald-200 bg-white shadow-lg">
            <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 sm:p-6 text-white">
              <h2 className={`${getHeadingClass(2)} font-bold`}>
                Check a Message
              </h2>
            </CardHeader>

            <CardBody className="p-4 sm:p-8 space-y-4 sm:space-y-6">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-emerald-900 mb-2 sm:mb-3">
                  Paste your message here:
                </label>
                <Textarea
                  placeholder="Enter or paste the message you want to check..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  minRows={5}
                  className="w-full text-sm sm:text-base"
                  variant="bordered"
                />
              </div>

              <Button
                onClick={handleAnalyzeMessage}
                isLoading={loading}
                disabled={loading || !message.trim()}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold py-4 sm:py-6 text-base sm:text-lg"
                endContent={!loading && <FiSend />}
              >
                {loading ? "Analyzing..." : "Analyze Message"}
              </Button>
            </CardBody>
          </Card>

          {/* Results Section - Right column */}
          <div>
            {loading ? (
              // Loading animation with skeleton
              <Card className="border-2 border-gray-200 bg-white shadow-lg h-full">
                <CardBody className="p-4 sm:p-8 space-y-4 sm:space-y-6">
                  {/* Centered Loading Animation */}
                  <div className="flex flex-col items-center justify-center gap-3 py-6">
                    <div>
                      <img
                        src="/images/Loading.gif"
                        alt="Loading..."
                        className="w-16 h-16 sm:w-20 sm:h-20"
                      />
                    </div>
                    <p className="text-emerald-600 font-semibold text-sm sm:text-base">
                      Analyzing message...
                    </p>
                    <p className="text-emerald-500 text-xs sm:text-sm">
                      Time taken: {elapsedTime}s
                    </p>
                  </div>

                  {/* Skeleton placeholders */}
                  <Skeleton className="w-1/2 h-8 rounded-lg" />
                  <Skeleton className="w-full h-6 rounded-lg" />
                  <Skeleton className="w-full h-20 rounded-lg" />
                  <Skeleton className="w-full h-6 rounded-lg" />
                  <Skeleton className="w-full h-12 rounded-lg" />
                </CardBody>
              </Card>
            ) : analysisResult ? (
              // Analysis Result
              <Card
                className={`border-2 shadow-lg h-full ${
                  analysisResult.riskLevel === "safe"
                    ? "border-green-300 bg-green-50"
                    : analysisResult.riskLevel === "likely-scam"
                    ? "border-yellow-300 bg-yellow-50"
                    : "border-red-300 bg-red-50"
                }`}
              >
                <CardHeader
                  className={`p-4 sm:p-6 text-white ${
                    analysisResult.riskLevel === "safe"
                      ? "bg-green-500"
                      : analysisResult.riskLevel === "likely-scam"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    {getRiskLevelIcon()}
                    <h2 className={`${getHeadingClass(2)} font-bold`}>
                      {getRiskLevelText().title}
                    </h2>
                  </div>
                </CardHeader>

                <CardBody className="p-4 sm:p-8 space-y-4 sm:space-y-6">
                  {/* Risk Description */}
                  <div>
                    <p
                      className={`text-lg font-semibold mb-2 ${
                        analysisResult.riskLevel === "safe"
                          ? "text-green-900"
                          : analysisResult.riskLevel === "likely-scam"
                          ? "text-yellow-900"
                          : "text-red-900"
                      }`}
                    >
                      {getRiskLevelText().description}
                    </p>
                  </div>

                  {/* Message Content */}
                  <div className="bg-white p-3 sm:p-4 rounded-lg border-2 border-gray-200">
                    <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-2">
                      Message Content:
                    </p>
                    <p className="text-xs sm:text-sm text-gray-800 whitespace-pre-wrap break-words">
                      {analysisResult.message}
                    </p>
                    {analysisResult.wasTranslated && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-blue-600 font-semibold mb-1">
                          🌐 Translated to English for analysis:
                        </p>
                        <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap break-words italic">
                          {analysisResult.messageToAnalyze}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Links Analysis */}
                  {analysisResult.urls.length > 0 && (
                    <div>
                      <h3
                        className={`${getHeadingClass(
                          2
                        )} font-semibold mb-3 sm:mb-4 flex items-center gap-2`}
                      >
                        <FiLink2 /> Links Found ({analysisResult.urls.length})
                      </h3>
                      <div className="space-y-2 sm:space-y-3">
                        {analysisResult.urls.map((link, idx) => (
                          <div key={idx}>
                            {link.httpWarning && (
                              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-2 sm:p-3 mb-2 rounded">
                                <p className="text-xs sm:text-sm text-yellow-800">
                                  {link.httpWarning}
                                </p>
                              </div>
                            )}
                            <div
                              className={`p-3 sm:p-4 rounded-lg border-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 ${
                                link.isSafe
                                  ? "bg-green-50 border-green-300"
                                  : "bg-red-50 border-red-300"
                              }`}
                            >
                              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                {link.isSafe ? (
                                  <FiCheckCircle className="w-4 sm:w-5 h-4 sm:h-5 text-green-600 flex-shrink-0" />
                                ) : (
                                  <FiAlertOctagon className="w-4 sm:w-5 h-4 sm:h-5 text-red-600 flex-shrink-0" />
                                )}
                                <p className="text-xs sm:text-sm text-gray-700 break-all">
                                  {link.url}
                                </p>
                              </div>
                              <Chip
                                size="sm"
                                color={link.isSafe ? "success" : "danger"}
                                className="flex-shrink-0 w-fit"
                              >
                                {link.isSafe ? "Safe" : "Unsafe"}
                              </Chip>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons for Suspicious Messages */}
                  {(analysisResult.riskLevel === "likely-scam" ||
                    analysisResult.riskLevel === "scam") && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-3 sm:p-4 rounded">
                      <h3
                        className={`${getHeadingClass(
                          2
                        )} font-semibold text-red-900 mb-3 sm:mb-4`}
                      >
                        Alert All Emergency Contacts (
                        {userProfile?.emergencyContacts?.length || 0})
                      </h3>
                      <div className="space-y-4">
                        {userProfile?.emergencyContacts &&
                        userProfile.emergencyContacts.length > 0 ? (
                          userProfile.emergencyContacts.map(
                            (contact, index) => (
                              <div
                                key={index}
                                className="bg-white p-3 rounded-lg border border-red-200"
                              >
                                <p className="text-sm font-semibold text-red-900 mb-2">
                                  {contact.name}
                                </p>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() =>
                                      handleEmergencyContact(
                                        "whatsapp",
                                        contact
                                      )
                                    }
                                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-2 text-xs sm:text-sm"
                                    startContent={<FaWhatsapp size={16} />}
                                  >
                                    WhatsApp
                                  </Button>
                                  <Button
                                    onClick={() =>
                                      handleEmergencyContact("call", contact)
                                    }
                                    className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold py-2 text-xs sm:text-sm"
                                    startContent={<FiPhone size={16} />}
                                  >
                                    Call
                                  </Button>
                                </div>
                              </div>
                            )
                          )
                        ) : (
                          <p className="text-red-600 text-sm">
                            No emergency contacts set up
                          </p>
                        )}
                      </div>

                      <Button
                        onClick={handleReportScam}
                        className="w-full mt-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold py-3 sm:py-4 text-sm sm:text-base"
                        variant="flat"
                      >
                        Report This Scam
                      </Button>
                    </div>
                  )}

                  {/* Safe Message Message */}
                  {analysisResult.riskLevel === "safe" && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-3 sm:p-4 rounded">
                      <p className="text-xs sm:text-sm text-green-900 font-semibold">
                        ✓ This message appears safe. You can safely interact
                        with it.
                      </p>
                    </div>
                  )}
                </CardBody>
              </Card>
            ) : (
              // Empty state
              <Card className="border-2 border-gray-200 bg-white shadow-lg h-full flex items-center justify-center">
                <CardBody className="p-4 sm:p-8 text-center">
                  <p className="text-emerald-600 text-sm sm:text-base">
                    Analyze a message to see results here
                  </p>
                </CardBody>
              </Card>
            )}
          </div>
        </div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <Card className="border border-emerald-200 bg-white">
            <CardBody className="p-4 sm:p-6">
              <h3 className="font-bold text-emerald-900 mb-2 sm:mb-3 text-base sm:text-lg">
                📱 Quick Tips
              </h3>
              <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-emerald-700">
                <li>• Never click links from unknown senders</li>
                <li>• Check sender details carefully</li>
                <li>• Ask family to verify unusual requests</li>
                <li>• Report suspicious messages</li>
              </ul>
            </CardBody>
          </Card>

          <Card className="border border-emerald-200 bg-white">
            <CardBody className="p-4 sm:p-6">
              <h3 className="font-bold text-emerald-900 mb-2 sm:mb-3 text-base sm:text-lg">
                ⚙️ Settings
              </h3>
              <Button
                onClick={() => router.push("/profile")}
                variant="flat"
                className="w-full border-2 border-emerald-300 text-emerald-700 font-semibold py-3 sm:py-4 text-sm sm:text-base"
              >
                Manage Profile & Contacts
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
