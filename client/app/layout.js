import { Inter, Cormorant_Garamond, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import ToastContainer from "@/components/Toast";
import OnboardingModal from "@/components/OnboardingModal";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata = {
  title: "Hire.IQ — AI Technical & Behavioral Interview Co-pilot",
  description: "Editorial voice-activated multi-agent interview simulator and career growth engine.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${inter.variable} ${cormorant.variable} ${jetbrains.variable} h-full antialiased`}
        style={{ backgroundColor: "#faf9f5" }}
      >
        <body className="min-h-full flex flex-col" style={{ backgroundColor: "#faf9f5", color: "#141413" }}>
          {children}
          <ToastContainer />
          <OnboardingModal />
        </body>
      </html>
    </ClerkProvider>
  );
}
