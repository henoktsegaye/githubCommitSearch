/**
 * Author: Henok Tsegaye
 * version: 1.0.0
 * license: MIT
 */

import { useCallback, useRef, useState } from "react";

type Props = {
  url: string;
  options: RequestInit;
  cacheDuration: number;
};

type State<T> = {
  loading: boolean | null;
  data: T | null;
  error: Error | null;
};
type ResponseType<T> = {
  fetch: (url?: string, options?: RequestInit) => Promise<void>;
  clearCache: () => void;
  hasError: boolean;
} & State<T>;

type Cache<T> = {
  identifier: string;
  epochTime: number;
  data: T;
};
export const useFetch = <T>({
  url,
  options,
  cacheDuration,
}: Props): ResponseType<T> => {
  const [opts] = useState(options);
  const cache = useRef<Array<Cache<T>> | null>(null);
  const [state, setState] = useState<State<T>>({
    loading: null,
    error: null,
    data: null,
  });

  const fetchData = useCallback(
    async (
      currentUrl?: string,
      currentOptions?: RequestInit
    ): Promise<void> => {
      const currentUniqueIdentifier = getUniqueString(
        currentUrl ?? url,
        currentOptions ?? opts
      );
      if (cache.current !== null) {
        const index = cache.current.findIndex(
          (el) => el.identifier === currentUniqueIdentifier
        );
        if (
          index !== -1 &&
          Date.now() - cache.current[index].epochTime <= cacheDuration
        ) {
          return;
        }
      }
      try {
        setState((prev) => ({
          ...prev,
          loading: true,
        }));
        const result = await fetch(currentUrl ?? url, currentOptions ?? opts);
        const data = (await result.json()) as T;
        setState((prev) => ({
          ...prev,
          loading: false,
          error: null,
          data,
        }));
        cache.current = [
          ...(cache.current ?? []),
          {
            identifier: currentUniqueIdentifier,
            epochTime: Date.now(),
            data,
          },
        ];
      } catch (err: unknown) {
        console.error(err);
        if (err instanceof Error) {
          setState((prev) => ({
            ...prev,
            data: null,
            loading: false,
            error: err as Error,
          }));
        }
      }
    },
    [cacheDuration, opts, url]
  );

  const clearCache = useCallback((): void => {
    cache.current = null;
  }, []);

  return {
    loading: state.loading,
    error: state.error,
    data: state.data,
    fetch: fetchData,
    hasError: state.error !== null,
    clearCache,
  };
};

const getUniqueString = (url: string, options: RequestInit): string => {
  return `${JSON.stringify(options)}${url}`;
};
