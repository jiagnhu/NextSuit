import MDEditor from "@uiw/react-md-editor";
import type { TextareaHTMLAttributes } from "react";

type MarkdownRichEditorProps = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  height?: number;
};

export const MarkdownRichEditor = ({
  value,
  onChange,
  placeholder,
  height = 420
}: MarkdownRichEditorProps) => {
  return (
    <div data-color-mode="light" style={{ width: "100%" }}>
      <MDEditor
        value={value ?? ""}
        onChange={(next) => onChange?.(next ?? "")}
        preview="live"
        height={height}
        visibleDragbar={false}
        textareaProps={{
          placeholder
        }}
      />
    </div>
  );
};
