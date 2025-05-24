import JobCard from './JobCard';

export default function JobList({ jobs, onJobClick }) {
  if (!jobs || jobs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-lg">No jobs found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          onJobClick={onJobClick}
        />
      ))}
    </div>
  );
} 