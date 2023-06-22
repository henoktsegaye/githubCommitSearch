import { useEffect, useState } from "react";
import { Commit } from "../types/commit";
import { useFetch } from "./useFetch";

const useCommits = () => {
  const [commitsRecord, setCommitsRecord] = useState<Record<string, Commit[]>>(
    {}
  );
  const [codeRecord, setCodeRecord] = useState<Record<string, string>>({});

  const {
    data: commits,
    loading: loadingCommits,
    fetch: fetchCommits,
  } = useFetch();
  const { data: code, loading: loadingCode, fetch: fetchCode } = useFetch({
    url: '/'
  });

  useEffect(() => {
    fetchCommits("https://api.github.com/repos/vercel/next.js/commits");
  }, [fetch]);

  useEffect(() => {
    if (code) {
      setCodeRecord({ ...codeRecord, [code.sha]: code });
    }
  }, [code]);

  useEffect(() => {
    if (commits) {
      setCommitsRecord({ ...commitsRecord, [commits.sha]: commits });
    }
  }, [commits]);

  const fetchCommitCode = useCallback((commit: Commit) => {
    if (!codeRecord[commit.sha]) {
      fetchCode(commit.url);
    }
  }, []);

  return {
    commitsRecord,
    codeRecord,
    loadingCommits,
    loadingCode,
    fetchCode,
    fetchCommitCode,
  };
};
