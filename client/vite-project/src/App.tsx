import { useEffect } from "react";
import Collapsible from "./components/Collapsable";
import CodeMirrorEditor from "./components/Code";
import Button from "./components/Button";
import useLocalStorageState from "./hooks/useLocalStorage";
import { useFetch } from "./hooks/useFetch";
import { optionsToUrl } from "./utils/fetchParams";
import { CodeResult, CommitsSearch, Item } from "./types/commit";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

function App() {
  const [query, setQuery] = useLocalStorageState<string>("query", "");
  const [lang, setLang] = useLocalStorageState<string | undefined>(
    "lang",
    undefined
  );
  const [codes, setCodes] = useLocalStorageState<Record<string, CodeResult>>(
    "coderesults",
    {}
  );
  const { fetch, data, loading } = useFetch<CommitsSearch>({
    url: import.meta.env.VITE_BASE_API,
    options: {},
    cacheDuration: 1000,
  });
  const {
    fetch: fetchCode,
    data: codeData,
    loading: loadingCode,
  } = useFetch<CodeResult>({
    url: import.meta.env.VITE_BASE_API,
    options: {},
    cacheDuration: 1000,
  });
  const [bookmarked, setBookmarked] = useLocalStorageState<
    Record<string, Item>
  >("bookmarked", {});

  async function handleSearch(
    author?: string,
    committer?: string,
    repo?: string,
    path?: string,
    is?: string,
    hash?: string
  ) {
    try {
      const url = optionsToUrl(
        `${import.meta.env.VITE_BASE_API ?? ""}/search/${query}`,
        {
          ...(lang ? { language: lang } : {}),
          ...(author ? { author } : {}),
          ...(committer ? { committer } : {}),
          ...(repo ? { repo } : {}),
          ...(path ? { path } : {}),
          ...(is ? { is } : {}),
          ...(hash ? { hash } : {}),
        }
      );
      await fetch(url);
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  const handleBookmark = (id: string) => {
    if (bookmarked[id]) {
      return handleRemove(id);
    }
    const bookmarkedCommit = data?.items.find(
      (result: any) => result.commit.tree.sha === id
    );
    if (!bookmarkedCommit) {
      return;
    }
    setBookmarked((prev) => ({
      ...prev,
      [bookmarkedCommit.commit.tree.sha]: bookmarkedCommit,
    }));
  };

  const onLoadCode = async (sha: string, expanded: boolean) => {
    if (codes[sha]) {
      return;
    }
    const commit =
      data?.items.find((el) => el.commit.tree.sha === sha) ?? bookmarked[sha];
    if (!commit) {
      return;
    }
    const url = `${import.meta.env.VITE_BASE_API}/code/${
      commit.repository.full_name
    }/${commit.sha}`;
    await fetchCode(url);
  };

  useEffect(() => {
    if (!codeData) {
      return;
    }
    setCodes((prev) => ({
      ...prev,
      [codeData.commit.tree.sha]: codeData,
    }));
  }, [codeData]);

  const handleRemove = (id: string) => {
    setBookmarked((prev) => {
      const filteredEntries = Object.entries(prev)?.filter(
        ([item]) => item !== id
      );
      return Object.fromEntries(filteredEntries);
    });
  };

  return (
    <div className=" ">
    <PanelGroup autoSaveId="persistence" className=" max-w-screen-xl mx-auto" direction="horizontal">
      <Panel collapsible className=" overflow-y-auto h-screen " defaultSize={22}>
         <div className="flex flex-col w-full items-start justify-start gap-4 my-2">
          <input
            type="text"
            value={query}
            placeholder="search for commits"
            onChange={(e) => setQuery(e.target.value)}
            className=" w-full bg-gray-900 px-4 py-2 border border-gray-700 rounded-md mr-2"
          />
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className=" w-full bg-gray-900 px-4 py-2 border border-gray-700 rounded-md mr-2"
          >
            {[
              undefined,
              "typescript",
              "javascript",
              "go",
              "python",
              "html",
              "css",
            ].map((el) => (
              <option key={el} value={el}>
                {el ?? "select one"}
              </option>
            ))}
          </select>
          <Button
            variant="solid"
            color="primary"
            loading={loading ?? undefined}
            onClick={handleSearch}
          >
            Search
          </Button>
        </div>
        <div className="flex flex-col w-full overflow-y-auto items-start justify-start gap-2 my-4">
          <h2 className="text-lg font-bold mb-3 w-full ">
            Bookmarked Commits{" "}
            {Object.keys(bookmarked).length
              ? `(${Object.keys(bookmarked).length})`
              : ""}{" "}
          </h2>
          {Object.values(bookmarked)?.map((result, index: number) => {
            return (
              <Collapsible
                lang={codes[result.commit.tree.sha]?.language}
                commit={result}
                onToggle={(expanded) =>
                  onLoadCode(result.commit.tree.sha, expanded)
                }
                isBookmarked={true}
                id={result.commit.tree.sha}
                key={index}
                trigger={result.commit.message}
                onBookmark={handleBookmark}
                onClear={handleRemove}
              >
                {loadingCode && "Loading ..."}
                {codes[result.commit.tree.sha] && (
                  <CodeMirrorEditor
                    lang={codes[result.commit.tree.sha]?.language}
                    value={codes[result.commit.tree.sha].code}
                    onChange={() => {}}
                  />
                )}
              </Collapsible>
            );
          })}
        </div>
      </Panel>

      <PanelResizeHandle className="w-[2.5px] ml-2 bg-gray-900  hover:bg-primary" />
      <Panel collapsible className=" h-screen" defaultSize={78}>
        <div className="h-full overflow-y-auto pt-[10px] px-3">
        {loading && <div>Loading...</div>}
        {!loading && !data?.items.length && (
          <div className="text-center">Search for a commit</div>
        )}
        {data?.items.map((result, index: number) => {
          const commitIn = data.items.findIndex(
            (el) => el.commit.tree.sha === result.commit.tree.sha
          );
          if (commitIn !== index) {
            // make a unique render only
            return null;
          }
          return (
            <Collapsible
              className="mb-2"
              lang={codes[result.commit.tree.sha]?.language}
              commit={result}
              id={result.commit.tree.sha}
              key={index}
              onToggle={(expanded) =>
                onLoadCode(result.commit.tree.sha, expanded)
              }
              isBookmarked={!!bookmarked[result.commit.tree.sha]}
              trigger={result.commit.message}
              onBookmark={handleBookmark}
              onClear={handleRemove}
            >
              {loadingCode && "Loading ..."}
              {codes[result.commit.tree.sha] && (
                <CodeMirrorEditor
                  lang={codes[result.commit.tree.sha].language}
                  value={codes[result.commit.tree.sha].code}
                  onChange={() => {}}
                />
              )}
            </Collapsible>
          );
        })}
        </div>
      </Panel>
    </PanelGroup>
    </div>
  );
}

export default App;
