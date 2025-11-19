"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DarkThemeBalatro from "@/components/DarkThemeBalatro";
import Lanyard from "@/components/Lanyard";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // Handle subscription logic here
      setIsSubscribed(true);
      setEmail("");
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  const footerLinks = {
    product: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Documentation", href: "/docs" },
      { label: "API Reference", href: "/api" },
    ],
    company: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
    ],
    legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "License", href: "/license" },
      { label: "Security", href: "/security" },
    ],
  };

  const socialLinks = [
    { icon: Github, href: "https://github.com/krishna-kush/killcode", label: "GitHub" },
    { icon: Mail, href: "mailto:contact@killcode.app", label: "Email" },
  ];

  return (
    <footer className="relative bg-[oklch(0.09_0_0)] border-t border-[oklch(0.18_0_0)] overflow-hidden dark">
      {/* Balatro Background */}
      <div className="absolute inset-0 opacity-65 pointer-events-none">
        <DarkThemeBalatro
          isRotate={false}
          mouseInteraction={true}
          pixelFilter={700}
        />
      </div>

      {/* Footer Content */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="grid lg:grid-cols-3">
          {/* Main Content - 2/3 width */}
          <div className="lg:col-span-2 space-y-12 py-16">
            {/* Logo and Description */}
            <div>
              <h3 className="text-3xl font-bold text-[oklch(0.98_0_0)] mb-4">killcode</h3>
              <p className="text-[oklch(0.64_0_0)] max-w-md">
                Secure binary licensing and protection system with continuous verification and real-time monitoring.
              </p>
            </div>

            {/* Links Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              {/* Product */}
              <div>
                <h4 className="text-[oklch(0.98_0_0)] font-semibold mb-4">Product</h4>
                <ul className="space-y-2">
                  {footerLinks.product.map((link) => (
                    <li key={link.label}>
                      <Link 
                        href={link.href}
                        className="text-[oklch(0.64_0_0)] hover:text-[oklch(0.98_0_0)] transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company */}
              <div>
                <h4 className="text-[oklch(0.98_0_0)] font-semibold mb-4">Company</h4>
                <ul className="space-y-2">
                  {footerLinks.company.map((link) => (
                    <li key={link.label}>
                      <Link 
                        href={link.href}
                        className="text-[oklch(0.64_0_0)] hover:text-[oklch(0.98_0_0)] transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h4 className="text-[oklch(0.98_0_0)] font-semibold mb-4">Legal</h4>
                <ul className="space-y-2">
                  {footerLinks.legal.map((link) => (
                    <li key={link.label}>
                      <Link 
                        href={link.href}
                        className="text-[oklch(0.64_0_0)] hover:text-[oklch(0.98_0_0)] transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Newsletter Subscription */}
            <div className="max-w-md">
              <h4 className="text-[oklch(0.98_0_0)] font-semibold mb-4">Subscribe to our newsletter</h4>
              <p className="text-[oklch(0.64_0_0)] text-sm mb-4">
                Get the latest updates on binary protection and security.
              </p>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[oklch(0.13_0_0)] border-[oklch(0.18_0_0)] text-[oklch(0.98_0_0)] placeholder:text-[oklch(0.64_0_0)] focus:border-[oklch(0.55_0.22_25)]"
                  required
                />
                <Button 
                  type="submit"
                  className="shrink-0"
                >
                  {isSubscribed ? "Subscribed!" : "Subscribe"}
                </Button>
              </form>
            </div>

            {/* Social Links */}
            <div>
              <h4 className="text-[oklch(0.98_0_0)] font-semibold mb-4">Follow Us</h4>
              <div className="flex gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[oklch(0.64_0_0)] hover:text-[oklch(0.98_0_0)] transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon className="h-6 w-6" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Lanyard - 1/3 width */}
          <div className="lg:block h-full min-h-[600px]">
            <Lanyard position={[0, 0, 20]} gravity={[0, -40, 0]} />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[oklch(0.18_0_0)]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[oklch(0.64_0_0)] text-sm text-center md:text-left">
              © 2025 KillCode. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/sitemap" className="text-[oklch(0.64_0_0)] hover:text-[oklch(0.98_0_0)] transition-colors">
                Sitemap
              </Link>
              <Link href="/rss" className="text-[oklch(0.64_0_0)] hover:text-[oklch(0.98_0_0)] transition-colors">
                RSS
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
