import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Shield, Scale, FileText, Mail, Copyright } from "lucide-react";
import Link from "next/link";

export default function LicensePage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-card border border-muted">
              <Scale className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight">License Information</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Please read the following license terms carefully before using Killcode software.
          </p>
        </div>

        {/* License Card */}
        <Card className="bg-card border-muted shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-2xl text-foreground flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Proprietary License
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Last updated: December 2025
                </CardDescription>
              </div>
              <Badge variant="outline" className="border-primary text-primary">
                Active
              </Badge>
            </div>
          </CardHeader>
          <Separator className="bg-muted" />
          <CardContent className="p-0">
            <ScrollArea className="h-[600px] w-full p-6">
              <div className="space-y-6 text-foreground font-mono text-sm leading-relaxed">
                <div className="space-y-2">
                  <p className="font-bold text-foreground">Copyright (c) 2025 Killcode</p>
                  <p>All rights reserved.</p>
                  <p>This license applies to all code, binaries, and documentation in this repository and its subdirectories unless otherwise noted.</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-foreground border-b border-muted pb-2">LICENSE TERMS</h3>

                  <section className="space-y-2">
                    <h4 className="font-bold text-foreground">1. GRANT OF LICENSE</h4>
                    <p>
                      This software and associated documentation files (the "Software") are the 
                      proprietary property of the copyright holder. Permission is granted to use 
                      the Software for personal, educational, and evaluation purposes only.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h4 className="font-bold text-foreground">2. RESTRICTIONS</h4>
                    <p>You may NOT:</p>
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                      <li>Use the Software for commercial purposes</li>
                      <li>Sell, rent, lease, or sublicense the Software</li>
                      <li>Distribute, reproduce, or create derivative works</li>
                      <li>Remove or alter any proprietary notices or labels</li>
                      <li>Reverse engineer, decompile, or disassemble the Software (except as explicitly permitted by law)</li>
                    </ul>
                  </section>

                  <section className="space-y-2">
                    <h4 className="font-bold text-foreground">3. COMMERCIAL USE PROHIBITION</h4>
                    <p>"Commercial use" includes but is not limited to:</p>
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                      <li>Using the Software in a business environment</li>
                      <li>Providing services to third parties using the Software</li>
                      <li>Integrating the Software into commercial products</li>
                      <li>Using the Software to generate revenue directly or indirectly</li>
                    </ul>
                    <p className="mt-2 italic text-muted-foreground">
                      For commercial licensing inquiries, contact the copyright holder.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h4 className="font-bold text-foreground">4. NO WARRANTY</h4>
                    <p className="uppercase text-xs tracking-wide text-muted-foreground">
                      THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
                      IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
                      FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
                      AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
                      LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
                      OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
                      SOFTWARE.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h4 className="font-bold text-foreground">5. TERMINATION</h4>
                    <p>
                      This license is effective until terminated. Your rights under this license 
                      will terminate automatically without notice if you fail to comply with any 
                      of its terms. Upon termination, you must destroy all copies of the Software.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h4 className="font-bold text-foreground">6. GOVERNING LAW</h4>
                    <p>
                      This license shall be governed by and construed in accordance with the laws 
                      of the jurisdiction in which the copyright holder resides, without regard to 
                      its conflict of law provisions.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h4 className="font-bold text-foreground">7. LICENSE MODIFICATIONS</h4>
                    <p>
                      The copyright holder reserves the right to modify, update, or change the 
                      terms of this license at any time without prior notice. Continued use of 
                      the Software after any such changes constitutes your acceptance of the new 
                      terms. It is your responsibility to review this license periodically for 
                      updates.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h4 className="font-bold text-foreground">8. CONTACT</h4>
                    <p>For permissions, commercial licensing, or other inquiries:</p>
                    <div className="flex items-center gap-2 mt-2 text-primary">
                      <Mail className="w-4 h-4" />
                      <a href="mailto:admin@killcode.app" className="hover:underline">admin@killcode.app</a>
                    </div>
                  </section>
                </div>

                <Separator className="bg-muted my-6" />

                <p className="text-xs text-muted-foreground text-center">
                  By using the Software, you acknowledge that you have read this license, 
                  understand it, and agree to be bound by its terms and conditions.
                </p>
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
