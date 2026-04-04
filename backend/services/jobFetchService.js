const axios = require('axios');

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'jsearch.p.rapidapi.com';

const fetchJobsFromJSearch = async (keywords, location = null, maxResults = 5) => {
  if (!RAPIDAPI_KEY) {
    console.error('RapidAPI key missing. Set RAPIDAPI_KEY in .env');
    return [];
  }

  let queryString = keywords;
  if (location) queryString += ` in ${location}`;

  const url = 'https://jsearch.p.rapidapi.com/search';
  const params = {
    query: queryString,
    page: 1,
    num_pages: 1,
    date_posted: 'all',
    remote_jobs_only: false,
    employment_types: 'fulltime',
  };

  try {
    console.log(`Fetching jobs from JSearch: ${queryString}`);
    const response = await axios.get(url, {
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST,
      },
      params,
    });

    if (response.data?.status !== 'OK') {
      console.error('JSearch API error:', response.data?.error?.message);
      return [];
    }

    const jobsData = response.data.data || [];
    return jobsData.map(job => ({
      title: job.job_title,
      company: job.employer_name || 'Unknown',
      description: job.job_description || '',
      url: job.job_apply_link || job.job_google_link,
      location: `${job.job_city || ''}, ${job.job_state || ''}, ${job.job_country || ''}`.replace(/^, |, ,/, '').trim() || 'Remote',
      source: 'jsearch',
      sourceId: job.job_id,
    })).slice(0, maxResults);
  } catch (error) {
    console.error('JSearch API error:', error.response?.status, error.response?.data?.error?.message || error.message);
    return [];
  }
};

module.exports = { fetchJobsFromJSearch };