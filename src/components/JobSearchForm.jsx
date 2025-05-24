import { useState } from 'react';
import { FaSearch, FaMapMarkerAlt, FaMoneyBillWave } from 'react-icons/fa';

export default function JobSearchForm({ onSearch }) {
  const [searchParams, setSearchParams] = useState({
    query: '',
    location: '',
    salaryMin: '',
    fullTime: false,
    permanent: false,
    sortBy: 'date'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchParams);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            name="query"
            value={searchParams.query}
            onChange={handleChange}
            placeholder="Job title or keywords"
            className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            name="location"
            value={searchParams.location}
            onChange={handleChange}
            placeholder="Location"
            className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaMoneyBillWave className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="number"
            name="salaryMin"
            value={searchParams.salaryMin}
            onChange={handleChange}
            placeholder="Minimum salary"
            className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="fullTime"
            name="fullTime"
            checked={searchParams.fullTime}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="fullTime" className="ml-2 text-sm text-gray-700">
            Full Time
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="permanent"
            name="permanent"
            checked={searchParams.permanent}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="permanent" className="ml-2 text-sm text-gray-700">
            Permanent
          </label>
        </div>

        <div className="flex items-center">
          <select
            name="sortBy"
            value={searchParams.sortBy}
            onChange={handleChange}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="date">Sort by Date</option>
            <option value="salary">Sort by Salary</option>
          </select>
        </div>
      </div>

      <div className="mt-6">
        <button
          type="submit"
          className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Search Jobs
        </button>
      </div>
    </form>
  );
} 