"use client";

import React, { useState, useContext, createContext, useEffect } from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Button,
  Select,
  SelectItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
} from "@heroui/react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FiLogOut, FiUser, FiGlobe } from "react-icons/fi";
import { MdTextFields } from "react-icons/md";
import { IoPlay } from "react-icons/io5";

export const FontSizeContext = createContext();

export const FontSizeProvider = ({ children }) => {
  const [fontSize, setFontSizeState] = useState("large");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved font size from localStorage on mount
  useEffect(() => {
    try {
      const savedFontSize = localStorage.getItem("elderguard-fontSize");
      if (
        savedFontSize &&
        ["small", "base", "large", "xl"].includes(savedFontSize)
      ) {
        setFontSizeState(savedFontSize);
      }
    } catch (error) {
      console.error("Error loading font size preference:", error);
    }
    setIsLoaded(true);
  }, []);

  // Wrapper for setFontSize that also saves to localStorage
  const setFontSize = (newSize) => {
    setFontSizeState(newSize);
    try {
      localStorage.setItem("elderguard-fontSize", newSize);
    } catch (error) {
      console.error("Error saving font size preference:", error);
    }
  };

  const fontSizeMap = {
    small: "text-sm",
    base: "text-base",
    large: "text-lg",
    xl: "text-xl",
  };

  return (
    <FontSizeContext.Provider
      value={{ fontSize, setFontSize, fontSizeMap, isLoaded }}
    >
      {children}
    </FontSizeContext.Provider>
  );
};

export const useFontSize = () => {
  const context = useContext(FontSizeContext);
  if (!context) {
    throw new Error("useFontSize must be used within FontSizeProvider");
  }
  return context;
};

const GlobalNavbar = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const { fontSize, setFontSize, fontSizeMap } = useFontSize();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [isLoaded, setIsLoaded] = useState(false);
  const {
    isOpen: isTutorialsOpen,
    onOpen: onTutorialsOpen,
    onOpenChange: onTutorialsOpenChange,
  } = useDisclosure();
  const [selectedVideo, setSelectedVideo] = useState(null);

  const tutorials = [
    {
      id: 1,
      title: "Recognizing Phishing Scams",
      description:
        "Learn how to identify and avoid phishing scams that target elderly people",
      videoId: "dQw4w9WgXcQ",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
    },
    {
      id: 2,
      title: "Protecting Your Online Banking",
      description:
        "Best practices to keep your bank account and personal information safe",
      videoId: "3JZ_D3UKsQw",
      thumbnail: "https://img.youtube.com/vi/3JZ_D3UKsQw/mqdefault.jpg",
    },
    {
      id: 3,
      title: "Social Media Safety Tips",
      description:
        "How to use social media safely and avoid sharing sensitive information",
      videoId: "jNQXAC9IVRw",
      thumbnail: "https://img.youtube.com/vi/jNQXAC9IVRw/mqdefault.jpg",
    },
    {
      id: 4,
      title: "Spotting Tech Support Scams",
      description:
        "Understand how scammers impersonate tech support and how to protect yourself",
      videoId: "8eKcZJu_y5I",
      thumbnail: "https://img.youtube.com/vi/8eKcZJu_y5I/mqdefault.jpg",
    },
  ];

  // Load saved language from localStorage on mount
  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem("elderguard-language");
      if (savedLanguage) {
        setSelectedLanguage(savedLanguage);
        // If language is not English, trigger translation
        if (savedLanguage !== "en") {
          setTimeout(() => {
            const translateElement = document.querySelector(".goog-te-combo");
            if (translateElement) {
              translateElement.value = savedLanguage;
              translateElement.dispatchEvent(new Event("change"));
            }
          }, 1000);
        }
      }
    } catch (error) {
      console.error("Error loading language preference:", error);
    }
    setIsLoaded(true);
  }, []);

  const handleTranslate = (language) => {
    if (language === "en") {
      // Clear language preference
      try {
        localStorage.removeItem("elderguard-language");
        setSelectedLanguage("en");
      } catch (error) {
        console.error("Error clearing language preference:", error);
      }

      // Reset Google Translate to English
      const translateElement = document.querySelector(".goog-te-combo");
      if (translateElement) {
        translateElement.value = "en";
        translateElement.dispatchEvent(new Event("change"));
      }

      // Small delay before reload to ensure Google Translate processes the change
      setTimeout(() => {
        location.reload();
      }, 100);
      return;
    }

    // Save language preference
    try {
      localStorage.setItem("elderguard-language", language);
      setSelectedLanguage(language);
    } catch (error) {
      console.error("Error saving language preference:", error);
    }

    // Trigger Google Translate
    const translateElement = document.querySelector(".goog-te-combo");
    if (translateElement) {
      // Set the select value and trigger change event
      translateElement.value = language;
      translateElement.dispatchEvent(new Event("change"));
    } else {
      // If element not found, try alternative method
      setTimeout(() => {
        const select = document.querySelector(".goog-te-combo");
        if (select) {
          select.value = language;
          select.dispatchEvent(new Event("change"));
        }
      }, 500);
    }
  };

  return (
    <Navbar
      className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-200"
      maxWidth="full"
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
    >
      <NavbarBrand
        className="mr-auto cursor-pointer"
        onClick={() => router.push("/")}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            🛡️
          </div>
          <p className="font-bold text-xl text-emerald-700">ElderGuard</p>
        </div>
      </NavbarBrand>

      {/* Mobile Menu Toggle */}
      <NavbarMenuToggle className="text-emerald-700 md:hidden" />

      <NavbarContent justify="end" className="hidden md:flex gap-4">
        {/* Tutorials Button */}
        <Button
          onClick={onTutorialsOpen}
          className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold"
          startContent={<IoPlay size={18} />}
        >
          Tutorials
        </Button>

        {/* Font Size Select */}
        <Select
          label="Font Size"
          selectedKeys={[fontSize]}
          onChange={(e) => setFontSize(e.target.value)}
          className="w-40"
          size="sm"
          variant="flat"
          classNames={{
            trigger: "bg-emerald-100 hover:bg-emerald-200 text-emerald-700",
          }}
        >
          <SelectItem key="small">Small</SelectItem>
          <SelectItem key="base">Normal</SelectItem>
          <SelectItem key="large">Large</SelectItem>
          <SelectItem key="xl">Extra Large</SelectItem>
        </Select>

        {/* Language Select */}
        <Select
          label="Language"
          selectedKeys={[selectedLanguage]}
          onChange={(e) => handleTranslate(e.target.value)}
          className="w-52"
          size="sm"
          variant="flat"
          classNames={{
            trigger: "bg-emerald-100 hover:bg-emerald-200 text-emerald-700",
          }}
        >
          <SelectItem key="en" translate="no">
            English
          </SelectItem>
          <SelectItem key="hi" translate="no">
            हिंदी (Hindi)
          </SelectItem>
          <SelectItem key="bn" translate="no">
            বাংলা (Bengali)
          </SelectItem>
          <SelectItem key="te" translate="no">
            తెలుగు (Telugu)
          </SelectItem>
          <SelectItem key="mr" translate="no">
            मराठी (Marathi)
          </SelectItem>
          <SelectItem key="ta" translate="no">
            தமிழ் (Tamil)
          </SelectItem>
          <SelectItem key="ur" translate="no">
            اردو (Urdu)
          </SelectItem>
          <SelectItem key="gu" translate="no">
            ગુજરાતી (Gujarati)
          </SelectItem>
          <SelectItem key="kn" translate="no">
            ಕನ್ನಡ (Kannada)
          </SelectItem>
          <SelectItem key="ml" translate="no">
            മലയാളം (Malayalam)
          </SelectItem>
          <SelectItem key="or" translate="no">
            ଓଡ଼ିଆ (Odia)
          </SelectItem>
          <SelectItem key="pa" translate="no">
            ਪੰਜਾਬੀ (Punjabi)
          </SelectItem>
          <SelectItem key="as" translate="no">
            অসমীয়া (Assamese)
          </SelectItem>
          <SelectItem key="kok" translate="no">
            कोंकणी (Konkani)
          </SelectItem>
          <SelectItem key="sa" translate="no">
            संस्कृत (Sanskrit)
          </SelectItem>
          <SelectItem key="sd" translate="no">
            سندھی (Sindhi)
          </SelectItem>
          <SelectItem key="doi" translate="no">
            डोगरी (Dogri)
          </SelectItem>
          <SelectItem key="sat" translate="no">
            ᱤᱣᱭᱤᱛᱟᱤ (Santali)
          </SelectItem>
          <SelectItem key="ne" translate="no">
            नेपाली (Nepali)
          </SelectItem>
        </Select>

        {/* User Menu */}
        {session ? (
          <Dropdown>
            <DropdownTrigger>
              <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity bg-emerald-100 hover:bg-emerald-200 px-3 py-1 rounded-lg">
                {session.user.image && (
                  <img
                    src={session.user.image}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border-2 border-emerald-300"
                  />
                )}
                <span className="text-emerald-700 font-semibold hidden sm:block text-sm">
                  {session.user.name || "User"}
                </span>
              </div>
            </DropdownTrigger>
            <DropdownMenu aria-label="User menu">
              <DropdownItem
                key="dashboard"
                startContent={<FiUser />}
                onClick={() => {
                  router.push("/dashboard");
                  setIsMenuOpen(false);
                }}
              >
                Dashboard
              </DropdownItem>
              <DropdownItem
                key="profile"
                startContent={<FiUser />}
                onClick={() => {
                  router.push("/profile");
                  setIsMenuOpen(false);
                }}
              >
                Profile
              </DropdownItem>
              <DropdownItem
                key="logout"
                startContent={<FiLogOut />}
                onClick={async () => {
                  await signOut({ redirect: false });
                  router.push("/");
                  setIsMenuOpen(false);
                }}
                color="danger"
              >
                Logout
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        ) : (
          <Button
            onClick={() => router.push("/login")}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold"
          >
            Sign In
          </Button>
        )}
      </NavbarContent>

      {/* Mobile Menu */}
      <NavbarMenu className="bg-emerald-50">
        <NavbarMenuItem>
          <Button
            fullWidth
            onClick={() => {
              onTutorialsOpen();
              setIsMenuOpen(false);
            }}
            className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold"
            startContent={<IoPlay size={18} />}
          >
            Tutorials
          </Button>
        </NavbarMenuItem>
        <NavbarMenuItem>
          <Select
            label="Font Size"
            selectedKeys={[fontSize]}
            onChange={(e) => {
              setFontSize(e.target.value);
              setIsMenuOpen(false);
            }}
            className="w-full"
            size="sm"
            variant="flat"
            classNames={{
              trigger: "bg-emerald-100 hover:bg-emerald-200 text-emerald-700",
            }}
          >
            <SelectItem key="small">Small</SelectItem>
            <SelectItem key="base">Normal</SelectItem>
            <SelectItem key="large">Large</SelectItem>
            <SelectItem key="xl">Extra Large</SelectItem>
          </Select>
        </NavbarMenuItem>
        <NavbarMenuItem>
          <Select
            label="Language"
            selectedKeys={[selectedLanguage]}
            onChange={(e) => {
              handleTranslate(e.target.value);
              setIsMenuOpen(false);
            }}
            className="w-full"
            size="sm"
            variant="flat"
            classNames={{
              trigger: "bg-emerald-100 hover:bg-emerald-200 text-emerald-700",
            }}
          >
            <SelectItem key="en" translate="no">
              English
            </SelectItem>
            <SelectItem key="hi" translate="no">
              हिंदी (Hindi)
            </SelectItem>
            <SelectItem key="bn" translate="no">
              বাংলা (Bengali)
            </SelectItem>
            <SelectItem key="te" translate="no">
              తెలుగు (Telugu)
            </SelectItem>
            <SelectItem key="mr" translate="no">
              मराठी (Marathi)
            </SelectItem>
            <SelectItem key="ta" translate="no">
              தமிழ் (Tamil)
            </SelectItem>
            <SelectItem key="ur" translate="no">
              اردو (Urdu)
            </SelectItem>
            <SelectItem key="gu" translate="no">
              ગુજરાતી (Gujarati)
            </SelectItem>
            <SelectItem key="kn" translate="no">
              ಕನ್ನಡ (Kannada)
            </SelectItem>
            <SelectItem key="ml" translate="no">
              മലയാളം (Malayalam)
            </SelectItem>
            <SelectItem key="or" translate="no">
              ଓଡ଼ିଆ (Odia)
            </SelectItem>
            <SelectItem key="pa" translate="no">
              ਪੰਜਾਬੀ (Punjabi)
            </SelectItem>
            <SelectItem key="as" translate="no">
              অসমীয়া (Assamese)
            </SelectItem>
            <SelectItem key="kok" translate="no">
              कोंकणी (Konkani)
            </SelectItem>
            <SelectItem key="sa" translate="no">
              संस्कृत (Sanskrit)
            </SelectItem>
            <SelectItem key="sd" translate="no">
              سندھی (Sindhi)
            </SelectItem>
            <SelectItem key="doi" translate="no">
              डोगरी (Dogri)
            </SelectItem>
            <SelectItem key="sat" translate="no">
              ᱤᱣᱭᱤᱛᱟᱤ (Santali)
            </SelectItem>
            <SelectItem key="ne" translate="no">
              नेपाली (Nepali)
            </SelectItem>
          </Select>
        </NavbarMenuItem>

        {session ? (
          <>
            <NavbarMenuItem className="my-4">
              <div className="w-full bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  {session.user.image && (
                    <img
                      src={session.user.image}
                      alt="Profile"
                      className="w-12 h-12 rounded-full border-2 border-emerald-300"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-emerald-900">
                      {session.user.name || "User"}
                    </p>
                    <p className="text-xs text-emerald-600">
                      {session.user.email}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Button
                    fullWidth
                    onClick={() => {
                      router.push("/dashboard");
                      setIsMenuOpen(false);
                    }}
                    className="justify-start bg-emerald-500 text-white hover:bg-emerald-600"
                    variant="flat"
                    size="sm"
                    startContent={<FiUser />}
                  >
                    Dashboard
                  </Button>
                  <Button
                    fullWidth
                    onClick={() => {
                      router.push("/profile");
                      setIsMenuOpen(false);
                    }}
                    className="justify-start bg-teal-500 text-white hover:bg-teal-600"
                    variant="flat"
                    size="sm"
                    startContent={<FiUser />}
                  >
                    Profile
                  </Button>
                  <Button
                    fullWidth
                    onClick={async () => {
                      await signOut({ redirect: false });
                      router.push("/");
                      setIsMenuOpen(false);
                    }}
                    className="justify-start bg-red-500 text-white hover:bg-red-600"
                    variant="flat"
                    size="sm"
                    startContent={<FiLogOut />}
                  >
                    Logout
                  </Button>
                </div>
              </div>
            </NavbarMenuItem>
          </>
        ) : (
          <NavbarMenuItem className="my-2">
            <Button
              fullWidth
              onClick={() => {
                router.push("/login");
                setIsMenuOpen(false);
              }}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold"
            >
              Sign In
            </Button>
          </NavbarMenuItem>
        )}
      </NavbarMenu>

      {/* Tutorials Modal */}
      <Modal
        isOpen={isTutorialsOpen}
        onOpenChange={onTutorialsOpenChange}
        size="3xl"
        backdrop="blur"
        scrollBehavior="inside"
      >
        <ModalContent className="bg-gradient-to-b from-emerald-50 to-teal-50 max-h-[90vh] overflow-hidden">
          <ModalHeader className="flex flex-col gap-1 border-b-2 border-emerald-200">
            <h2 className="text-2xl font-bold text-emerald-700">
              ElderGuard Tutorials
            </h2>
          </ModalHeader>
          <ModalBody className="py-6">
            {selectedVideo ? (
              // Video Player View
              <div className="flex flex-col gap-4">
                <div
                  className="w-full bg-black rounded-lg overflow-hidden"
                  style={{
                    paddingBottom: "56.25%",
                    position: "relative",
                    height: 0,
                  }}
                >
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1`}
                    title={selectedVideo.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                    }}
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-emerald-700 mb-2">
                    {selectedVideo.title}
                  </h3>
                  <p className="text-gray-700">{selectedVideo.description}</p>
                </div>
                <Button
                  onClick={() => setSelectedVideo(null)}
                  variant="flat"
                  className="bg-emerald-200 text-emerald-700 hover:bg-emerald-300 font-semibold"
                >
                  ← Back to Tutorials
                </Button>
              </div>
            ) : (
              // Tutorials Grid View
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tutorials.map((tutorial) => (
                  <div
                    key={tutorial.id}
                    onClick={() => setSelectedVideo(tutorial)}
                    className="cursor-pointer group"
                  >
                    <div className="relative overflow-hidden rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                      <div className="relative overflow-hidden h-40 bg-gray-200">
                        <img
                          src={tutorial.thumbnail}
                          alt={tutorial.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                          <IoPlay className="text-white text-4xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-emerald-700 text-sm line-clamp-2 mb-2">
                            {tutorial.title}
                          </h3>
                          <p className="text-xs text-gray-600 line-clamp-3">
                            {tutorial.description}
                          </p>
                        </div>
                        <Button
                          isIconOnly
                          className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white mt-3 self-start"
                          size="sm"
                          onClick={() => setSelectedVideo(tutorial)}
                        >
                          <IoPlay size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Navbar>
  );
};

export default GlobalNavbar;
