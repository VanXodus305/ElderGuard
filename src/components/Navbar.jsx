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
} from "@heroui/react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FiLogOut, FiUser, FiGlobe } from "react-icons/fi";
import { MdTextFields } from "react-icons/md";

export const FontSizeContext = createContext();

export const FontSizeProvider = ({ children }) => {
  const [fontSize, setFontSizeState] = useState("base");
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
        {/* Font Size Select */}
        <Select
          label="Font Size"
          selectedKeys={[fontSize]}
          onChange={(e) => setFontSize(e.target.value)}
          className="w-56"
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
          className="w-56"
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
              <Button
                variant="flat"
                className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-semibold"
              >
                {session.user.name || "User"}
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="User menu">
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
          <Select
            label="Font Size"
            selectedKeys={[fontSize]}
            onChange={(e) => setFontSize(e.target.value)}
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
            <NavbarMenuItem className="my-2">
              <Button
                fullWidth
                onClick={() => {
                  router.push("/profile");
                  setIsMenuOpen(false);
                }}
                className="justify-start bg-transparent text-emerald-700"
                variant="flat"
                startContent={<FiUser />}
              >
                Profile
              </Button>
            </NavbarMenuItem>
            <NavbarMenuItem>
              <Button
                fullWidth
                onClick={async () => {
                  await signOut({ redirect: false });
                  router.push("/");
                  setIsMenuOpen(false);
                }}
                className="justify-start bg-transparent text-red-600"
                variant="flat"
                startContent={<FiLogOut />}
              >
                Logout
              </Button>
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
    </Navbar>
  );
};

export default GlobalNavbar;
