"use client";

import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Select,
  SelectItem,
  Progress,
} from "@heroui/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useFontSize } from "@/components/Navbar";
import { FiArrowRight, FiCheck } from "react-icons/fi";

export default function ProfileSetupPage() {
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

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    age: "",
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactWhatsapp: "",
  });

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/dashboard");
      } else {
        alert("Failed to save profile. Please try again.");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Progress isIndeterminate aria-label="Loading..." className="w-1/2" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-background-200 to-background-100 py-12 px-4"
      style={{ fontSize: getFontSize() }}
    >
      <div className="max-w-2xl mx-auto">
        <Card className="border-2 border-emerald-200 bg-white shadow-xl">
          <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 p-8 text-white">
            <div className="w-full">
              <h1 className={`${getHeadingClass(3)} font-bold mb-2`}>
                Complete Your Profile
              </h1>
              <p className="text-emerald-50">
                Help us set up emergency contacts to protect you
              </p>
            </div>
          </CardHeader>

          <CardBody className="p-8">
            {/* Progress Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2
                  className={`${getHeadingClass(
                    2
                  )} font-semibold text-emerald-900`}
                >
                  Personal Information
                </h2>
                <span className="text-sm text-emerald-600 font-semibold">
                  Step 1 of 1
                </span>
              </div>
              <Progress value={100} className="h-2" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-emerald-900 mb-4">
                  Your Details
                </h3>

                <Select
                  label="Age Group"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="Select your age group"
                  required
                  className="w-full"
                >
                  <SelectItem key="60-65">60-65 years</SelectItem>
                  <SelectItem key="65-70">65-70 years</SelectItem>
                  <SelectItem key="70-75">70-75 years</SelectItem>
                  <SelectItem key="75-80">75-80 years</SelectItem>
                  <SelectItem key="80-plus">80+ years</SelectItem>
                </Select>

                <Input
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your address"
                  type="text"
                  required
                />
              </div>

              {/* Emergency Contact Section */}
              <div className="space-y-4 border-t-2 border-emerald-200 pt-6">
                <h3 className="text-lg font-semibold text-emerald-900 mb-4">
                  Emergency Contact Details
                </h3>
                <p className="text-emerald-700 text-sm">
                  This person will be notified in case of suspicious messages.
                  Usually a family member or caregiver.
                </p>

                <Input
                  label="Emergency Contact Name"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                  placeholder="Full name of emergency contact"
                  type="text"
                  required
                />

                <Input
                  label="Emergency Contact Phone (WhatsApp)"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                  placeholder="E.g., +91XXXXXXXXXX"
                  type="tel"
                  required
                  description="This number will be used to send alerts via WhatsApp"
                />

                <Input
                  label="Emergency Contact WhatsApp Number (Optional)"
                  name="emergencyContactWhatsapp"
                  value={formData.emergencyContactWhatsapp}
                  onChange={handleChange}
                  placeholder="E.g., +91XXXXXXXXXX"
                  type="tel"
                  description="If different from the phone number above"
                />
              </div>

              {/* Safety Notice */}
              <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded">
                <h4 className="font-semibold text-emerald-900 mb-2">
                  🔒 Your Privacy is Protected
                </h4>
                <ul className="text-sm text-emerald-700 space-y-1">
                  <li>• Your data is encrypted and securely stored</li>
                  <li>• Emergency contacts are only used for alerts</li>
                  <li>• You can update your details anytime</li>
                </ul>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-6">
                <Button
                  onClick={() => router.push("/")}
                  variant="bordered"
                  className="border-2 border-emerald-300 text-emerald-700 font-semibold flex-1 py-6 text-lg"
                >
                  Go Back
                </Button>
                <Button
                  type="submit"
                  isLoading={loading}
                  disabled={loading}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold flex-1 py-6 text-lg"
                  endContent={!loading && <FiArrowRight />}
                >
                  {loading ? "Saving..." : "Continue to Dashboard"}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
