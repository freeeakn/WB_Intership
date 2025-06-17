const CitySkeleton = () => {
  return (
    <div className="space-y-4">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="card bg-base-100 shadow-xl">
          <div className="skeleton h-48 w-full"></div>
          <div className="card-body">
            <h2 className="card-title">
              <div className="skeleton h-6 w-3/4"></div>
            </h2>
            <div className="skeleton h-4 w-1/2 my-2"></div>
            <div className="skeleton h-4 w-1/3 my-2"></div>
            <div className="skeleton h-4 w-2/5 my-2"></div>
            <div className="card-actions justify-end mt-4">
              <div className="skeleton h-10 w-24"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CitySkeleton;
