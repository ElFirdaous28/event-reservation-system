import { EventsList } from '@/components/events';
import { PageHeader } from '@/components/ui';

export default function Page() {
  return (
    <div className='container mx-auto px-4 py-8'>
      <PageHeader title='Upcoming Events' subtitle='Discover and register for upcoming events' />
      <EventsList />
    </div>
  );
}
