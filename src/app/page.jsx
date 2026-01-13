"use client";

import React from "react";
import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useFontSize } from "@/components/Navbar";
import {
  FiShield,
  FiAlertTriangle,
  FiPhone,
  FiCheck,
  FiArrowRight,
} from "react-icons/fi";

export default function HomePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { fontSizeMap, fontSize } = useFontSize();

  // Dynamically adjust heading sizes based on font size context
  const getHeadingClass = (baseSize) => {
    const sizeMap = {
      small: {
        4: "text-2xl",
        5: "text-3xl",
        3: "text-xl",
        2: "text-lg",
      },
      base: {
        4: "text-4xl",
        5: "text-5xl",
        3: "text-3xl",
        2: "text-2xl",
      },
      large: {
        4: "text-5xl",
        5: "text-6xl",
        3: "text-4xl",
        2: "text-3xl",
      },
      xl: {
        4: "text-6xl",
        5: "text-6xl",
        3: "text-5xl",
        2: "text-4xl",
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

  return (
    <div className="min-h-screen" style={{ fontSize: getFontSize() }}>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 py-16 px-4 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <img
                src="/images/Logo.png"
                alt="ElderGuard Logo"
                className="h-20 md:h-32"
              />
            </div>
            <h1
              className={`${getHeadingClass(4)} md:${getHeadingClass(
                5
              )} font-bold text-emerald-900 mb-4`}
            >
              ElderGuard
            </h1>
            <p
              className={`${
                fontSize === "small"
                  ? "text-sm"
                  : fontSize === "large"
                  ? "text-lg"
                  : fontSize === "xl"
                  ? "text-xl"
                  : "text-base"
              } text-emerald-700 mb-8 max-w-3xl mx-auto`}
            >
              Protect yourself and your loved ones from fraudulent messages and
              online scams. Our AI-powered technology instantly analyzes
              messages and verifies links to keep you safe.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              {session ? (
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold px-8 py-6 text-lg"
                  endContent={<FiArrowRight />}
                >
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => router.push("/login")}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold px-8 py-6 text-lg"
                    endContent={<FiArrowRight />}
                  >
                    Get Started
                  </Button>
                  <Button
                    variant="bordered"
                    className="border-2 border-emerald-500 text-emerald-700 font-semibold px-8 py-6 text-lg hover:bg-emerald-50"
                    onClick={() => {
                      document.getElementById("features").scrollIntoView({
                        behavior: "smooth",
                      });
                    }}
                  >
                    Learn More
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
              <CardBody className="text-center p-8">
                <div
                  className={`${getHeadingClass(
                    4
                  )} font-bold text-emerald-600 mb-2`}
                >
                  1M+
                </div>
                <p className="text-emerald-700 font-semibold">
                  Messages Analyzed
                </p>
              </CardBody>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
              <CardBody className="text-center p-8">
                <div
                  className={`${getHeadingClass(
                    4
                  )} font-bold text-emerald-600 mb-2`}
                >
                  98%
                </div>
                <p className="text-emerald-700 font-semibold">
                  Detection Accuracy
                </p>
              </CardBody>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
              <CardBody className="text-center p-8">
                <div
                  className={`${getHeadingClass(
                    4
                  )} font-bold text-emerald-600 mb-2`}
                >
                  24/7
                </div>
                <p className="text-emerald-700 font-semibold">
                  Protection Active
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-16 px-4 bg-gradient-to-b from-background-200 to-background-100"
      >
        <div className="max-w-6xl mx-auto">
          <h2
            className={`${getHeadingClass(3)} md:${getHeadingClass(
              4
            )} font-bold text-center text-emerald-900 mb-12`}
          >
            How ElderGuard Protects You
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <Card className="border border-emerald-200 bg-white hover:shadow-lg transition-shadow">
              <CardBody className="p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-700 p-3">
                    <FiShield size={24} />
                  </div>
                  <div>
                    <h3
                      className={`${getHeadingClass(
                        2
                      )} font-bold text-emerald-900 mb-2`}
                    >
                      Message Analysis
                    </h3>
                    <p className="text-emerald-700">
                      Our advanced AI analyzes every message to detect
                      suspicious content, phishing attempts, and scam patterns
                      in real-time.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Feature 2 */}
            <Card className="border border-emerald-200 bg-white hover:shadow-lg transition-shadow">
              <CardBody className="p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-700 p-3">
                    <FiAlertTriangle size={24} />
                  </div>
                  <div>
                    <h3
                      className={`${getHeadingClass(
                        2
                      )} font-bold text-emerald-900 mb-2`}
                    >
                      Link Verification
                    </h3>
                    <p className="text-emerald-700">
                      Every link is scanned against a database of known
                      malicious sites to ensure your safety before you click.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Feature 3 */}
            <Card className="border border-emerald-200 bg-white hover:shadow-lg transition-shadow">
              <CardBody className="p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-700 p-3">
                    <FiPhone size={24} />
                  </div>
                  <div>
                    <h3
                      className={`${getHeadingClass(
                        2
                      )} font-bold text-emerald-900 mb-2`}
                    >
                      Emergency Contact
                    </h3>
                    <p className="text-emerald-700">
                      One-click emergency contact via WhatsApp to instantly
                      alert your trusted family member or caregiver.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Feature 4 */}
            <Card className="border border-emerald-200 bg-white hover:shadow-lg transition-shadow">
              <CardBody className="p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-700 p-3">
                    <FiCheck size={24} />
                  </div>
                  <div>
                    <h3
                      className={`${getHeadingClass(
                        2
                      )} font-bold text-emerald-900 mb-2`}
                    >
                      Simple & Accessible
                    </h3>
                    <p className="text-emerald-700">
                      Designed with seniors in mind. Large, clear text, easy
                      navigation, and adjustable font sizes for comfortable use.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* Risk Levels Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2
            className={`${getHeadingClass(3)} md:${getHeadingClass(
              4
            )} font-bold text-center text-emerald-900 mb-12`}
          >
            Understanding Risk Levels
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Safe */}
            <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader className="bg-green-200 p-6">
                <h3
                  className={`${getHeadingClass(3)} font-bold text-green-900`}
                >
                  ✓ Safe
                </h3>
              </CardHeader>
              <CardBody className="p-6">
                <p className="text-green-800 font-semibold mb-2">
                  Message Safe • Links Safe
                </p>
                <p className="text-green-700">
                  The message content is legitimate and all links are verified
                  as safe. It's perfectly fine to engage with this message.
                </p>
              </CardBody>
            </Card>

            {/* Likely Scam */}
            <Card className="border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50">
              <CardHeader className="bg-yellow-200 p-6">
                <h3
                  className={`${getHeadingClass(3)} font-bold text-yellow-900`}
                >
                  ⚠️ Likely Scam
                </h3>
              </CardHeader>
              <CardBody className="p-6">
                <p className="text-yellow-800 font-semibold mb-2">
                  Message Safe • Links Unsafe OR Message Unsafe • Links Safe
                </p>
                <p className="text-yellow-700">
                  There are suspicious indicators. Use caution. Consider
                  contacting your emergency contact for verification.
                </p>
              </CardBody>
            </Card>

            {/* Scam */}
            <Card className="border-2 border-red-300 bg-gradient-to-br from-red-50 to-rose-50 md:col-span-2">
              <CardHeader className="bg-red-200 p-6">
                <h3 className={`${getHeadingClass(3)} font-bold text-red-900`}>
                  🚫 Scam
                </h3>
              </CardHeader>
              <CardBody className="p-6">
                <p className="text-red-800 font-semibold mb-2">
                  Message Unsafe • Links Unsafe
                </p>
                <p className="text-red-700">
                  This is highly likely to be a scam or malicious attempt. Do
                  NOT click any links. Immediately alert your emergency contact
                  for guidance.
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-emerald-500 to-teal-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2
            className={`${getHeadingClass(3)} md:${getHeadingClass(
              4
            )} font-bold text-white mb-4`}
          >
            Start Protecting Yourself Today
          </h2>
          <p className="text-lg text-emerald-50 mb-8">
            Join thousands of seniors who trust ElderGuard to keep them safe
            from fraud and scams.
          </p>
          {!session && (
            <Button
              onClick={() => router.push("/login")}
              className="bg-white text-emerald-600 font-bold px-8 py-6 text-lg hover:bg-gray-100"
            >
              Get Started Free
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
