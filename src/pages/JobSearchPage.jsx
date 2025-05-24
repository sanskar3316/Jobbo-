import { useState } from 'react';
import { searchJobs } from '../services/jobService';
import JobSearchForm from '../components/JobSearchForm';
import JobCard from '../components/JobCard';
import JobDetailsModal from '../components/JobDetailsModal';
import { motion } from 'framer-motion';
import { FaSearch, FaExclamationTriangle } from 'react-icons/fa';

export default function JobSearchPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSearch = async (searchParams) => {
    setLoading(true);
    setError(null);
    try {
      const data = await searchJobs(searchParams);
      if (!data.results || data.results.length === 0) {
        setError('No jobs found matching your criteria. Try adjusting your search filters.');
      } else {
        setJobs(data.results);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch jobs. Please try again.');
      console.error('Search error:', err);
    }
    setLoading(false);
  };

  const handleJobClick = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Find Your Dream Job</h1>
          <p className="mt-2 text-gray-600">
            Search through thousands of job listings
          </p>
        </div>

        <JobSearchForm onSearch={handleSearch} />

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center">
              <FaExclamationTriangle className="h-5 w-5 text-red-400 mr-3" />
              <div className="text-red-700">{error}</div>
            </div>
          </motion.div>
        )}

        {!loading && !error && jobs.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="flex justify-center mb-4">
              <FaSearch className="h-16 w-16 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Jobs Found</h2>
            <p className="text-gray-600">
              Try adjusting your search criteria to find more jobs
            </p>
          </motion.div>
        )}

        {!loading && !error && jobs.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onJobClick={handleJobClick}
              />
            ))}
          </div>
        )}
      </div>

      {isModalOpen && selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          onClose={closeModal}
        />
      )}
    </div>
  );
} 