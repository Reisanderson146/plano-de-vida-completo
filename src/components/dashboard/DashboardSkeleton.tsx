import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function AreaCardSkeleton() {
  return (
    <div className="relative rounded-2xl p-4 sm:p-5 min-w-[140px] sm:min-w-0 border border-border/40 bg-muted/10">
      <Skeleton className="w-11 h-11 rounded-xl mb-3" />
      <Skeleton className="h-4 w-20 mb-2" />
      <Skeleton className="h-8 w-16 mb-3" />
      <Skeleton className="h-2.5 w-full rounded-full mb-2" />
      <Skeleton className="h-3 w-14" />
    </div>
  );
}

export function AreaCardsSkeleton() {
  return (
    <div className="relative">
      <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-hide">
        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4 min-w-max sm:min-w-0">
          {Array.from({ length: 7 }).map((_, index) => (
            <AreaCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function PendingGoalsSkeleton() {
  return (
    <Card className="border-border/40 h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-muted/20">
            <Skeleton className="w-5 h-5 rounded-md mt-0.5" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function ChartSkeleton() {
  return (
    <Card className="border-border/40 h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] flex items-end justify-around gap-2 pt-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex flex-col items-center gap-2 flex-1">
              <Skeleton 
                className="w-full rounded-t-lg" 
                style={{ height: `${40 + Math.random() * 100}px` }}
              />
              <Skeleton className="h-3 w-8" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function ProgressChartSkeleton() {
  return (
    <Card className="border-border/40">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-5 w-16 rounded-lg" />
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-5">
        <div className="flex items-center justify-center h-[300px]">
          <div className="relative w-64 h-64">
            <Skeleton className="w-full h-full rounded-full opacity-20" />
            <div className="absolute inset-8">
              <Skeleton className="w-full h-full rounded-full opacity-30" />
            </div>
            <div className="absolute inset-16">
              <Skeleton className="w-full h-full rounded-full opacity-40" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardContentSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6 animate-pulse">
      <AreaCardsSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        <PendingGoalsSkeleton />
        <ChartSkeleton />
      </div>
      <ProgressChartSkeleton />
    </div>
  );
}
