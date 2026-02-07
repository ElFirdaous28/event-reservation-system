export const Logo = ({ className = "h-8 w-auto" }: { className?: string }) => (
  <div className="flex items-center gap-2 group cursor-pointer">
    <span className="font-bold text-2xl tracking-tight text-foreground">
      Nex<span className="text-primary">Event</span>
    </span>
  </div>
);
