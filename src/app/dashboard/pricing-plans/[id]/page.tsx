import PlanForm from '../components/PlanForm';
import { use } from 'react';

export default function EditPlanPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    return <PlanForm id={resolvedParams.id} />;
}
