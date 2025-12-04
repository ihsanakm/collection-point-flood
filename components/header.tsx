"use client"

import { useLanguage } from "./language-provider"
import { Button } from "./ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { Globe, Shield } from "lucide-react"
import Link from "next/link"
import type { Language } from "@/lib/types"

const languages: { code: Language; label: string }[] = [
  { code: "en", label: "English" },
  { code: "si", label: "සිංහල" },
  { code: "ta", label: "தமிழ்" },
]

export function Header() {
  const { language, setLanguage, t } = useLanguage()

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/" className="flex flex-col">
          <h1 className="text-lg font-bold text-primary leading-tight">{t("appTitle")}</h1>
          <span className="text-xs text-muted-foreground">{t("appSubtitle")}</span>
        </Link>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Globe className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={language === lang.code ? "bg-secondary" : ""}
                >
                  {lang.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/admin">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Shield className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
