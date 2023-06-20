import { useState } from "react";
import { ReactComponent as ChevronIcon } from "../assets/chevron.svg";
import { ReactComponent as BookmarkIcon } from "../assets/bookmark.svg";
import { ReactComponent as BookmarkSolidIcon } from "../assets/bookmarkSolid.svg";
import { ReactComponent as ClearIcon } from "../assets/clear.svg";
import { ReactComponent as LinkIcon } from "../assets/external-link.svg";
import { Commit, Item } from "../types/commit";

interface CollapsibleProps {
  id: string;
  commit: Item;
  trigger: React.ReactNode;
  children: React.ReactNode;
  open?: boolean;
  onClear?: (id: string) => void;
  onBookmark?: (id: string) => void;
  isBookmarked?: boolean;
  onToggle?: (expanded: boolean) => void;
  lang?: string;
  className?: string;
}

const Collapsible = ({
  trigger,
  id,
  commit,
  children,
  isBookmarked,
  open = false,
  onBookmark,
  onClear,
  onToggle,
  className,
  lang,
}: CollapsibleProps) => {
  const [collapsed, setCollapsed] = useState<boolean>(!open);

  const handleToggle = () => {
    onToggle && onToggle(!collapsed);
    setCollapsed((prev) => !prev);
  };

  return (
    <div className={`${className ?? ""} w-full bg-gray-900 rounded-lg`}>
      <div className=" -top-3 sticky z-40 rounded-t-lg " onClick={handleToggle}>
        <div className="flex w-full items-center justify-between rounded-lg cursor-pointer p-3 px-4 bg-gray-900">
          <div className="flex flex-1 mr-4 ">
            <a
              href={commit.author?.html_url}
              className="mr-3"
              title={commit.author?.login}
            >
              <img
                src={commit.author?.avatar_url}
                className="rounded-full"
                style={{
                  height: "2.5rem",
                  minWidth: "2.5rem",
                }}
              />
            </a>

            <p
              className=" w-full break-all line-clamp-2"
              style={{
                wordBreak: "break-all",
              }}
            >
              {trigger}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {lang && (
              <div className="px-3 bg-gray-700 text-sm rounded">{lang}</div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(commit.html_url, "_blank");
              }}
            >
              <LinkIcon className="w-4 mr-2  h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBookmark && onBookmark(id);
              }}
            >
              {isBookmarked && (
                <BookmarkSolidIcon className="w-4  h-4 text-primary-600" />
              )}
              {!isBookmarked && <BookmarkIcon className="w-4  h-4" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClear && onClear(id);
              }}
            >
              <ClearIcon className="w-4  h-4" />
            </button>
            <ChevronIcon
              className={`w-4 h-4 transition-transform transform ${
                collapsed ? "-rotate-180" : ""
              }`}
            />
          </div>
        </div>
      </div>
      {!collapsed && <div className="p-2 ">{children}</div>}
    </div>
  );
};

export default Collapsible;
