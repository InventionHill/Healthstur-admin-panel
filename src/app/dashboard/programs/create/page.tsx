import ProgramForm from '../ProgramForm';

export default function CreateProgramPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Add New Program</h1>
                    <p className="text-sm text-gray-500 mt-1">Create a new program and design its landing page details.</p>
                </div>
            </div>

            <ProgramForm />
        </div>
    );
}
