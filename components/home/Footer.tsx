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

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082'}/newsletter/subscribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        if (response.ok) {
          setIsSubscribed(true);
          setEmail("");
          setTimeout(() => setIsSubscribed(false), 3000);
        } else {
          console.error('Failed to subscribe');
        }
      } catch (error) {
        console.error('Error subscribing:', error);
      }
    }
  };

  const footerLinks = {
    product: [
      { label: "Binary Licensing", href: "/auth", upcoming: false },
      { label: ".kc Media Viewer", href: "#", upcoming: true },
      { label: "JPG MP4 PDF Licensing", href: "#", upcoming: true },
      { label: "DRM Protection on Videos", href: "#", upcoming: true },
    ],
    company: [
      { label: "Contact", href: "mailto:admin@killcode.app", icon: Mail },
    ],
    legal: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms-of-service" },
      { label: "License", href: "/license" },
    ],
  };

  const socialLinks = [
    { icon: Github, href: "https://github.com/krishna-kush/killcode", label: "GitHub" },
    { icon: Mail, href: "mailto:admin@killcode.app", label: "Email" },
  ];

  return (
    <footer className="relative bg-background border-t border-muted overflow-hidden dark">
      {/* Balatro Background */}
      <div className="absolute inset-0 opacity-65 pointer-events-none">
        <DarkThemeBalatro
          spinSpeed = {5.0}
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
              <h3 className="text-3xl font-bold text-foreground mb-4">killcode</h3>
              <p className="text-white max-w-md">
                Secure File licensing and protection system with continuous verification and real-time monitoring.
              </p>
            </div>

            {/* Links Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              {/* Product */}
              <div>
                <h4 className="text-foreground font-semibold mb-4">Product</h4>
                <ul className="space-y-2">
                  {footerLinks.product.map((link) => (
                    <li key={link.label}>
                      {link.upcoming ? (
                        <span className="text-white cursor-not-allowed flex items-center gap-2">
                          {link.label}
                          <span className="text-[10px] bg-transparent text-white px-1.5 py-0.5 rounded border border-primary">Upcoming</span>
                        </span>
                      ) : (
                        <Link 
                          href={link.href}
                          className="text-white hover:text-foreground transition-colors"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company */}
              <div>
                <h4 className="text-foreground font-semibold mb-4">Company</h4>
                <ul className="space-y-2">
                  {footerLinks.company.map((link) => (
                    <li key={link.label}>
                      {link.icon ? (
                        <a 
                          href={link.href}
                          className="text-white hover:text-foreground transition-colors flex items-center gap-2"
                        >
                          {link.label}
                          <link.icon className="h-4 w-4" />
                        </a>
                      ) : (
                        <Link 
                          href={link.href}
                          className="text-white hover:text-foreground transition-colors"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h4 className="text-foreground font-semibold mb-4">Legal</h4>
                <ul className="space-y-2">
                  {footerLinks.legal.map((link) => (
                    <li key={link.label}>
                      <Link 
                        href={link.href}
                        className="text-white hover:text-foreground transition-colors"
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
              <h4 className="text-foreground font-semibold mb-4">Subscribe to our newsletter</h4>
              <p className="text-white text-sm mb-4">
                Get the latest updates on file protection and security.
              </p>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-card border-muted text-white placeholder:text-white focus:border-primary"
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
              <h4 className="text-foreground font-semibold mb-4">Follow Us</h4>
              <div className="flex gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-foreground transition-colors"
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
        <div className="pt-8 border-t border-muted">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white text-sm text-center md:text-left">
              © 2025 KillCode. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/sitemap.xml" className="text-white hover:text-foreground transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
