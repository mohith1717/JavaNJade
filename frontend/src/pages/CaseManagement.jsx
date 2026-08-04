import IntegrationPlaceholder from '../components/common/IntegrationPlaceholder';

export default function CaseManagement() {
  return (
    <IntegrationPlaceholder
      title="Case Management"
      description="Investigation queues, analyst assignments, evidence notes, and resolution workflows."
      implementedEndpoints={[
        'GET /api/transactions/{id}',
        'GET /api/transactions/{id}/validation-errors',
      ]}
      missingDependencies={[
        'GET /api/cases',
        'GET /api/cases/{id}',
        'POST /api/cases/{id}/action',
      ]}
    />
  );
}
