import { useState, useCallback, useEffect, useRef } from 'react';
import { parseError } from '../utils/errorParser';

/**
 * useAsync Hook
 * Reusable logic for any asynchronous action (POST, PUT, DELETE, etc.)
 * @param {Function} asyncFunction - The async function to execute
 */
export const useAsync = (asyncFunction) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const response = await asyncFunction(...args);
      if (isMounted.current) {
        setData(response);
      }
      return response;
    } catch (err) {
      const errorMessage = parseError(err);
      if (isMounted.current) {
        setError(errorMessage);
      }
      return undefined;
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [asyncFunction]);

  return { execute, loading, error, data };
};

/**
 * useFetch Hook
 * Standardized logic for GET requests with automatic execution and deduplication
 * @param {Function} fetchFunction - The async function to fetch data
 * @param {Array} params - Arguments to pass to the fetch function
 * @param {Array} deps - Dependency array for re-fetching
 */
export const useFetch = (fetchFunction, params = [], deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);
  const activePromiseRef = useRef(null);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Ensure params and deps are always arrays to prevent "is not iterable" errors
  const safeParams = Array.isArray(params) ? params : [];
  const safeDeps = Array.isArray(deps) ? deps : [];

  const executeFetch = useCallback(async () => {
    if (typeof fetchFunction !== 'function') return;
    
    // Prevent duplicate concurrent requests (e.g. StrictMode duplicate mount effects)
    if (activePromiseRef.current) {
      return activePromiseRef.current;
    }

    setLoading(true);
    setError(null);
    
    const promise = fetchFunction(...safeParams);
    activePromiseRef.current = promise;

    try {
      const result = await promise;
      if (isMounted.current) {
        setData(result);
      }
      return result;
    } catch (err) {
      if (isMounted.current) {
        setError(parseError(err));
      }
    } finally {
      activePromiseRef.current = null;
      if (isMounted.current) {
        setLoading(false);
      }
    }
    // We stringify safeParams to keep the dependency array stable 
    // but still react to value changes if they are simple values
  }, [fetchFunction, JSON.stringify(safeParams)]);

  useEffect(() => {
    executeFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, safeDeps);

  return { data, loading, error, refresh: executeFetch, setData };
};
