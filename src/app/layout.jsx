import { Geist } from "next/font/google";
import "./globals.css";
import Provider from "@/contexts/Provider";
import GlobalNavbar, { FontSizeProvider } from "@/components/Navbar";
import GlobalFooter from "@/components/Footer";
import FontSizeWrapper from "@/components/FontSizeWrapper";

const geistSans = Geist({
  subsets: ["latin"],
});

export const metadata = {
  title: "ElderGuard - Protect Yourself from Scams",
  description:
    "ElderGuard helps seniors identify and protect themselves from fraudulent messages and scams using AI technology.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          async
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              function googleTranslateElementInit() {
                new google.translate.TranslateElement(
                  { pageLanguage: 'en' },
                  'google_translate_element'
                );
              }
            `,
          }}
        ></script>
      </head>
      <body
        className={`${geistSans.className} bg-gradient-to-b from-background-200 to-background-100 min-h-screen light flex flex-col`}
        suppressHydrationWarning
      >
        {/* Hidden Google Translate Element */}
        <div
          id="google_translate_element"
          style={{ display: "none" }}
          suppressHydrationWarning
        ></div>

        <Provider>
          <FontSizeProvider>
            <FontSizeWrapper>
              <GlobalNavbar />
              <main className="flex-1">{children}</main>
              <GlobalFooter />
            </FontSizeWrapper>
          </FontSizeProvider>
        </Provider>
      </body>
    </html>
  );
}
