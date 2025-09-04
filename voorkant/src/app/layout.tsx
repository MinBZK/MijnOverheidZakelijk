import "@/styles/globals.css";
import type { Metadata } from "next";
import Providers from "./providers";
import Header from "@/layouts/header";
import Navigation from "@/layouts/navigation";
import { auth } from "@/auth";
import { getKvkFromCookie } from "@/utils/kvknummer";
import { Footer } from "@/layouts/footer";
import Breadcrumb from "@/layouts/breadcrumb";
import PublicRootLayout from "./publiclayout";

export const metadata: Metadata = {
  title: "Mijn overheid zakelijk",
  description: "mijn overheid zakelijk",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const kvk = await getKvkFromCookie();

  return (
    <html lang="en">
      <body className="bg-[#fafafa]">
        {!session ? (
          <PublicRootLayout />
        ) : (
          <Providers session={session}>
            <Header kvk={kvk!} />
            <main className="border-b-ro-blue after:bg-ro-blue relative border-b-2 pb-[68] after:absolute after:bottom-0 after:left-1/2 after:block after:h-[32px] after:w-[44px] after:-translate-x-1/2 after:content-['']">
              <div className="container mx-auto px-2 py-4">
                <div className="grid max-w-screen-xl grid-cols-4 justify-between gap-4">
                  <div className="hidden md:col-span-1 md:block">
                    <Navigation />
                  </div>
                  <div className="col-span-4 space-y-4 md:col-span-3">
                    <Breadcrumb />
                    {children}
                  </div>
                </div>
              </div>
            </main>
            <Footer />
          </Providers>
        )}
      </body>
    </html>
  );
}
