"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className="fixed top-10 w-full z-50">
      <div
        className={`max-w-3xl border-1 bg-white rounded-4xl mx-auto px-4 py-4 flex justify-between items-center transition-all ${
          scrolled && "shadow-md"
        }`}
      >
        <div>
          <Image src="/cubiVerse.png" width={200} height={100} alt="Logo" />
        </div>
        <div className="space-x-6 hidden md:flex">
          <a href="#" className="hover:text-blue-600">
            Product
          </a>
          <a href="#features" className="hover:text-blue-600">
            Features
          </a>
          <a href="#" className="hover:text-blue-600">
            Pricing
          </a>
        </div>
        <div className="space-x-2">
          <Link href={"/login"}>
            <Button className="text-white">Login</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
