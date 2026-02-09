import { PageHeader } from '@/components/ui';
import { EventDetails } from '@/components/events';

type EventDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Page({ params }: EventDetailsPageProps) {
  const { id } = await params;
  return (
    <div className='container mx-auto px-4 py-8'>
      <PageHeader title='Event Details' subtitle='Learn more about this event' />
      <EventDetails id={id} />
    </div>
  );
}
