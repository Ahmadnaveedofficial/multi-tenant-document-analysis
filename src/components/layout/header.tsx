"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  UserButton,
  useOrganization,
  useUser,
  SignInButton,
  SignUpButton,
} from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import {
  Brain,
  Building,
  FileText,
  Home,
  LogIn,
  Menu,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";


/*  Types    */


interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}


/*   Route Constants    */


const ROUTES = {
  HOME: "/",
  SELECT_ORG: "/select-org",
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
} as const;


/*    Component    */


export default function Header() {
  /* Hooks */

  const pathname = usePathname();

  const { user, isSignedIn } = useUser();

  const { organization } = useOrganization();

  const [isOpen, setIsOpen] = useState(false);

  /* Navigation Items */

  const navItems = useMemo<NavItem[]>(() => {
    const items: NavItem[] = [
      {
        href: ROUTES.HOME,
        label: "Home",
        icon: Home,
      },
    ];

    if (organization) {
      items.push(
        {
          href: `/${organization.slug}`,
          label: "Dashboard",
          icon: Building,
        },
        {
          href: `/${organization.slug}/documents`,
          label: "Documents",
          icon: FileText,
        }
      );
    }

    items.push({
      href: ROUTES.SELECT_ORG,
      label: organization
        ? "Switch Organization"
        : "Organizations",
      icon: Users,
    });

    return items;
  }, [organization]);

  /* Helper Methods */

  const isActiveRoute = (href: string) => {
    if (href === ROUTES.HOME) {
      return pathname === ROUTES.HOME;
    }

    return pathname.startsWith(href);
  };

  const userLabel =
    organization?.name ||
    user?.firstName ||
    user?.username ||
    user?.primaryEmailAddress?.emailAddress ||
    "User";

  /* Navigation Renderer*/

  const renderNavigation = (
    mobile = false,
    onClick?: () => void
  ) => {
    return navItems.map((item) => {
      const Icon = item.icon;

      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={onClick}
        >
          <Button
            variant={
              isActiveRoute(item.href)
                ? "secondary"
                : "ghost"
            }
            size={mobile ? "default" : "sm"}
            className={
              mobile
                ? "w-full justify-start gap-2 cursor-pointer"
                : "gap-2 cursor-pointer"
            }
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Button>
        </Link>
      );
    });
  };



 return (
  <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div className="container mx-auto flex h-16 items-center justify-between px-4">

      {/* Logo */}

      <Link
        href={ROUTES.HOME}
        className="flex items-center gap-2 text-xl font-bold"
      >
        <Brain className="h-6 w-6 text-blue-600" />
        <span>DocuAI</span>
      </Link>

      {/* Desktop Navigation */}

      <nav className="hidden items-center gap-2 md:flex">
        {renderNavigation()}
      </nav>

      {/* Right Side */}

      <div className="flex items-center gap-3">

        {/* Desktop Authentication */}

        <div className="hidden items-center gap-3 md:flex">

          {isSignedIn ? (
            <>
              <span className="text-sm text-muted-foreground">
                {organization
                  ? `In: ${userLabel}`
                  : userLabel}
              </span>

              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <Button
                  variant="ghost"
                  size="sm"
                  className="cursor-pointer"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              </SignInButton>

              <SignUpButton mode="modal">
                <Button size="sm"
                  className="cursor-pointer"
                  >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up
                </Button>
              </SignUpButton>
            </>
          )}

        </div>

        {/* Mobile Menu */}

        <div className="md:hidden">

          <Sheet
            open={isOpen}
            onOpenChange={setIsOpen}
          >

            <SheetTrigger asChild>

              <Button
                variant="ghost"
                size="icon"
                className="cursor-pointer"
              >
                <Menu className="h-5 w-5" />
              </Button>

            </SheetTrigger>

            <SheetContent
              side="right"
              className="w-[300px]"
            >

              <div className="mt-8 flex flex-col gap-6">

                {/* Mobile Navigation */}

                <div className="space-y-2">

                  {renderNavigation(
                    true,
                    () => setIsOpen(false)
                  )}

                </div>

                {/* Divider */}

                <div className="border-t pt-6">

                  {isSignedIn ? (
                    <div className="space-y-4">

                      <p className="text-center text-sm text-muted-foreground">
                        {organization
                          ? `In: ${userLabel}`
                          : userLabel}
                      </p>

                      <div className="flex justify-center">
                        <UserButton afterSignOutUrl="/" />
                      </div>

                    </div>
                  ) : (
                    <div className="space-y-3">

                      <SignInButton mode="modal">

                        <Button
                          variant="outline"
                          className="w-full cursor-pointer"
                        >
                          <LogIn className="mr-2 h-4 w-4" />
                          Sign In
                        </Button>

                      </SignInButton>

                      <SignUpButton mode="modal">

                        <Button className="w-full cursor-pointer">
                          <UserPlus className="mr-2 h-4 w-4" />
                          Sign Up
                        </Button>

                      </SignUpButton>

                    </div>
                  )}

                </div>

              </div>

            </SheetContent>

          </Sheet>

        </div>

      </div>

    </div>
  </header>
);
}