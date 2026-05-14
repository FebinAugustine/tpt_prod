import { cn } from '../../utils/cn';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%]',
        className
      )}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-20" />
        </div>
        <Skeleton className="w-12 h-12 rounded-full" />
      </div>
      <Skeleton className="h-4 w-32 mt-3" />
    </div>
  );
}

export function ButtonSkeleton() {
  return <Skeleton className="h-12 w-full rounded-lg" />;
}

export function InputSkeleton() {
  return <Skeleton className="h-10 w-full rounded-lg" />;
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 py-3">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
  );
}

export function ModalSkeleton() {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 w-full max-w-2xl">
        <div className="space-y-4">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <div className="flex gap-3 mt-6">
            <ButtonSkeleton />
            <ButtonSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}