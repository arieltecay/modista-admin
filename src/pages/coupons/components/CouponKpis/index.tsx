import type { CouponKpisProps } from './types';

export const CouponKpis = ({ title, items }: CouponKpisProps) => (
  <section aria-label={title} className="grid grid-cols-1 min-[375px]:grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
    {items.map((item) => (
      <article key={item.label} className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-sm">
        <p className="text-sm text-gray-500">{item.label}</p>
        <p className="mt-1 break-words text-base font-bold sm:text-2xl lg:text-base xl:text-xl text-gray-900">{item.value}</p>
      </article>
    ))}
  </section>
);

export default CouponKpis;
