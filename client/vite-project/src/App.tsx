import { useEffect } from "react";
import Collapsible from "./components/Collapsable";
import CodeMirrorEditor from "./components/Code";
import Button from "./components/Button";
import useLocalStorageState from "./hooks/useLocalStorage";
import { useFetch } from "./hooks/useFetch";
import { optionsToUrl } from "./utils/fetchParams";
import { CodeResult, CommitsSearch, Item } from "./types/commit";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { ReactComponent as FilterIcon } from "./assets/filter.svg";
import { ReactComponent as SearchIcon } from "./assets/search.svg";
import { ReactComponent as DarkIcon } from "./assets/dark.svg";
import { ReactComponent as LightIcon } from "./assets/light.svg";
import { useTheme } from "./hooks/useTheme";

function App() {
  const [query, setQuery] = useLocalStorageState<string>("query", "");
  const [lang, setLang] = useLocalStorageState<string | undefined>(
    "lang",
    undefined
  );
  const { isDark, toggleTheme } = useTheme();
  const [filter, setFilter] = useLocalStorageState<
    Record<string, string | boolean>
  >("filter", {});
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
    setFilter((prev) => ({
      ...prev,
      expanded: false,
    }));
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
    <div className="h-screen w-screen">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex h-[8vh] relative flex-row w-full items-start justify-start gap-4 py-2">
          <form
          className="w-full"
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
          >
            <input
              type="search"
              value={query}
              placeholder="Search for commits..."
              onChange={(e) => setQuery(e.target.value)}
              className=" w-full bg-gray-100 dark:bg-gray-900 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-md"
            />
          </form>
          <div className="flex gap-2 items-center">
            <Button
              icon={<SearchIcon className="w-4  h-4 text-white" />}
              variant="solid"
              color="primary"
              loading={loading ?? undefined}
              onClick={handleSearch}
            >
              Search
            </Button>
            <Button
              icon={<FilterIcon className="w-4  h-4 text-white" />}
              variant="solid"
              color="secondary"
              onClick={() =>
                setFilter((prev) => ({
                  ...prev,
                  expanded: prev?.expanded ? !prev.expanded : true,
                }))
              }
            >
              Filter
            </Button>
            <Button
              icon={
                !isDark ? (
                  <LightIcon className="w-4  h-4 text-dark" />
                ) : (
                  <DarkIcon className="w-4  h-4 text-white" />
                )
              }
              variant="ghost"
              className="border-0 "
              onClick={() => toggleTheme()}
            />
          </div>
          {filter.expanded && (
            <div className=" top-14 rounded z-50 bg-gray-100 dark:bg-gray-800 w-full absolute ">
              <div className="grid grid-cols-6 p-4 ">
                <div>
                  <p className="text-sm mb-2">Programming langauge</p>
                  <select
                    value={lang}
                    className=" text-xs w-full  bg-gray-100 dark:bg-gray-900 px-4 py-2 border border-gray-700 rounded-md mr-2"
                    onChange={(e) => setLang(e.target.value)}
                  >
                    {[
                      undefined,
                      "tsx",
                      "ts",
                      "js",
                      "go",
                      "json",
                      "xml",
                      "yml",
                    ].map((el) => (
                      <option value={el ?? "default"} key={el ?? "default"}>
                        {el ?? "select a langauge"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="h-[90vh]">
          <PanelGroup
            autoSaveId="persistence"
            className=" max-w-screen-xl  mx-auto"
            direction="horizontal"
          >
            <Panel
              collapsible
              className=" overflow-y-auto h-screen "
              defaultSize={22}
            >
              <div className="flex flex-col h-full">
                <h2 className="text-md  mb-3 w-full ">
                  Bookmarks
                  {Object.keys(bookmarked).length
                    ? ` (${Object.keys(bookmarked).length}) `
                    : ""}{" "}
                </h2>
                <div className="flex h-[85vh] flex-col w-full overflow-y-auto items-start justify-start gap-2 ">
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
              </div>
            </Panel>

            <PanelResizeHandle className="w-[1.5px] ml-2 dark:bg-black bg-gray-100  hover:bg-primary" />
            <Panel collapsible className=" h-screen" defaultSize={78}>
              <div className="h-full overflow-y-auto pt-[10px] px-3">
                {loading && <div>Loading...</div>}
                {!loading && !data?.items.length && (
                  <div className="text-center">No Commits Result </div>
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
                      {loadingCode && "Loading Code ..."}
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
      </div>
    </div>
  );
}

export default App;
