import Link from "next/link";

export default function Login() {
  return (
    <div className="max-w-md mx-auto mt-12 p-6 border rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input type="email" className="w-full p-2 border rounded" placeholder="Enter your email" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input type="password" className="w-full p-2 border rounded" placeholder="Enter your password" />
        </div>
        <button type="button" className="w-full bg-[#FFE600] text-black font-semibold py-2 rounded hover:bg-[#E6CF00]">
          Login
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        Don&apos;t have an account? <Link href="/register" className="text-[#2E2E38] font-bold hover:underline">Register</Link>
      </p>
    </div>
  );
}
