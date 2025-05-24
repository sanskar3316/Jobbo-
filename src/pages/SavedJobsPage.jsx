import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import JobCard from '../components/JobCard';
import JobDetailsModal from '../components/JobDetailsModal';
import { motion } from 'framer-motion';
import { FaBookmark } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

export default function SavedJobsPage() {
  const { currentUser } = useAuth();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Memoize the job click handler
  const handleJobClick = useCallback((job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  }, []);

  // Memoize the modal close handler
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedJob(null);
  }, []);

  // Memoize the saved jobs query
  const savedJobsQuery = useMemo(() => {
    if (!currentUser) return null;
    const savedJobsRef = collection(db, 'users', currentUser.uid, 'savedJobs');
    return query(savedJobsRef, orderBy('savedAt', 'desc'));
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || !savedJobsQuery) {
      setLoading(false);
      return;
    }

    // Set up real-time listener with error handling
    const unsubscribe = onSnapshot(
      savedJobsQuery,
      (querySnapshot) => {
        const jobs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSavedJobs(jobs);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching saved jobs:', error);
        setLoading(false);
        toast.error('Failed to load saved jobs');
      }
    );

    // Cleanup subscription
    return () => unsubscribe();
  }, [currentUser, savedJobsQuery]);

  // Memoize the empty state component
  const EmptyState = useMemo(() => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex items-center justify-center bg-gray-50"
    >
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <FaBookmark className="h-16 w-16 text-gray-400" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Saved Jobs Yet</h2>
        <p className="text-gray-600 mb-6">
          Jobs you save will appear here. Start exploring and save jobs that interest you!
        </p>
        <a
          href="/"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Browse Jobs
        </a>
      </div>
    </motion.div>
  ), []);

  // Loading skeleton with optimized rendering
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-6 w-3/4 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 w-full bg-gray-200 rounded"></div>
                  <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
                  <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (savedJobs.length === 0) {
    return EmptyState;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Saved Jobs</h1>
          <p className="mt-2 text-gray-600">
            You have {savedJobs.length} saved {savedJobs.length === 1 ? 'job' : 'jobs'}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {savedJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onJobClick={handleJobClick}
            />
          ))}
        </div>
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