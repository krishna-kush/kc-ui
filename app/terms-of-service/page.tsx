import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { FileText, Gavel, Mail, Copyright } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-card border border-muted">
              <Gavel className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight">Terms of Service</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Please read these terms and conditions carefully before using our service.
          </p>
        </div>

        {/* Terms Card */}
        <Card className="bg-card border-muted shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-2xl text-foreground flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Terms of Service
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
                  <p className="font-bold text-foreground">1. Acceptance of Terms</p>
                  <p>
                    By accessing or using the Killcode website and services, you agree to be bound by these Terms of Service and all applicable laws and regulations.
                    If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="font-bold text-foreground">2. Use License</p>
                  <p>
                    Permission is granted to access and use the Killcode platform and services solely for the purpose of protecting and managing your own digital assets.
                    This is the grant of a license, not a transfer of title, and under this license you may not:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>modify, copy, or attempt to reverse engineer the Killcode platform or any of its underlying systems;</li>
                    <li>use the service for any illegal or unauthorized purpose;</li>
                    <li>attempt to bypass or break the security mechanisms of the platform;</li>
                    <li>remove any proprietary notices from the service; or</li>
                    <li>share your account credentials or access with unauthorized third parties.</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="font-bold text-foreground">3. Disclaimer</p>
                  <p>
                    The materials on Killcode's website are provided on an 'as is' basis. Killcode makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="font-bold text-foreground">4. Limitations</p>
                  <p>
                    In no event shall Killcode or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Killcode's website, even if Killcode or a Killcode authorized representative has been notified orally or in writing of the possibility of such damage.
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="font-bold text-foreground">5. Governing Law</p>
                  <p>
                    These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which Killcode operates and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="font-bold text-foreground">6. Contact Us</p>
                  <p>If you have any questions about these Terms, please contact us:</p>
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
