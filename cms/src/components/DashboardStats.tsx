/**
 * Dashboard Stats Component
 *
 * Displays summary statistics cards for posts with circular icon backgrounds.
 */

import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

interface DashboardStatsProps {
  total: number;
  published: number;
  draft: number;
  trash: number;
}

export function DashboardStats({ total, published, draft, trash }: DashboardStatsProps) {
  const stats = [
    {
      label: '文章总数',
      value: total,
      icon: 'ri:file-list-3-line',
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-500/20',
    },
    {
      label: '已发布',
      value: published,
      icon: 'ri:check-line',
      iconColor: 'text-green-500',
      bgColor: 'bg-green-500/20',
    },
    {
      label: '草稿',
      value: draft,
      icon: 'ri:draft-line',
      iconColor: 'text-orange-500',
      bgColor: 'bg-orange-500/20',
    },
    {
      label: '回收站',
      value: trash,
      icon: 'ri:delete-bin-line',
      iconColor: 'text-rose-500',
      bgColor: 'bg-rose-500/20',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-4">
            <div className={cn('flex size-12 shrink-0 items-center justify-center rounded-full', stat.bgColor)}>
              <Icon icon={stat.icon} className={cn('size-6', stat.iconColor)} />
            </div>
            <div>
              <p className="font-bold text-2xl">{stat.value}</p>
              <p className="text-muted-foreground text-sm">{stat.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
