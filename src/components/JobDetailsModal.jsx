import { FaTimes, FaBuilding, FaMapMarkerAlt, FaMoneyBillWave, FaClock, FaExternalLinkAlt, FaHeart } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import toast from 'react-hot-toast';

export default function JobDetailsModal({ job, onClose }) {
  const { currentUser } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Debug logging for component mount and updates
  useEffect(() => {
    console.log('JobDetailsModal mounted/updated:', {
      currentUser: currentUser?.uid,
      jobId: job?.id,
      jobTitle: job?.title
    });
  }, [currentUser, job]);

  useEffect(() => {
    const checkIfSaved = async () => {
      if (!currentUser) {
        console.log('No current user, skipping saved check in modal');
        return;
      }
      if (!job?.id) {
        console.error('Job ID is missing, cannot check saved status in modal');
        return;
      }

      try {
        console.log('Checking if job is saved in modal:', job.id);
        const jobRef = doc(db, 'users', currentUser.uid, 'savedJobs', job.id);
        const docSnap = await getDoc(jobRef);
        const exists = docSnap.exists();
        console.log('Job saved status in modal:', exists);
        setIsSaved(exists);
      } catch (error) {
        console.error('Error checking saved status in modal:', error);
        toast.error('Failed to check saved status');
      }
    };
    checkIfSaved();
  }, [currentUser, job?.id]);

  const formatSalary = (salary) => {
    if (!salary) return 'Salary not specified';
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0
    }).format(salary);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const handleSaveJob = async () => {
    // Validation checks
    if (!currentUser) {
      toast.error('Please login to save jobs');
      return;
    }

    if (!job?.id) {
      toast.error('Job ID is missing. Cannot save.');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Starting save operation in modal:', {
        userId: currentUser.uid,
        jobId: job.id,
        currentSavedState: isSaved
      });

      const jobRef = doc(db, 'users', currentUser.uid, 'savedJobs', job.id);
      
      // Create a simplified job data object with only essential fields
      const jobData = {
        id: job.id,
        title: job.title || '',
        company_name: job.company_name || '',
        company_logo: job.company_logo || '',
        location: job.location?.display_name || 'Location not specified',
        salary_min: job.salary_min || 0,
        salary_max: job.salary_max || 0,
        description: job.description || '',
        category: job.category?.label || 'Category not specified',
        contract_type: job.contract_type || '',
        created: job.created || new Date().toISOString(),
        redirect_url: job.redirect_url || '',
        savedAt: new Date().toISOString()
      };

      if (isSaved) {
        console.log('Removing saved job from modal:', job.id);
        await deleteDoc(jobRef);
        setIsSaved(false); // Turn heart grey
        toast.success('Job removed from saved jobs');
      } else {
        console.log('Saving job from modal:', job.id);
        await setDoc(jobRef, jobData);
        setIsSaved(true); // Turn heart red
        toast.success('Job saved successfully');
      }
    } catch (error) {
      console.error('Error in handleSaveJob in modal:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      // User-friendly error messages based on error type
      if (error.code === 'permission-denied') {
        toast.error('You do not have permission to save jobs. Please try logging in again.');
      } else {
        toast.error('Failed to save job. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Early return if job is invalid
  if (!job) {
    console.error('JobDetailsModal received invalid job prop');
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h2>
                <div className="flex items-center text-gray-600 mb-4">
                  <FaBuilding className="h-5 w-5 mr-2" />
                  <span className="text-lg">{job.company_name || 'Company not specified'}</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {currentUser && (
                  <button
                    onClick={handleSaveJob}
                    disabled={isLoading}
                    className={`p-2 rounded-full transition-colors duration-200 ${
                      isSaved 
                        ? 'text-red-500 hover:text-red-600' 
                        : 'text-gray-400 hover:text-red-500'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    aria-label={isSaved ? 'Unsave job' : 'Save job'}
                  >
                    <FaHeart className="h-6 w-6" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 rounded-full text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <FaTimes className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <FaMapMarkerAlt className="h-5 w-5 mr-3 flex-shrink-0" />
                  <span>{job.location?.display_name || 'Location not specified'}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaMoneyBillWave className="h-5 w-5 mr-3 flex-shrink-0" />
                  <span>{formatSalary(job.salary_min)} - {formatSalary(job.salary_max)}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaClock className="h-5 w-5 mr-3 flex-shrink-0" />
                  <span>Posted {formatDate(job.created)}</span>
                </div>
              </div>

              <div className="space-y-4">
                {job.category?.label && (
                  <div className="flex items-center">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {job.category.label}
                    </span>
                  </div>
                )}
                {job.contract_type && (
                  <div className="flex items-center">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {job.contract_type}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {job.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h3>
                <div className="prose max-w-none text-gray-600">
                  {job.description}
                </div>
              </div>
            )}

            {job.redirect_url && (
              <div className="flex justify-end">
                <a
                  href={job.redirect_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  Apply Now
                  <FaExternalLinkAlt className="ml-2 h-4 w-4" />
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 