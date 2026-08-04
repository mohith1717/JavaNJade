import IntegrationPlaceholder from '../components/common/IntegrationPlaceholder';

export default function Alerts() {
  return (
    <IntegrationPlaceholder
      title="Alerts"
      description="System-generated fraud alerts, assignment queues, and alert lifecycle management."
      implementedEndpoints={[
        'GET /api/transactions',
        'GET /api/validation-errors',
      ]}
      missingDependencies={[
        'GET /api/alerts',
        'GET /api/alerts/{id}',
        'PATCH /api/alerts/{id}/status',
      ]}
    />
  );
}
