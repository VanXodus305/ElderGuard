"use client";

import React from "react";
import { Button, Card, CardBody, CardHeader, Divider } from "@heroui/react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useFontSize } from "@/components/Navbar";
import { FiGithub, FiArrowLeft } from "react-icons/fi";

export default function LoginPage() {
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

  React.useEffect(() => {
    if (status === "authenticated") {
      if (session.user.profileComplete) {
        router.push("/dashboard");
      } else {
        router.push("/profile-setup");
      }
    }
  }, [status, session, router]);

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ fontSize: getFontSize() }}
    >
      <div className="w-full max-w-md mt-10">
        <Card className="border-2 border-emerald-200 bg-white shadow-xl">
          <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 p-8 text-white">
            <div className="w-full">
              <button
                onClick={() => router.push("/")}
                className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity mb-4"
              >
                <FiArrowLeft size={20} />
                Back Home
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl">
                  🛡️
                </div>
                <div>
                  <h1 className={`${getHeadingClass(2)} font-bold`}>
                    ElderGuard
                  </h1>
                  <p className="text-emerald-50 text-sm">Stay Safe Online</p>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardBody className="p-8">
            <div className="text-center mb-8">
              <h2
                className={`${getHeadingClass(
                  2
                )} font-bold text-emerald-900 mb-2`}
              >
                Welcome Back
              </h2>
              <p className="text-emerald-700">
                Sign in to access your personal safety dashboard
              </p>
            </div>

            <Button
              onClick={handleGoogleSignIn}
              className={`w-full bg-white border-2 border-emerald-300 text-emerald-700 font-semibold py-6 ${
                fontSize === "small"
                  ? "text-sm"
                  : fontSize === "large"
                  ? "text-base"
                  : fontSize === "xl"
                  ? "text-lg"
                  : "text-base"
              } hover:bg-emerald-50 transition-colors`}
              startContent={
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              }
            >
              Sign In with Google
            </Button>

            <Divider className="my-6" />

            <div className="text-center text-emerald-700 text-sm">
              <p className="mb-2">First time here? No account needed!</p>
              <p>
                Just sign in with Google and set up your profile to get started.
              </p>
            </div>

            <div className="mt-8 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <h3
                className={`${getHeadingClass(
                  2
                )} font-semibold text-emerald-900 mb-3`}
              >
                Why Sign In?
              </h3>
              <ul className="space-y-2 text-sm text-emerald-700">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Save your emergency contacts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Get personalized protection</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Quick emergency alerts</span>
                </li>
              </ul>
            </div>
          </CardBody>
        </Card>

        <div className="mt-6 text-center text-emerald-700 text-sm">
          <p>We only use your email and name. Your privacy is our priority.</p>
        </div>
      </div>
    </div>
  );
}
