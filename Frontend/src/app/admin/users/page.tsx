import { users } from "@/data/blogs";

export default function ManageUsers() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Users</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden border">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-4 font-bold text-gray-700">ID</th>
              <th className="p-4 font-bold text-gray-700">Name</th>
              <th className="p-4 font-bold text-gray-700">Role</th>
              <th className="p-4 font-bold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="p-4">{user.id}</td>
                <td className="p-4">{user.name}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-sm ${user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4 space-x-2">
                  <button className="text-[#2E2E38] font-semibold hover:underline">Edit</button>
                  {user.role !== 'Admin' && (
                    <button className="text-red-600 hover:text-red-800">Delete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
