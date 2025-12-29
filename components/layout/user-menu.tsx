"use client"

import { User, Settings, Package, LayoutDashboard, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { logoutAction } from "@/app/actions/auth"
import type { SessionUser } from "@/lib/session"

export function UserMenu({ session, locale }: { session: SessionUser; locale: "fr" | "en" }) {
  const translations = {
    fr: {
      myAccount: "Mon compte",
      orders: "Mes commandes",
      dashboard: "Tableau de bord",
      settings: "Paramètres",
      logout: "Déconnexion",
    },
    en: {
      myAccount: "My account",
      orders: "My orders",
      dashboard: "Dashboard",
      settings: "Settings",
      logout: "Logout",
    },
  }

  const t = translations[locale]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{session.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{session.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {session.role === "seller" && (
          <DropdownMenuItem asChild>
            <Link href={`/vendor/dashboard?lang=${locale}`} className="cursor-pointer">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              {t.dashboard}
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href={`/account/orders?lang=${locale}`} className="cursor-pointer">
            <Package className="mr-2 h-4 w-4" />
            {t.orders}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/account/settings?lang=${locale}`} className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            {t.settings}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <form action={logoutAction} className="w-full">
            <button type="submit" className="flex w-full items-center cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              {t.logout}
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
