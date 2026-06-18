export default function CreateBlog() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create New Blog</h1>
      
      <form className="bg-white p-6 rounded-lg shadow border space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input type="text" className="w-full p-2 border rounded" placeholder="Blog title" />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Author</label>
          <input type="text" className="w-full p-2 border rounded" placeholder="Author name" defaultValue="Akshat Sharma" />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select className="w-full p-2 border rounded">
            <option>Draft</option>
            <option>Published</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Content</label>
          <textarea className="w-full p-2 border rounded h-48" placeholder="Write your blog content here..."></textarea>
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <button type="button" className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200">Cancel</button>
          <button type="button" className="px-4 py-2 bg-[#FFE600] text-black font-semibold rounded hover:bg-[#E6CF00]">Save Blog</button>
        </div>
      </form>
    </div>
  );
}
