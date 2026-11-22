import { cn } from "../../lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "rect" | "circle" | "text";
}

export function Skeleton({ className, variant = "rect", ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-gray-200",
        variant === "circle" && "rounded-full",
        variant === "text" && "rounded h-3 w-full",
        variant === "rect" && "rounded-lg",
        className
      )}
      {...props}
    />
  );
}

// Product card skeleton for loading states
export function ProductCardSkeleton() {
  return (
    <div id="product-card-skeleton" className="card bg-white flex flex-col overflow-hidden">
      {/* Image placeholder */}
      <Skeleton className="h-40 w-full rounded-none bg-gray-150" />

      {/* Content placeholders */}
      <div className="p-3 flex flex-col flex-1 space-y-3">
        {/* Category/Unit placeholder */}
        <Skeleton variant="text" className="w-1/3 h-2.5 bg-gray-100" />
        
        {/* Title placeholder */}
        <div className="space-y-1.5">
          <Skeleton variant="text" className="w-11/12 h-4 bg-gray-100" />
          <Skeleton variant="text" className="w-2/3 h-4 bg-gray-100" />
        </div>

        {/* Rating placeholder */}
        <div className="flex items-center gap-1.5 pt-1">
          <Skeleton variant="circle" className="w-3.5 h-3.5 bg-gray-100" />
          <Skeleton variant="text" className="w-16 h-3 bg-gray-100" />
        </div>

        {/* Price & Button placeholder */}
        <div className="mt-auto pt-2 flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton variant="text" className="w-20 h-4 bg-gray-100" />
          </div>
          <Skeleton variant="circle" className="w-8 h-8 bg-gray-100" />
        </div>
      </div>
    </div>
  );
}

interface ProductGridSkeletonProps {
  count?: number;
}

export function ProductGridSkeleton({ count = 5 }: ProductGridSkeletonProps) {
  return (
    <div id="product-grid-skeleton" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {[...Array(count)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
