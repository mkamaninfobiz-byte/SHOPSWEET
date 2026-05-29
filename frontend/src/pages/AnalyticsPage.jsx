import KpiCard from '../components/KpiCard';

const AnalyticsPage = () => {
  const stats = [
    { title: 'Revenue', value: '$498.2K', subtitle: 'Total revenue this quarter' },
    { title: 'Orders', value: '7,842', subtitle: 'Total ecommerce orders' },
    { title: 'Top product', value: 'Chocolate Box', subtitle: 'Best selling item' },
    { title: 'Return rate', value: '2.8%', subtitle: 'Order return ratio' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-4">
        {stats.map((stat) => (<KpiCard key={stat.title} {...stat} />))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Customer engagement</h2>
          <div className="mt-6 h-64 rounded-3xl bg-slate-100" />
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Inventory health</h2>
          <div className="mt-6 h-64 rounded-3xl bg-slate-100" />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
