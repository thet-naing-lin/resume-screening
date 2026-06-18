import { useState, useEffect, useCallback } from "react";
import { getRankings } from "../api/candidatesRankingApi";

export function useRankings(jobId, filters) {
  const [candidates, setCandidates] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRankings = useCallback(
    async (page = 1) => {
      if (!jobId) return;

      setLoading(true);
      setError(null);

      try {
        const params = {
          job_description_id: jobId,
          page,
          ...filters,
        };

        // Remove empty filter values so we don't send empty strings
        Object.keys(params).forEach(
          (key) => !params[key] && params[key] !== 0 && delete params[key],
        );

        const response = await getRankings(params);
        setCandidates(response.data.data);
        setMeta(response.data.meta);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load rankings.");
      } finally {
        setLoading(false);
      }
    },
    [jobId, filters],
  );

  useEffect(() => {
    fetchRankings(1);
  }, [fetchRankings]);

  const updateCandidateLocally = (resumeId, newStatus) => {
    setCandidates((prev) =>
      prev.map((c) =>
        c.resume_id === resumeId
          ? { ...c, score: { ...c.score, status: newStatus } }
          : c,
      ),
    );
  };

  return {
    candidates,
    meta,
    loading,
    error,
    refetch: fetchRankings,
    updateCandidateLocally,
  };
}
