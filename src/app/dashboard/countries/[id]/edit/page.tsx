import CountryForm from '../../components/CountryForm';

export default async function EditCountryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <CountryForm countryId={id} />;
}
