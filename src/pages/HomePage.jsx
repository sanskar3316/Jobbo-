import { useState, useCallback, useMemo } from 'react';
import SearchBar from '../components/SearchBar';
import FilterSection from '../components/FilterSection';
import JobList from '../components/JobList';
import JobDetailsModal from '../components/JobDetailsModal';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useInfiniteQuery } from '@tanstack/react-query';
import { collection, query, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { toast } from 'react-hot-toast';

const JOBS_PER_PAGE = 10;

export default function HomePage() {
  const [filters, setFilters] = useState({});
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Memoize the search handler
  const handleSearch = useCallback((searchParams) => {
    setFilters(prev => ({
      ...prev,
      searchTerm: searchParams.searchTerm,
      location: searchParams.location
    }));
  }, []);

  // Memoize the filter change handler
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

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

  // Fetch jobs with infinite scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status
  } = useInfiniteQuery({
    queryKey: ['jobs', filters],
    queryFn: async ({ pageParam = null }) => {
      try {
        const jobsRef = collection(db, 'jobs');
        let q = query(
          jobsRef,
          orderBy('created', 'desc'),
          limit(JOBS_PER_PAGE)
        );

        if (pageParam) {
          q = query(q, startAfter(pageParam));
        }

        const querySnapshot = await getDocs(q);
        const jobs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        return {
          jobs,
          lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1]
        };
      } catch (error) {
        console.error('Error fetching jobs:', error);
        toast.error('Failed to load jobs');
        throw error;
      }
    },
    getNextPageParam: (lastPage) => lastPage.lastDoc,
    enabled: true
  });

  // Flatten jobs array for virtualization
  const jobs = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap(page => page.jobs);
  }, [data]);

  // Create virtualizer for job list
  const parentRef = useRef(null);
  const rowVirtualizer = useVirtualizer({
    count: jobs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200, // Estimated height of each job card
    overscan: 5
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Find Your Dream Job
          </h1>
          <p className="text-gray-600">
            Search through thousands of job listings
          </p>
        </div>

        <SearchBar onSearch={handleSearch} />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <FilterSection onFilterChange={handleFilterChange} />
          </div>
          <div className="lg:col-span-3">
            <div
              ref={parentRef}
              className="h-[800px] overflow-auto"
              onScroll={() => {
                if (hasNextPage && !isFetchingNextPage) {
                  fetchNextPage();
                }
              }}
            >
              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  width: '100%',
                  position: 'relative'
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const job = jobs[virtualRow.index];
                  return (
                    <div
                      key={job.id}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`
                      }}
                    >
                      <JobCard
                        job={job}
                        onJobClick={handleJobClick}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
            {isFetchingNextPage && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            )}
          </div>
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