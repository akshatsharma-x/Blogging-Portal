export default function Profile() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      <div className="bg-white p-6 border rounded-lg shadow-sm">
        <div className="flex items-center mb-6">
          <div className="w-20 h-20 bg-[#FFF9CC] rounded-full flex items-center justify-center text-[#2E2E38] text-2xl font-bold mr-6">
            AS
          </div>
          <div>
            <h2 className="text-2xl font-bold">Akshat Sharma</h2>
            <p className="text-gray-600">akshat@example.com</p>
            <p className="text-sm bg-[#FFF9CC] text-[#2E2E38] font-semibold px-2 py-1 rounded inline-block mt-2">User</p>
          </div>
        </div>
        
        <h3 className="text-xl font-bold mb-4 border-b pb-2">My Blogs</h3>
        <p className="text-gray-600">You haven&apos;t published any blogs yet.</p>
      </div>
    </div>
  );
}
