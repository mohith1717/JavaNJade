import IntegrationPlaceholder from '../components/common/IntegrationPlaceholder';

export default function Analytics() {
  return (
    <IntegrationPlaceholder
      title="Risk Analytics"
      description="Risk trend analysis, analyst activity, advanced segment comparisons, and historical drilldowns."
      implementedEndpoints={[
        'GET /api/transactions',
        'GET /api/rules',
        'GET /api/validation-errors',
      ]}
      missingDependencies={[
        'GET /api/dashboard/admin',
        'GET /api/dashboard/investigator',
        'GET /api/dashboard/alerts',
      ]}
    />
  );
}
