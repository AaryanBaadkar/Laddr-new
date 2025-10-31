import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initial = params.get('search') || '';
  const [term, setTerm] = useState(initial);

  const onSubmit = (e) => {
    e.preventDefault();
    const query = term.trim();
    if (query.length === 0) {
      navigate('/explore');
    } else {
      navigate(`/explore?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-6">
            <Link to="/" className="text-xl font-bold text-blue-600">Laddr</Link>
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/explore" className="text-gray-700 hover:text-blue-600">Explore</Link>
              <Link to="/compare" className="text-gray-700 hover:text-blue-600">Compare</Link>
              <Link to="/analytics" className="text-gray-700 hover:text-blue-600">Analytics</Link>
              <Link to="/contact" className="text-gray-700 hover:text-blue-600">Contact</Link>
            </div>
          </div>
          <div className="flex-1 max-w-xl mx-4">
            <form onSubmit={onSubmit} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="Search by location, city, title..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </form>
          </div>
          <div className="flex items-center space-x-3">
            <Link to="/login" className="text-gray-700 hover:text-blue-600">Login</Link>
            <Link to="/signup" className="bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">Sign up</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;


