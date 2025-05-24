const API_BASE_URL = 'http://localhost:5001/api';

export const searchJobs = async (params) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Map frontend parameters to backend expected parameters
    if (params.query) queryParams.append('what', params.query);
    if (params.location) queryParams.append('where', params.location);
    if (params.salaryMin) queryParams.append('salaryMin', params.salaryMin);
    if (params.salaryMax) queryParams.append('salaryMax', params.salaryMax);
    if (params.fullTime) queryParams.append('fullTime', params.fullTime);
    if (params.permanent) queryParams.append('permanent', params.permanent);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.resultsPerPage) queryParams.append('resultsPerPage', params.resultsPerPage);
    if (params.page) queryParams.append('page', params.page);
    if (params.excludeQuery) queryParams.append('excludeQuery', params.excludeQuery);
    if (params.category) queryParams.append('category', params.category);
    if (params.maxDaysOld) queryParams.append('maxDaysOld', params.maxDaysOld);

    const url = `${API_BASE_URL}/jobs?${queryParams.toString()}`;
    console.log('Making request to backend:', url);

    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok) {
      // Handle validation errors and API errors
      const errorMessage = data.error || 'Failed to fetch jobs';
      const errorDetails = data.details || '';
      throw new Error(`${errorMessage}${errorDetails ? `: ${JSON.stringify(errorDetails)}` : ''}`);
    }

    console.log('API Response:', data);
    return data;
  } catch (error) {
    console.error('Error in searchJobs:', error);
    throw error; // Re-throw the error to be handled by the component
  }
}; 