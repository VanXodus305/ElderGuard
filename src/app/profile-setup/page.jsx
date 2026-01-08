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
  Checkbox,
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
    emergencyContacts: [{ name: "", phone: "", whatsapp: "" }],
  });
  const [sameAsPhoneIndexes, setSameAsPhoneIndexes] = useState(new Set());

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      if (session?.user?.profileComplete === true) {
        router.push("/dashboard");
      }
    }
  }, [status, session, router]);

  const handleChange = (e, contactIndex = null) => {
    let name, value;

    if (e.target.name !== undefined) {
      name = e.target.name;
      value = e.target.value;
    } else if (typeof e === "object" && e.key !== undefined) {
      name = e.currentKey ? Object.keys(e)[0] : "age";
      value = Array.from(e)[0]?.[0] || e.toString();
    } else {
      name = e?.target?.name;
      value = e?.target?.value;
    }

    if (name) {
      setFormData((prev) => {
        if (contactIndex !== null) {
          // Handle emergency contact field changes
          const updated = { ...prev };
          updated.emergencyContacts[contactIndex][name] = value;
          // If phone changes and sameAsPhone is checked, update WhatsApp
          if (name === "phone" && sameAsPhoneIndexes.has(contactIndex)) {
            updated.emergencyContacts[contactIndex].whatsapp = value;
          }
          return updated;
        } else {
          // Handle age/address changes
          return { ...prev, [name]: value };
        }
      });
    }
  };

  const handleSameAsPhoneChange = (contactIndex) => {
    setSameAsPhoneIndexes((prev) => {
      const updated = new Set(prev);
      if (updated.has(contactIndex)) {
        updated.delete(contactIndex);
        setFormData((prevData) => {
          const updated = { ...prevData };
          updated.emergencyContacts[contactIndex].whatsapp = "";
          return updated;
        });
      } else {
        updated.add(contactIndex);
        setFormData((prevData) => {
          const updated = { ...prevData };
          updated.emergencyContacts[contactIndex].whatsapp =
            updated.emergencyContacts[contactIndex].phone;
          return updated;
        });
      }
      return updated;
    });
  };

  const addEmergencyContact = () => {
    setFormData((prev) => ({
      ...prev,
      emergencyContacts: [
        ...prev.emergencyContacts,
        { name: "", phone: "", whatsapp: "" },
      ],
    }));
  };

  const removeEmergencyContact = (index) => {
    if (formData.emergencyContacts.length > 1) {
      setFormData((prev) => ({
        ...prev,
        emergencyContacts: prev.emergencyContacts.filter((_, i) => i !== index),
      }));
      setSameAsPhoneIndexes((prev) => {
        const updated = new Set(prev);
        updated.delete(index);
        return updated;
      });
    }
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
      className="min-h-screen bg-gradient-to-b from-background-200 to-background-100 py-6 sm:py-12 px-4 sm:px-6"
      style={{ fontSize: getFontSize() }}
    >
      <div className="w-full max-w-2xl mx-auto">
        <Card className="border-2 border-emerald-200 bg-white shadow-xl">
          <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 sm:p-8 text-white">
            <div className="w-full">
              <h1 className={`${getHeadingClass(3)} font-bold mb-1 sm:mb-2`}>
                Complete Your Profile
              </h1>
              <p className="text-emerald-50 text-sm sm:text-base">
                Help us set up emergency contacts to protect you
              </p>
            </div>
          </CardHeader>

          <CardBody className="p-4 sm:p-8">
            {/* Progress Section */}
            <div className="mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
                <h2
                  className={`${getHeadingClass(
                    2
                  )} font-semibold text-emerald-900`}
                >
                  Personal Information
                </h2>
                <span className="text-xs sm:text-sm text-emerald-600 font-semibold whitespace-nowrap">
                  Step 1 of 1
                </span>
              </div>
              <Progress value={100} className="h-2" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Details */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-semibold text-emerald-900 mb-4">
                  Your Details
                </h3>

                <Select
                  label="Age Group"
                  name="age"
                  selectedKeys={formData.age ? [formData.age] : []}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      age: e.target.value,
                    }));
                  }}
                  placeholder="Select your age group"
                  isRequired
                  className="w-full"
                >
                  <SelectItem key="50-55">50-55 years</SelectItem>
                  <SelectItem key="55-60">55-60 years</SelectItem>
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
                  isRequired
                />
              </div>

              {/* Emergency Contact Section */}
              <div className="space-y-4 border-t-2 border-emerald-200 pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-emerald-900 mb-1">
                      Emergency Contacts
                    </h3>
                    <p className="text-emerald-700 text-xs sm:text-sm">
                      Add multiple contacts to be notified of suspicious
                      messages
                    </p>
                  </div>
                </div>

                {formData.emergencyContacts.map((contact, index) => (
                  <div
                    key={index}
                    className="bg-emerald-50 p-4 rounded-lg border-2 border-emerald-200 space-y-3"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-emerald-900">
                        Contact {index + 1}
                      </span>
                      {formData.emergencyContacts.length > 1 && (
                        <Button
                          isIconOnly
                          className="bg-red-100 text-red-600 hover:bg-red-200"
                          onClick={() => removeEmergencyContact(index)}
                          size="sm"
                        >
                          ✕
                        </Button>
                      )}
                    </div>

                    <Input
                      label="Name"
                      name="name"
                      value={contact.name}
                      onChange={(e) => handleChange(e, index)}
                      placeholder="Full name"
                      type="text"
                      isRequired
                    />

                    <Input
                      label="Phone Number"
                      name="phone"
                      value={contact.phone}
                      onChange={(e) => handleChange(e, index)}
                      placeholder="E.g., +91XXXXXXXXXX"
                      type="tel"
                      isRequired
                      description="Contact number for alerts"
                    />

                    <div className="space-y-3">
                      <Checkbox
                        checked={sameAsPhoneIndexes.has(index)}
                        onChange={() => handleSameAsPhoneChange(index)}
                        className="text-emerald-600"
                      >
                        <span className="text-emerald-700">
                          Same as phone number
                        </span>
                      </Checkbox>

                      <Input
                        label="WhatsApp Number"
                        name="whatsapp"
                        value={contact.whatsapp}
                        onChange={(e) => handleChange(e, index)}
                        placeholder="E.g., +91XXXXXXXXXX"
                        type="tel"
                        disabled={sameAsPhoneIndexes.has(index)}
                        isRequired={!sameAsPhoneIndexes.has(index)}
                        description="WhatsApp number for notifications"
                      />
                    </div>
                  </div>
                ))}

                <Button
                  onClick={addEmergencyContact}
                  className="w-full bg-emerald-500 text-white font-semibold py-2"
                  variant="flat"
                >
                  + Add Another Contact
                </Button>
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
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6">
                <Button
                  onClick={() => router.push("/")}
                  variant="bordered"
                  className="border-2 border-emerald-300 text-emerald-700 font-semibold flex-1 py-4 sm:py-6 text-base sm:text-lg"
                >
                  Go Back
                </Button>
                <Button
                  type="submit"
                  isLoading={loading}
                  disabled={loading}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold flex-1 py-4 sm:py-6 text-base sm:text-lg"
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
