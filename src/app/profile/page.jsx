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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useFontSize } from "@/components/Navbar";
import { FiArrowRight, FiEdit } from "react-icons/fi";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { fontSizeMap, fontSize } = useFontSize();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

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
  const [userProfile, setUserProfile] = useState(null);
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
        setFormData({
          age: data.age || "",
          address: data.address || "",
          emergencyContactName: data.emergencyContactName || "",
          emergencyContactPhone: data.emergencyContactPhone || "",
          emergencyContactWhatsapp: data.emergencyContactWhatsapp || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

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
        const updatedData = await response.json();
        setUserProfile(updatedData);
        onOpenChange(false);
        alert("Profile updated successfully!");
      } else {
        alert("Failed to update profile. Please try again.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
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
      <div className="max-w-2xl mx-auto">
        <Card className="border-2 border-emerald-200 bg-white shadow-xl">
          <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 p-8 text-white">
            <div className="w-full">
              <h1 className={`${getHeadingClass(3)} font-bold mb-2`}>
                Your Profile
              </h1>
              <p className="text-emerald-50">
                Manage your personal information and emergency contacts
              </p>
            </div>
          </CardHeader>

          <CardBody className="p-8">
            {userProfile ? (
              <div className="space-y-6">
                {/* Personal Details Section */}
                <div className="space-y-4 bg-emerald-50 p-6 rounded-lg border border-emerald-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3
                      className={`${getHeadingClass(
                        2
                      )} font-semibold text-emerald-900`}
                    >
                      Personal Details
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-emerald-600 font-semibold">
                        Name
                      </p>
                      <p className="text-lg text-emerald-900">
                        {session?.user?.name || "Not provided"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-emerald-600 font-semibold">
                        Email
                      </p>
                      <p className="text-lg text-emerald-900">
                        {session?.user?.email}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-emerald-600 font-semibold">
                        Age Group
                      </p>
                      <p className="text-lg text-emerald-900">
                        {userProfile?.age || "Not provided"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-emerald-600 font-semibold">
                        Address
                      </p>
                      <p className="text-lg text-emerald-900">
                        {userProfile?.address || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact Section */}
                <div className="space-y-4 bg-red-50 p-6 rounded-lg border border-red-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3
                      className={`${getHeadingClass(
                        2
                      )} font-semibold text-red-900`}
                    >
                      Emergency Contact
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-red-600 font-semibold">
                        Contact Name
                      </p>
                      <p className="text-lg text-red-900">
                        {userProfile?.emergencyContactName || "Not provided"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-red-600 font-semibold">
                        Phone Number
                      </p>
                      <p className="text-lg text-red-900">
                        {userProfile?.emergencyContactPhone || "Not provided"}
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <p className="text-sm text-red-600 font-semibold">
                        WhatsApp Number
                      </p>
                      <p className="text-lg text-red-900">
                        {userProfile?.emergencyContactWhatsapp ||
                          "Same as phone"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Edit Button */}
                <Button
                  onPress={onOpen}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold py-6 text-lg"
                  startContent={<FiEdit />}
                >
                  Edit Profile
                </Button>

                <Button
                  onClick={() => router.push("/dashboard")}
                  variant="flat"
                  className="w-full border-2 border-emerald-300 text-emerald-700 font-semibold py-6 text-lg"
                  endContent={<FiArrowRight />}
                >
                  Back to Dashboard
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-emerald-700">
                  Loading profile information...
                </p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-emerald-900">
                Update Your Profile
              </ModalHeader>
              <ModalBody>
                <form className="space-y-4">
                  <Select
                    label="Age Group"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="Select your age group"
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
                  />

                  <Input
                    label="Emergency Contact Name"
                    name="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={handleChange}
                    placeholder="Full name"
                    type="text"
                  />

                  <Input
                    label="Emergency Contact Phone"
                    name="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={handleChange}
                    placeholder="E.g., +91XXXXXXXXXX"
                    type="tel"
                  />

                  <Input
                    label="WhatsApp Number (Optional)"
                    name="emergencyContactWhatsapp"
                    value={formData.emergencyContactWhatsapp}
                    onChange={handleChange}
                    placeholder="E.g., +91XXXXXXXXXX"
                    type="tel"
                  />
                </form>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                  onPress={handleSubmit}
                  isLoading={loading}
                  disabled={loading}
                >
                  Save Changes
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
