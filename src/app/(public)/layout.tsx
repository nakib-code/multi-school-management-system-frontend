import type { ReactNode } from "react";

import Footer from "@/components/home/footer";
import Navbar from "@/components/home/navbar";

export default function PublicLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <main className="pt-20">{children}</main>
      <Footer />
    </>
  );
}