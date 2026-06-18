export default function SearchBar() {
  return (
    <div className="mb-6">
      <input
        type="text"
        placeholder="Search blogs..."
        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFE600]"
      />
    </div>
  );
}
