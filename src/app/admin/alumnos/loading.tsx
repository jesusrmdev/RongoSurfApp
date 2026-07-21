export default function AdminAlumnosLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
      <div className="h-4 w-48 bg-gray-100 rounded animate-pulse mt-2" />
      <div className="mt-8 hidden sm:block">
        <div className="h-8 bg-gray-100 rounded animate-pulse mb-4" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 bg-gray-50 rounded animate-pulse mb-2" />
        ))}
      </div>
      <div className="mt-8 sm:hidden grid gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-sand-dark rounded-lg p-4">
            <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse mt-2" />
            <div className="h-3 w-2/3 bg-gray-50 rounded animate-pulse mt-1" />
          </div>
        ))}
      </div>
    </div>
  );
}
