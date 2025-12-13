import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Mail, Copyright } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-card border border-muted">
              <Lock className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight">Privacy Policy</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We value your privacy and are committed to protecting your personal data.
          </p>
        </div>

        {/* Privacy Card */}
        <Card className="bg-card border-muted shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-2xl text-foreground flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Privacy Policy
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Last updated: December 2025
                </CardDescription>
              </div>
              <Badge variant="outline" className="border-primary text-primary">
                Effective
              </Badge>
            </div>
          </CardHeader>
          <Separator className="bg-muted" />
          <CardContent className="p-0">
            <ScrollArea className="h-[600px] w-full p-6">
              <div className="space-y-6 text-foreground font-mono text-sm leading-relaxed">
                <div className="space-y-2">
                  <p className="font-bold text-foreground">1. Introduction</p>
                  <p>
                    Killcode ("we", "our", or "us") respects your privacy and is committed to protecting it through our compliance with this policy.
                    This policy describes the types of information we may collect from you or that you may provide when you visit the website killcode.app (our "Website")
                    and our practices for collecting, using, maintaining, protecting, and disclosing that information.
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="font-bold text-foreground">2. Information We Collect</p>
                  <p>We collect several types of information from and about users of our Website, including information:</p>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>By which you may be personally identified, such as name, postal address, e-mail address, telephone number ("personal information");</li>
                    <li>That is about you but individually does not identify you; and/or</li>
                    <li>About your internet connection, the equipment you use to access our Website, and usage details.</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="font-bold text-foreground">3. How We Use Your Information</p>
                  <p>We use information that we collect about you or that you provide to us, including any personal information:</p>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>To present our Website and its contents to you.</li>
                    <li>To provide you with information, products, or services that you request from us.</li>
                    <li>To fulfill any other purpose for which you provide it.</li>
                    <li>To provide you with notices about your account/subscription, including expiration and renewal notices.</li>
                    <li>To carry out our obligations and enforce our rights arising from any contracts entered into between you and us, including for billing and collection.</li>
                    <li>To notify you about changes to our Website or any products or services we offer or provide though it.</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="font-bold text-foreground">4. Data Security</p>
                  <p>
                    We have implemented measures designed to secure your personal information from accidental loss and from unauthorized access, use, alteration, and disclosure.
                    The safety and security of your information also depends on you. Where we have given you (or where you have chosen) a password for access to certain parts of our Website,
                    you are responsible for keeping this password confidential. We ask you not to share your password with anyone.
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="font-bold text-foreground">5. Protection of User Content</p>
                  <p>
                    We take the security of your uploaded content (including binaries, photos, videos, and other files) extremely seriously.
                    We have implemented strict technical and organizational measures to ensure that:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Your files are encrypted at rest and in transit.</li>
                    <li>We do not share your files with any third parties.</li>
                    <li>Our internal systems are designed such that even our own team members cannot access the contents of your uploaded files.</li>
                    <li>Access is strictly limited to automated processes required for the service to function (e.g., licensing and verification).</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="font-bold text-foreground">6. Contact Information</p>
                  <p>To ask questions or comment about this privacy policy and our privacy practices, contact us at:</p>
                  <div className="flex items-center gap-2 mt-2 text-primary">
                    <Mail className="w-4 h-4" />
                    <a href="mailto:admin@killcode.app" className="hover:underline">admin@killcode.app</a>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="text-center text-sm text-muted-foreground flex items-center justify-center gap-1">
          <Copyright className="w-3 h-3" />
          <span>2025 Killcode. All rights reserved.</span>
        </div>
      </div>
    </div>
  );
}
