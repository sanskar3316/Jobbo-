import { FaBuilding, FaMapMarkerAlt, FaMoneyBillWave, FaClock, FaHeart } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import toast from 'react-hot-toast';

export default function JobCard({ job, onJobClick }) {
  const { currentUser } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Debug logging for component mount and updates
  useEffect(() => {
    console.log('JobCard mounted/updated:', {
      currentUser: currentUser?.uid,
      jobId: job?.id,
      jobTitle: job?.title
    });
  }, [currentUser, job]);

  useEffect(() => {
    const checkIfSaved = async () => {
      if (!currentUser) {
        console.log('No current user, skipping saved check');
        return;
      }
      if (!job?.id) {
        console.error('Job ID is missing, cannot check saved status');
        return;
      }

      try {
        console.log('Checking if job is saved:', job.id);
        const jobRef = doc(db, 'users', currentUser.uid, 'savedJobs', job.id);
        const docSnap = await getDoc(jobRef);
        const exists = docSnap.exists();
        console.log('Job saved status:', exists);
        setIsSaved(exists);
      } catch (error) {
        console.error('Error checking saved status:', error);
        toast.error('Failed to check saved status');
      }
    };
    checkIfSaved();
  }, [currentUser, job?.id]);

  const handleSaveJob = async (e) => {
    e.stopPropagation(); // Prevent the job card click event
    
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
      console.log('Starting save operation:', {
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
        console.log('Removing saved job:', job.id);
        await deleteDoc(jobRef);
        setIsSaved(false); // Turn heart grey
        toast.success('Job removed from saved jobs');
      } else {
        console.log('Saving job:', job.id);
        await setDoc(jobRef, jobData);
        setIsSaved(true); // Turn heart red
        toast.success('Job saved successfully');
      }
    } catch (error) {
      console.error('Error in handleSaveJob:', error);
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
    console.error('JobCard received invalid job prop');
    return null;
  }

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
              {job.title}
            </h3>
            <div className="flex items-center text-gray-600 mb-4">
              <FaBuilding className="h-4 w-4 mr-2" />
              <span className="text-sm">{job.company_name || 'Company not specified'}</span>
            </div>
          </div>
          <div className="flex items-start space-x-2">
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
                <FaHeart className="h-5 w-5" />
              </button>
            )}
            {job.company_logo && (
              <img
                src={job.company_logo}
                alt={`${job.company_name} logo`}
                className="w-12 h-12 object-contain rounded"
              />
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center text-gray-600">
            <FaMapMarkerAlt className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="text-sm">{job.location?.display_name || 'Location not specified'}</span>
          </div>

          <div className="flex items-center text-gray-600">
            <FaMoneyBillWave className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="text-sm">{formatSalary(job.salary_min)} - {formatSalary(job.salary_max)}</span>
          </div>

          <div className="flex items-center text-gray-600">
            <FaClock className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="text-sm">Posted {formatDate(job.created)}</span>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {job.category?.label && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {job.category.label}
              </span>
            )}
            {job.contract_type && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                {job.contract_type}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => onJobClick(job)}
          className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
        >
          View Details
        </button>
      </div>
    </motion.div>
  );
} 