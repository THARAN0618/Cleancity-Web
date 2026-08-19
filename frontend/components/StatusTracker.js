const STEPS = ['Pending', 'In Progress', 'Resolved'];

export default function StatusTracker({ status }) {
  const activeIndex = STEPS.indexOf(status);

  return (
    <div className="flex items-center w-full max-w-md mt-3">
      {STEPS.map((step, i) => (
        <div key={step} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div
              className={`w-3 h-3 rounded-full ${
                i <= activeIndex ? 'bg-forest-700' : 'bg-gray-300'
              }`}
            />
            <span className="text-[11px] mt-1 font-medium text-gray-600">{step}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-0.5 flex-1 mx-1 ${i < activeIndex ? 'bg-forest-700' : 'bg-gray-300'}`} />
          )}
        </div>
      ))}
    </div>
  );
}
