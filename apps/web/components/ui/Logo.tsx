export const Logo = ({ className = 'h-8 w-auto' }: { className?: string }) => (
  <div className='group flex cursor-pointer items-center gap-2'>
    <span className='text-foreground text-2xl font-bold tracking-tight'>
      Nex<span className='text-primary'>Event</span>
    </span>
  </div>
);
