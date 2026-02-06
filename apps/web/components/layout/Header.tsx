import Link from "next/link";
import { Logo } from "../shared/Logo";
import { Role } from "@repo/shared";

export function Header() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Logo className="h-10 w-auto" />
        <nav className="flex gap-4">
          <Link
            href="/login"
            className="px-4 py-2 text-foreground hover:text-primary transition-colors"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            Register
          </Link>
        </nav>
      </div>
    </header>
  );
}
