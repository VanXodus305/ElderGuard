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

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, router]);

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

  // Extract URLs from message
  const extractUrls = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex) || [];
  };

  const handleAnalyzeMessage = async () => {
    if (!message.trim()) {
      alert("Please enter a message to analyze");
      return;
    }

    setLoading(true);

    try {
      const urls = extractUrls(message);

      // Simulate ML model analysis - replace with actual API call later
      const messageIsSafe = Math.random() > 0.3; // 70% chance of safe message (placeholder)

      // Simulate link scanning - replace with VirusTotal API call later
      const linkScores = urls.map((url) => ({
        url,
        isSafe: Math.random() > 0.4, // 60% chance of safe link (placeholder)
      }));

      const hasUnsafeLink = linkScores.some((link) => !link.isSafe);

      // Determine risk level
      let riskLevel = "safe";
      if (messageIsSafe && !hasUnsafeLink) {
        riskLevel = "safe";
      } else if (!messageIsSafe && hasUnsafeLink) {
        riskLevel = "scam";
      } else {
        riskLevel = "likely-scam";
      }

      setAnalysisResult({
        message,
        messageIsSafe,
        urls: linkScores,
        riskLevel,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error analyzing message:", error);
      alert("Failed to analyze message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyContact = (method) => {
    if (!userProfile?.emergencyContactPhone) {
      alert("Please set up an emergency contact first");
      router.push("/profile");
      return;
    }

    const phone =
      userProfile.emergencyContactWhatsapp || userProfile.emergencyContactPhone;

    if (method === "whatsapp") {
      const whatsappUrl = `https://wa.me/${phone.replace(
        /[^0-9+]/g,
        ""
      )}?text=ALERT: I received a suspicious message. Please help me verify if it's safe.`;
      window.open(whatsappUrl, "_blank");
    } else if (method === "call") {
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
          title: "✓ Message is Safe",
          description: "This message appears to be legitimate.",
        };
      case "likely-scam":
        return {
          title: "⚠️ Likely Scam",
          description: "This message shows suspicious signs. Be cautious.",
        };
      case "scam":
        return {
          title: "🚫 Scam Detected",
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
      className="min-h-screen bg-gradient-to-b from-background-200 to-background-100 py-12 px-4"
      style={{ fontSize: getFontSize() }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-emerald-900 mb-2">
            Welcome, {session?.user?.name || "User"}! 👋
          </h1>
          <p className="text-lg text-emerald-700">
            Paste a message below to check if it's safe or a potential scam
          </p>
        </div>

        {/* Input Card */}
        <Card className="border-2 border-emerald-200 bg-white shadow-lg mb-8">
          <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
            <h2 className={`${getHeadingClass(2)} font-bold`}>
              Check a Message
            </h2>
          </CardHeader>

          <CardBody className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-emerald-900 mb-3">
                Paste your message here:
              </label>
              <Textarea
                placeholder="Enter or paste the message you want to check..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                minRows={6}
                className="w-full"
                variant="bordered"
              />
            </div>

            <Button
              onClick={handleAnalyzeMessage}
              isLoading={loading}
              disabled={loading || !message.trim()}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold py-6 text-lg"
              endContent={!loading && <FiSend />}
            >
              {loading ? "Analyzing..." : "Analyze Message"}
            </Button>
          </CardBody>
        </Card>

        {/* Analysis Result */}
        {analysisResult && (
          <Card
            className={`border-2 shadow-lg mb-8 ${
              analysisResult.riskLevel === "safe"
                ? "border-green-300 bg-green-50"
                : analysisResult.riskLevel === "likely-scam"
                ? "border-yellow-300 bg-yellow-50"
                : "border-red-300 bg-red-50"
            }`}
          >
            <CardHeader
              className={`p-6 text-white ${
                analysisResult.riskLevel === "safe"
                  ? "bg-green-500"
                  : analysisResult.riskLevel === "likely-scam"
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
            >
              <div className="flex items-center gap-3">
                {getRiskLevelIcon()}
                <h2 className={`${getHeadingClass(2)} font-bold`}>
                  {getRiskLevelText().title}
                </h2>
              </div>
            </CardHeader>

            <CardBody className="p-8 space-y-6">
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
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                <p className="text-sm text-gray-600 font-semibold mb-2">
                  Message Content:
                </p>
                <p className="text-gray-800 whitespace-pre-wrap">
                  {analysisResult.message}
                </p>
              </div>

              {/* Links Analysis */}
              {analysisResult.urls.length > 0 && (
                <div>
                  <h3
                    className={`${getHeadingClass(
                      2
                    )} font-semibold mb-4 flex items-center gap-2`}
                  >
                    <FiLink2 /> Links Found ({analysisResult.urls.length})
                  </h3>
                  <div className="space-y-3">
                    {analysisResult.urls.map((link, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg border-2 flex items-center justify-between ${
                          link.isSafe
                            ? "bg-green-50 border-green-300"
                            : "bg-red-50 border-red-300"
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {link.isSafe ? (
                            <FiCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                          ) : (
                            <FiAlertOctagon className="w-5 h-5 text-red-600 flex-shrink-0" />
                          )}
                          <p className="text-sm text-gray-700 truncate break-all">
                            {link.url}
                          </p>
                        </div>
                        <Chip
                          size="sm"
                          color={link.isSafe ? "success" : "danger"}
                          className="ml-2 flex-shrink-0"
                        >
                          {link.isSafe ? "Safe" : "Unsafe"}
                        </Chip>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons for Suspicious Messages */}
              {(analysisResult.riskLevel === "likely-scam" ||
                analysisResult.riskLevel === "scam") && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <h3
                    className={`${getHeadingClass(
                      2
                    )} font-semibold text-red-900 mb-4`}
                  >
                    Alert Your Emergency Contact
                  </h3>
                  <div className="flex gap-4">
                    <Button
                      onClick={() => handleEmergencyContact("whatsapp")}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-4"
                      startContent={<FiMessageCircle />}
                    >
                      Message via WhatsApp
                    </Button>
                    <Button
                      onClick={() => handleEmergencyContact("call")}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold py-4"
                      startContent={<FiPhone />}
                    >
                      Call {userProfile?.emergencyContactName || "Contact"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Safe Message Message */}
              {analysisResult.riskLevel === "safe" && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                  <p className="text-green-900 font-semibold">
                    ✓ This message appears safe. You can safely interact with
                    it.
                  </p>
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border border-emerald-200 bg-white">
            <CardBody className="p-6">
              <h3 className="font-bold text-emerald-900 mb-3">📱 Quick Tips</h3>
              <ul className="space-y-2 text-sm text-emerald-700">
                <li>• Never click links from unknown senders</li>
                <li>• Check sender details carefully</li>
                <li>• Ask family to verify unusual requests</li>
                <li>• Report suspicious messages</li>
              </ul>
            </CardBody>
          </Card>

          <Card className="border border-emerald-200 bg-white">
            <CardBody className="p-6">
              <h3 className="font-bold text-emerald-900 mb-3">⚙️ Settings</h3>
              <Button
                onClick={() => router.push("/profile")}
                variant="flat"
                className="w-full border-2 border-emerald-300 text-emerald-700 font-semibold"
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
