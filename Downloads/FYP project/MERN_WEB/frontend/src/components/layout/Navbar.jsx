import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FiSearch,
  FiShoppingCart,
  FiHeart,
  FiUser,
  FiMenu,
  FiX,
  FiCamera,
  FiLogOut,
  FiSettings,
  FiGrid,
  FiChevronDown
} from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'
import { useFavorites } from '../../contexts/FavoritesContext'
import VisualSearchModal from '../products/VisualSearchModal'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const { itemCount } = useCart()
  const { favoritesCount } = useFavorites()
  const navigate = useNavigate()
  const [isVisualSearchOpen, setIsVisualSearchOpen] = useState(false)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
    navigate('/login')
  }

  const handleVisualSearchResults = (products, analysis) => {
    navigate('/products', { state: { aiProducts: products, analysis: analysis } })
  }

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 border-b flex items-center ${scrolled
          ? 'bg-slate-900/90 backdrop-blur-md border-slate-700/50 shadow-lg h-20'
          : 'bg-slate-900 border-transparent h-20'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group relative z-10">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 flex items-center justify-center shadow-xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-blue-400 to-indigo-500">A</span>
                </div>
              </div>
              <span className="text-xl font-bold text-white tracking-tight group-hover:text-blue-200 transition-colors duration-300">
                Artisan<span className="text-blue-500">Mart</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {[
                { name: 'Products', path: '/products' },
                { name: 'Artisans', path: '/artisans' },
                { name: 'About', path: '/about' }
              ].map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="relative px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200 group"
                >
                  <span className="relative z-10">{item.name}</span>
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                  <span className="absolute inset-0 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-0 scale-90 group-hover:scale-100"></span>
                </Link>
              ))}
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8 relative">
              <div className="relative w-full group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg blur opacity-0 group-hover:opacity-30 transition duration-1000 group-focus-within:opacity-50"></div>
                <div className="relative flex items-center bg-slate-800/80 rounded-lg border border-slate-700 focus-within:border-blue-500/50 shadow-inner overflow-hidden transition-all duration-200">
                  <div className="pl-4 text-slate-400">
                    <FiSearch className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search for products..."
                    className="w-full bg-transparent border-none text-white placeholder-slate-400 px-4 py-2.5 focus:ring-0 text-sm"
                  />
                  <button
                    onClick={() => setIsVisualSearchOpen(true)}
                    className="p-2 mr-1 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-md transition-all duration-200 group/camera"
                    title="Search by image"
                  >
                    <FiCamera className="h-5 w-5 group-hover/camera:text-blue-400 transition-colors" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="hidden md:flex items-center space-x-3">
              {/* Favorites */}
              <Link
                to="/favorites"
                className="relative p-2.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200 group"
              >
                <FiHeart className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                {favoritesCount > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 bg-rose-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center border-2 border-slate-900 transform scale-100 group-hover:scale-110 transition-transform">
                    {favoritesCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-2.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200 group"
              >
                <FiShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                {itemCount > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 bg-blue-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center border-2 border-slate-900 transform scale-100 group-hover:scale-110 transition-transform">
                    {itemCount}
                  </span>
                )}
              </Link>

              <div className="h-6 w-px bg-slate-700 mx-2"></div>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative group">
                  <button className="flex items-center space-x-3 p-1.5 pr-3 text-slate-200 hover:bg-slate-800 rounded-full border border-transparent hover:border-slate-700 transition-all duration-200">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                      <span className="text-xs font-bold text-white">{user?.name?.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex flex-col items-start leading-none">
                      <span className="text-sm font-medium">{user?.name?.split(' ')[0]}</span>
                    </div>
                    <FiChevronDown className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                  </button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-60 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 py-2 origin-top-right transform opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0 z-50">
                    <div className="px-4 py-3 border-b border-slate-700/50 mb-2">
                      <p className="text-sm font-medium text-white">{user?.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                      <span className="mt-2 inline-block px-2 py-0.5 text-[10px] font-medium bg-blue-500/10 text-blue-400 rounded border border-blue-500/20 capitalize">
                        {user?.role} Account
                      </span>
                    </div>

                    <Link to="/dashboard" className="flex items-center space-x-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors">
                      <FiGrid className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                    <Link to="/profile" className="flex items-center space-x-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors">
                      <FiUser className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>


                    <div className="border-t border-slate-700/50 my-2"></div>

                    <button onClick={handleLogout} className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-left">
                      <FiLogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg hover:shadow-blue-500/30 transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700"
              >
                {isMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden absolute w-full bg-slate-900 border-b border-slate-800 shadow-2xl transition-all duration-300 ease-in-out overflow-hidden ${isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
            }`}
        >
          <div className="px-4 pt-2 pb-6 space-y-4">
            {/* Mobile Search */}
            <div className="relative mt-4 mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search products..."
                className="w-full bg-slate-800 border-slate-700 text-white placeholder-slate-400 rounded-lg pl-10 pr-10 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => setIsVisualSearchOpen(true)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md"
              >
                <FiCamera className="h-5 w-5" />
              </button>
            </div>

            <nav className="space-y-2">
              {[
                { name: 'Products', path: '/products' },
                { name: 'Artisans', path: '/artisans' },
                { name: 'About', path: '/about' },
                { name: 'Favorites', path: '/favorites', badge: favoritesCount },
                { name: 'Cart', path: '/cart', badge: itemCount }
              ].map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="flex items-center justify-between px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="font-medium">{item.name}</span>
                  {item.badge > 0 && (
                    <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">{item.badge}</span>
                  )}
                </Link>
              ))}
            </nav>

            <div className="border-t border-slate-800 pt-4 mt-4">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <div className="flex items-center px-4 space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                      <span className="text-sm font-bold text-white">{user?.name?.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{user?.name}</p>
                      <p className="text-xs text-slate-400">{user?.role}</p>
                    </div>
                  </div>
                  <Link
                    to="/dashboard"
                    className="block px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 px-2">
                  <Link
                    to="/login"
                    className="flex justify-center items-center py-3 text-slate-300 hover:text-white font-medium bg-slate-800 hover:bg-slate-750 rounded-xl transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="flex justify-center items-center py-3 text-white font-medium bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-900/20 transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      {/* Spacer to prevent content from hiding behind fixed navbar */}
      <div className="h-20"></div>

      <VisualSearchModal
        isOpen={isVisualSearchOpen}
        onClose={() => setIsVisualSearchOpen(false)}
        onSearchResults={handleVisualSearchResults}
      />
    </>
  )
}

export default Navbar

