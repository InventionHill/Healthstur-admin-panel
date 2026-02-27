import DurationForm from '../components/DurationForm';
import { use } from 'react';

export default function EditDurationPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    return <DurationForm id={resolvedParams.id} />;
}
