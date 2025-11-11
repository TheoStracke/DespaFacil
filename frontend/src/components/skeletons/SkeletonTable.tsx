import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 p-4 border-b">
        <div className="flex gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      
      {/* Rows */}
      <div className="divide-y">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="p-4">
            <div className="flex gap-4 items-center">
              {[...Array(5)].map((_, j) => (
                <Skeleton key={j} className="h-4 flex-1" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
