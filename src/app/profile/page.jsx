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
  Checkbox,
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
    emergencyContacts: [],
  });
  const [sameAsPhoneIndexes, setSameAsPhoneIndexes] = useState(new Set());

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

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
        setFormData({
          age: data.age || "",
          address: data.address || "",
          emergencyContacts: data.emergencyContacts || [],
        });
        // Mark which contacts have same WhatsApp as phone
        const sameSet = new Set();
        (data.emergencyContacts || []).forEach((contact, idx) => {
          if (contact.whatsapp === contact.phone) {
            sameSet.add(idx);
          }
        });
        setSameAsPhoneIndexes(sameSet);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleChange = (e, contactIndex = null) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (contactIndex !== null) {
        const updated = { ...prev };
        updated.emergencyContacts[contactIndex][name] = value;
        if (name === "phone" && sameAsPhoneIndexes.has(contactIndex)) {
          updated.emergencyContacts[contactIndex].whatsapp = value;
        }
        return updated;
      } else {
        return { ...prev, [name]: value };
      }
    });
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

  const handleSubmit = async () => {
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
      className="min-h-screen bg-gradient-to-b from-background-200 to-background-100 py-6 sm:py-12 px-4 sm:px-6"
      style={{ fontSize: getFontSize() }}
    >
      <div className="w-full max-w-2xl mx-auto">
        <Card className="border-2 border-emerald-200 bg-white shadow-xl">
          <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 sm:p-8 text-white">
            <div className="w-full">
              <h1 className={`${getHeadingClass(3)} font-bold mb-1 sm:mb-2`}>
                Your Profile
              </h1>
              <p className="text-emerald-50 text-sm sm:text-base">
                Manage your personal information and emergency contacts
              </p>
            </div>
          </CardHeader>

          <CardBody className="p-4 sm:p-8">
            {userProfile ? (
              <div className="space-y-6">
                {/* Personal Details Section */}
                <div className="space-y-4 bg-emerald-50 p-4 sm:p-6 rounded-lg border border-emerald-200">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-2">
                    <h3
                      className={`${getHeadingClass(
                        2
                      )} font-semibold text-emerald-900`}
                    >
                      Personal Details
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                {/* Emergency Contacts Section */}
                <div className="space-y-4 bg-red-50 p-6 rounded-lg border border-red-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3
                      className={`${getHeadingClass(
                        2
                      )} font-semibold text-red-900`}
                    >
                      Emergency Contacts (
                      {userProfile?.emergencyContacts?.length || 0})
                    </h3>
                  </div>

                  {userProfile?.emergencyContacts &&
                  userProfile.emergencyContacts.length > 0 ? (
                    <div className="space-y-4">
                      {userProfile.emergencyContacts.map((contact, index) => (
                        <div
                          key={index}
                          className="bg-white p-4 rounded-lg border-l-4 border-red-500"
                        >
                          <p className="text-sm font-semibold text-red-600 mb-2">
                            Contact {index + 1}
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs text-red-500 font-semibold">
                                Name
                              </p>
                              <p className="text-base text-red-900">
                                {contact.name || "Not provided"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-red-500 font-semibold">
                                Phone
                              </p>
                              <p className="text-base text-red-900">
                                {contact.phone || "Not provided"}
                              </p>
                            </div>
                            <div className="md:col-span-2">
                              <p className="text-xs text-red-500 font-semibold">
                                WhatsApp
                              </p>
                              <p className="text-base text-red-900">
                                {contact.whatsapp || "Same as phone"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-red-600">No emergency contacts added</p>
                  )}
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
                    isRequired
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

                  <div className="border-t-2 border-emerald-200 pt-4">
                    <h4 className="font-semibold text-emerald-900 mb-3">
                      Emergency Contacts
                    </h4>
                    {formData.emergencyContacts.map((contact, index) => (
                      <div
                        key={index}
                        className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 mb-3 space-y-2"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-emerald-700">
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
                          size="sm"
                        />

                        <Input
                          label="Phone Number"
                          name="phone"
                          value={contact.phone}
                          onChange={(e) => handleChange(e, index)}
                          placeholder="E.g., +91XXXXXXXXXX"
                          type="tel"
                          isRequired
                          size="sm"
                        />

                        <div className="space-y-2">
                          <Checkbox
                            checked={sameAsPhoneIndexes.has(index)}
                            onChange={() => handleSameAsPhoneChange(index)}
                            className="text-emerald-600"
                          >
                            <span className="text-emerald-700 text-sm">
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
                            size="sm"
                          />
                        </div>
                      </div>
                    ))}
                    <Button
                      onClick={addEmergencyContact}
                      className="w-full bg-emerald-500 text-white mt-2"
                      variant="flat"
                      size="sm"
                    >
                      + Add Another Contact
                    </Button>
                  </div>
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
