import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="bg-[#FFE600] text-black font-bold p-4 shadow-sm border-b border-[#E6CF00]">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-3 text-xl font-bold">
          <div className="bg-white p-1.5 rounded-md shadow-sm flex items-center justify-center">
            <Image src="/ey-logo.png" alt="EY Logo" width={40} height={40} className="object-contain" />
          </div>
          <span>Blogging Portal</span>
        </Link>
        <div className="space-x-4">
          <Link href="/" className="hover:underline">Home</Link>
          <Link href="/blogs" className="hover:underline">Blogs</Link>
          <Link href="/admin/dashboard" className="hover:underline">Admin</Link>
          <Link href="/login" className="hover:underline">Login</Link>
          <Link href="/register" className="hover:underline">Register</Link>
        </div>
      </div>
    </nav>
  );
}
