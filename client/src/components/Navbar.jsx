import { Link } from "react-router-dom"

export default function Navbar() {
  return (
    <nav className="bg-slate-800 py-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center px-4">
        <h1 className="text-2xl font-bold text-white">FactoryFlow Lite</h1>
        <div className="space-x-4 text-gray-300">
          <Link to="/" className="hover:text-blue-400 transition">Inicio</Link>
          <Link to="/login" className="hover:text-blue-400 transition">Login</Link>
        </div>
      </div>
    </nav>
  )
}
