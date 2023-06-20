import React, { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { githubDark } from "@uiw/codemirror-theme-github";
import { javascript } from '@codemirror/lang-javascript';

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
  const [options, setOptions] = useState({
    lineNumbers: true,
    keyMap: "sublime",
    readOnly: readOnly,
    
  });

  const handleCodeMirrorChange = (editor: any, data: any, value: string) => {
    onChange(value);
  };

  return (
    <CodeMirror
      theme={githubDark}
      lang={lang}
      value={value}
      height="400px"
      maxHeight="400px"
      
      onBeforeChange={(editor, data, value) =>
        handleCodeMirrorChange(editor, data, value)
      }
      extensions={[javascript({ jsx: true })]}
    />
  );
};

export default CodeMirrorEditor;
