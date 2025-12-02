"use client";

import { motion } from "framer-motion";
import { NavigationLayout } from "@/components/navigation";
import { ProtectedRoute } from "@/components/protected-route";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileCode2, 
  FileText, 
  Image, 
  Video,
  Monitor,
  Apple,
  Cpu,
  ArrowRight,
  Check,
  Download,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface FileTypeCard {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  isAvailable: boolean;
  platforms?: {
    name: string;
    architectures: string[];
    icon: React.ComponentType<{ className?: string }>;
  }[];
  formats?: string[];
  requiresViewer?: boolean;
}

const fileTypes: FileTypeCard[] = [
  {
    id: "binary",
    title: "Executables / Binaries",
    description: "Protect your executables with access control, download tracking, remote deletion, single-user restrictions, and runtime verification. Files remain inaccessible until verified.",
    icon: FileCode2,
    href: "/files/binaries",
    isAvailable: true,
    platforms: [
      { name: "Linux", architectures: ["x86_64", "x86", "aarch64", "armv7"], icon: Monitor },
      { name: "Windows", architectures: ["x86_64", "x86"], icon: Monitor },
      { name: "macOS", architectures: ["aarch64 (Apple Silicon)", "x86_64"], icon: Apple },
    ],
    formats: [".exe", ".bin", "ELF", "Mach-O"],
  },
  {
    id: "pdf",
    title: "PDF Documents",
    description: "Protect your PDFs with access control, download tracking, remote deletion, single-user restrictions, and runtime verification. Documents remain inaccessible until verified.",
    icon: FileText,
    href: "/files/pdf",
    isAvailable: false,
    formats: [".pdf"],
    requiresViewer: true,
  },
  {
    id: "images",
    title: "Images / Photos",
    description: "Protect your images with access control, download tracking, remote deletion, single-user restrictions, and runtime verification. Images remain inaccessible until verified.",
    icon: Image,
    href: "/files/images",
    isAvailable: false,
    formats: [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"],
    requiresViewer: true,
  },
  {
    id: "videos",
    title: "Videos",
    description: "Protect your videos with offline and online options. Offline: access control, download tracking, remote deletion, single-user restrictions, and runtime verification. Online: DRM streaming protection.",
    icon: Video,
    href: "/files/videos",
    isAvailable: false,
    formats: [".mp4", ".mkv", ".avi", ".mov", ".webm"],
    requiresViewer: true,
  },
];

export default function FilesPage() {
  return (
    <ProtectedRoute>
      <NavigationLayout>
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <PageHeader
              title="Files"
              subtitle="Manage and protect your files with advanced DRM and license management"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {fileTypes.map((fileType, index) => (
                <motion.div
                  key={fileType.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {fileType.isAvailable ? (
                    <Link href={fileType.href} className="block h-full">
                      <FileTypeCardComponent fileType={fileType} />
                    </Link>
                  ) : (
                    <FileTypeCardComponent fileType={fileType} />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </NavigationLayout>
    </ProtectedRoute>
  );
}

function FileTypeCardComponent({ fileType }: { fileType: FileTypeCard }) {
  const IconComponent = fileType.icon;

  return (
    <Card 
      className={cn(
        "h-full transition-all duration-300 border-border/50 shadow-lg bg-card/50 backdrop-blur",
        fileType.isAvailable 
          ? "hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 cursor-pointer group" 
          : "opacity-70"
      )}
    >
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn(
              "p-2.5 sm:p-3 rounded-xl shrink-0",
              fileType.isAvailable 
                ? "bg-primary/10 text-primary" 
                : "bg-muted text-muted-foreground"
            )}>
              <IconComponent className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base sm:text-xl flex items-center gap-2 flex-wrap">
                <span className="break-words">{fileType.title}</span>
                {fileType.isAvailable && (
                  <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0" />
                )}
              </CardTitle>
            </div>
          </div>
          <div className="shrink-0 self-start">
            {!fileType.isAvailable && (
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs whitespace-nowrap">
                Coming Soon
              </Badge>
            )}
            {fileType.isAvailable && (
              <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20 text-xs whitespace-nowrap">
                <Check className="h-3 w-3 mr-1" />
                Available
              </Badge>
            )}
          </div>
        </div>
        <CardDescription className="mt-3 text-sm leading-relaxed">
          {fileType.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Supported Formats */}
        {fileType.formats && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Supported Formats</p>
            <div className="flex flex-wrap gap-1.5">
              {fileType.formats.map((format) => (
                <Badge 
                  key={format} 
                  variant="outline" 
                  className="text-xs font-mono"
                >
                  {format}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Platform Support for Binaries */}
        {fileType.platforms && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-3">Platform Support</p>
            <div className="space-y-3">
              {fileType.platforms.map((platform) => (
                <div key={platform.name} className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-3">
                  <div className="flex items-center gap-2 shrink-0">
                    <platform.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{platform.name}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 ml-6 sm:ml-0">
                    {platform.architectures.map((arch) => (
                      <Badge 
                        key={arch} 
                        variant="secondary" 
                        className="text-[10px] sm:text-xs px-1.5 py-0.5"
                      >
                        {arch}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Viewer App Requirement */}
        {fileType.requiresViewer && (
          <div className="pt-2 border-t border-border/50">
            <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
              <Download className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-foreground">
                  Requires KC-Viewer App
                </p>
                <p className="text-xs text-muted-foreground">
                  Users need the KC-Viewer app to access protected files.
                </p>
                <a 
                  href="#" 
                  className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-3 w-3" />
                  Download KC-Viewer
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-amber-500/10 text-amber-600 border-amber-500/20">
                    Upcoming
                  </Badge>
                </a>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
