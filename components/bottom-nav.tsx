"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MapPin, List, Plus, AlertTriangle, Home } from "lucide-react"
import { useLanguage } from "./language-provider"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", icon: Home, labelKey: "home" },
  { href: "/map", icon: MapPin, labelKey: "map" },
  { href: "/add", icon: Plus, labelKey: "add" },
  { href: "/list", icon: List, labelKey: "list" },
  { href: "/report", icon: AlertTriangle, labelKey: "report" },
]

export function BottomNav() {
  const pathname = usePathname()
  const { t } = useLanguage()

  // Hide nav on admin pages
  if (pathname.startsWith("/admin")) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card safe-area-bottom">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[64px]",
                isActive ? "text-primary bg-secondary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className={cn("h-6 w-6", item.href === "/add" && "h-7 w-7")} />
              <span className="text-xs font-medium">{t(item.labelKey)}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
