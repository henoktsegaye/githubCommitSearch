import React, { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { githubDark, githubLight } from "@uiw/codemirror-theme-github";
import { javascript } from "@codemirror/lang-javascript";
import { useTheme } from "../hooks/useTheme";

interface CodeMirrorProps {
  value?: string;
  lang: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

const CodeMirrorEditor = ({
  lang,
  value,
  onChange,
  readOnly = false,
}: CodeMirrorProps) => {
  const { isDark } = useTheme();

  return (
    <CodeMirror
      theme={isDark ? githubDark : githubLight}
      lang={lang}
      value={value}
      height="400px"
      maxHeight="400px"
      extensions={[javascript({ jsx: true })]}
    />
  );
};

export default CodeMirrorEditor;
