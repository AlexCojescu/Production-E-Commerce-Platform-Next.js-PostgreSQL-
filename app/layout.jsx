import { Outfit } from "next/font/google";
import { Toaster } from "react-hot-toast";
import StoreProvider from "@/app/StoreProvider";
import Chatbot from "@/components/Chatbot";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';


const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata = {
    title: "VetteClothing. - Rare For The Low",
    description: "VetteClothing. - Rare For The Low",
};

export default function RootLayout({ children }) {
    return (
        <ClerkProvider>
            <html lang="en">
                <body className={`${outfit.className} antialiased overflow-x-hidden`}>
                    <StoreProvider>
                        <Toaster />
                        {children}
                        <Chatbot />
                    </StoreProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
