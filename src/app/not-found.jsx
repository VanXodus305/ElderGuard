"use client";

import React from "react";
import { Button, Card, CardBody } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useFontSize } from "@/components/Navbar";

const NotFound = () => {
  const router = useRouter();
  const { fontSizeMap, fontSize } = useFontSize();

  // Dynamically adjust heading sizes based on font size context
  const getHeadingClass = (baseSize) => {
    const sizeMap = {
      small: {
        2: "text-lg",
        3: "text-xl",
        4: "text-2xl",
      },
      base: {
        2: "text-2xl",
        3: "text-3xl",
        4: "text-4xl",
      },
      large: {
        2: "text-3xl",
        3: "text-4xl",
        4: "text-5xl",
      },
      xl: {
        2: "text-4xl",
        3: "text-5xl",
        4: "text-6xl",
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
    <div
      className="min-h-screen bg-gradient-to-b from-background-200 to-background-100 flex items-center justify-center px-4"
      style={{ fontSize: getFontSize() }}
    >
      <Card className="max-w-md w-full border-2 border-emerald-200 bg-white">
        <CardBody className="p-12 text-center space-y-6">
          <div className="text-6xl">🔍</div>
          <div>
            <h1
              className={`${getHeadingClass(
                4
              )} font-bold text-emerald-900 mb-2`}
            >
              404
            </h1>
            <p className={`${getHeadingClass(2)} text-emerald-700 mb-2`}>
              Page Not Found
            </p>
            <p className="text-emerald-600">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          <div className="flex gap-3 flex-col">
            <Button
              onClick={() => router.push("/")}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold py-6 text-lg"
            >
              Go Home
            </Button>
            <Button
              onClick={() => router.back()}
              variant="bordered"
              className="border-2 border-emerald-300 text-emerald-700 font-semibold py-6 text-lg"
            >
              Go Back
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default NotFound;
