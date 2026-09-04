import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'aptly_saved_jobs';
const EVENT_NAME = 'aptly_saved_jobs_changed';

/**
 * Retrieve array of saved job IDs from localStorage
 */
export const getSavedJobIds = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Error reading saved jobs from localStorage:', err);
    return [];
  }
};

/**
 * Check if a specific job ID is saved
 */
export const isJobSaved = (jobId) => {
  if (!jobId) return false;
  const list = getSavedJobIds();
  return list.includes(jobId.toString());
};

/**
 * Toggle bookmark state for a job ID
 * @returns {boolean} true if now saved, false if removed
 */
export const toggleSaveJob = (jobId) => {
  if (!jobId) return false;
  const strId = jobId.toString();
  const current = getSavedJobIds();
  let updated;
  let isNowSaved;

  if (current.includes(strId)) {
    updated = current.filter((id) => id !== strId);
    isNowSaved = false;
  } else {
    updated = [...current, strId];
    isNowSaved = true;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to persist saved jobs to localStorage:', err);
  }

  // Notify active listeners across the application
  window.dispatchEvent(
    new CustomEvent(EVENT_NAME, {
      detail: { jobId: strId, isSaved: isNowSaved, savedJobs: updated },
    })
  );

  return isNowSaved;
};

/**
 * Remove a specific saved job ID
 */
export const removeSavedJob = (jobId) => {
  if (!jobId) return;
  const strId = jobId.toString();
  const current = getSavedJobIds();
  const updated = current.filter((id) => id !== strId);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to persist saved jobs to localStorage:', err);
  }

  window.dispatchEvent(
    new CustomEvent(EVENT_NAME, {
      detail: { jobId: strId, isSaved: false, savedJobs: updated },
    })
  );
};

/**
 * Reactive React Hook for saved job bookmarks
 */
export const useSavedJobs = () => {
  const [savedJobIds, setSavedJobIds] = useState(() => getSavedJobIds());

  useEffect(() => {
    const handleUpdate = () => {
      setSavedJobIds(getSavedJobIds());
    };

    window.addEventListener(EVENT_NAME, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(EVENT_NAME, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const isSaved = useCallback(
    (jobId) => Boolean(jobId && savedJobIds.includes(jobId.toString())),
    [savedJobIds]
  );

  const toggleSave = useCallback((jobId) => {
    return toggleSaveJob(jobId);
  }, []);

  const removeSaved = useCallback((jobId) => {
    removeSavedJob(jobId);
  }, []);

  return {
    savedJobIds,
    isSaved,
    toggleSave,
    removeSaved,
  };
};
