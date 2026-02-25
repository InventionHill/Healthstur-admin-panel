import CuratedTrackForm from '../CuratedTrackForm';

export default function CreateCuratedTrackPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Add New Curated Track</h1>
                    <p className="text-sm text-gray-500 mt-1">Create a new curated track for the home page slider.</p>
                </div>
            </div>

            <CuratedTrackForm />
        </div>
    );
}
