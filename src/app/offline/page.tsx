// app/offline/page.tsx
export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <h1 className="text-2xl font-bold mb-4">You’re Offline</h1>
      <p className="text-gray-400 mb-6">Please check your internet connection.</p>
      <a
        href="/"
        className="px-4 py-2 bg-yellow-500 rounded-lg text-black"
      >
        Go back home
      </a>
    </div>
  );
}   