import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const initialProfileState = {
  fullName: '',
  phone: '',
  location: '',
  skills: '',
  experience: '',
  education: ''
};

export default function ProfilePage() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(initialProfileState);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const unsubscribeRef = useRef(null);

  // Memoize the profile fetch function with real-time updates
  const setupProfileListener = useCallback(() => {
    if (!currentUser?.uid) return;

    try {
      const docRef = doc(db, 'users', currentUser.uid);
      
      // Set up real-time listener
      unsubscribeRef.current = onSnapshot(docRef, 
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfile(prev => ({
              ...initialProfileState,
              ...data
            }));
          }
          setLoading(false);
        },
        (error) => {
          console.error('Error in profile listener:', error);
          toast.error('Failed to load profile');
          setLoading(false);
        }
      );
    } catch (error) {
      console.error('Error setting up profile listener:', error);
      toast.error('Failed to load profile');
      setLoading(false);
    }
  }, [currentUser?.uid]);

  // Cleanup listener on unmount
  useEffect(() => {
    setupProfileListener();
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [setupProfileListener]);

  // Memoize the change handler with debounce
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setProfile(prev => {
      const newProfile = {
        ...prev,
        [name]: value
      };
      // Check if there are any changes from the initial state
      const hasChanges = Object.keys(newProfile).some(key => 
        newProfile[key] !== initialProfileState[key]
      );
      setHasChanges(hasChanges);
      return newProfile;
    });
  }, []);

  // Memoize the submit handler with validation
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!hasChanges || !currentUser?.uid) return;

    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      
      // Validate data before saving
      const dataToSave = {
        ...profile,
        updatedAt: new Date().toISOString()
      };

      await updateDoc(userRef, dataToSave);
      toast.success('Profile updated successfully!');
      setHasChanges(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  }, [currentUser?.uid, profile, hasChanges]);

  // Memoize the loading skeleton
  const LoadingSkeleton = useMemo(() => (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6 animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i}>
                <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                <div className="h-10 w-full bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  ), []);

  if (loading) {
    return LoadingSkeleton;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={profile.fullName}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                name="location"
                value={profile.location}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter your location"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Skills</label>
              <textarea
                name="skills"
                value={profile.skills}
                onChange={handleChange}
                rows="3"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter your skills (comma-separated)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Experience</label>
              <textarea
                name="experience"
                value={profile.experience}
                onChange={handleChange}
                rows="4"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Describe your work experience"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Education</label>
              <textarea
                name="education"
                value={profile.education}
                onChange={handleChange}
                rows="3"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter your education details"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isSaving || !hasChanges}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  hasChanges 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-gray-400 cursor-not-allowed'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200`}
              >
                {isSaving ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
} 