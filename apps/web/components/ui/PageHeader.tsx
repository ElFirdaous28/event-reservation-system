interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className='mb-8'>
      <h1 className='text-foreground mb-2 text-4xl font-bold'>{title}</h1>
      {subtitle && <p className='text-muted'>{subtitle}</p>}
    </div>
  );
}
