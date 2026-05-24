"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface TiptapMark {
  type: string;
  attrs?: Record<string, any>;
}

interface TiptapNode {
  type: string;
  text?: string;
  marks?: TiptapMark[];
  attrs?: Record<string, any>;
  content?: TiptapNode[];
}

interface TiptapRendererProps {
  contentJson: string | Record<string, any>;
  className?: string;
}

export function TiptapRenderer({ contentJson, className }: TiptapRendererProps) {
  let doc: TiptapNode | null = null;

  try {
    if (typeof contentJson === "string") {
      doc = JSON.parse(contentJson);
    } else {
      doc = contentJson as TiptapNode;
    }
  } catch (error) {
    console.error("Failed to parse Tiptap JSON content", error);
  }

  if (!doc || doc.type !== "doc" || !doc.content) {
    // Fallback: If it's pure HTML or failed parsing, try rendering as raw text
    return (
      <div className={cn("prose prose-invert max-w-none text-text-secondary leading-7 space-y-4", className)}>
        {typeof contentJson === "string" && contentJson.startsWith("<") ? (
          <div dangerouslySetInnerHTML={{ __html: contentJson }} />
        ) : (
          <p className="whitespace-pre-wrap">{String(contentJson)}</p>
        )}
      </div>
    );
  }

  return (
    <article className={cn("max-w-none text-text-secondary leading-7 space-y-6 text-base", className)}>
      {doc.content.map((node, index) => (
        <React.Fragment key={index}>{renderNode(node)}</React.Fragment>
      ))}
    </article>
  );
}

function renderNode(node: TiptapNode): React.ReactNode {
  switch (node.type) {
    case "paragraph":
      return (
        <p className="leading-7 text-text-secondary min-h-[1.5rem]">
          {node.content ? node.content.map((child, i) => renderInline(child, i)) : "\u00A0"}
        </p>
      );

    case "heading": {
      const level = node.attrs?.level || 1;
      const headingText = getRawText(node);
      const headingId = headingText
        ? headingText
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D")
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "")
        : undefined;

      const baseClass = "text-text-primary font-bold tracking-tight mt-8 mb-4";
      if (level === 1) {
        return (
          <h2 id={headingId} className={cn("text-3xl font-bold scroll-mt-20 border-b border-neutral-border/50 pb-2", baseClass)}>
            {node.content?.map((child, i) => renderInline(child, i))}
          </h2>
        );
      } else if (level === 2) {
        return (
          <h3 id={headingId} className={cn("text-2xl font-semibold scroll-mt-20", baseClass)}>
            {node.content?.map((child, i) => renderInline(child, i))}
          </h3>
        );
      } else {
        return (
          <h4 id={headingId} className={cn("text-xl font-semibold scroll-mt-20", baseClass)}>
            {node.content?.map((child, i) => renderInline(child, i))}
          </h4>
        );
      }
    }

    case "bulletList":
      return (
        <ul className="list-disc pl-6 space-y-2 text-text-secondary my-4">
          {node.content?.map((item, i) => (
            <React.Fragment key={i}>{renderNode(item)}</React.Fragment>
          ))}
        </ul>
      );

    case "orderedList":
      return (
        <ol className="list-decimal pl-6 space-y-2 text-text-secondary my-4">
          {node.content?.map((item, i) => (
            <React.Fragment key={i}>{renderNode(item)}</React.Fragment>
          ))}
        </ol>
      );

    case "listItem":
      return (
        <li className="leading-7">
          {node.content?.map((child, i) => (
            <React.Fragment key={i}>{renderNode(child)}</React.Fragment>
          ))}
        </li>
      );

    case "blockquote":
      return (
        <blockquote className="border-l-4 border-primary pl-4 py-2 my-6 bg-neutral-card/40 rounded-r-lg italic text-text-primary/90">
          {node.content?.map((child, i) => (
            <React.Fragment key={i}>{renderNode(child)}</React.Fragment>
          ))}
        </blockquote>
      );

    case "codeBlock": {
      const codeText = getRawText(node) || "";
      const language = node.attrs?.language || "bash";
      return (
        <pre className="bg-neutral-card border border-neutral-border rounded-xl p-4 overflow-x-auto my-6 font-mono text-sm leading-relaxed text-emerald-400">
          <code className={`language-${language}`}>{codeText}</code>
        </pre>
      );
    }

    case "image": {
      const src = node.attrs?.src || "";
      const alt = node.attrs?.alt || "Theory content image";
      const title = node.attrs?.title || "";
      return (
        <div className="flex flex-col items-center justify-center my-6 group">
          <div className="relative overflow-hidden rounded-2xl border border-neutral-border max-w-full max-h-[450px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className="object-cover max-h-[450px] w-auto transition-transform duration-300 group-hover:scale-[1.01]"
              loading="lazy"
            />
          </div>
          {(title || alt) && (
            <span className="text-sm text-text-secondary mt-2 italic">
              {title || alt}
            </span>
          )}
        </div>
      );
    }

    case "table":
      return (
        <div className="overflow-x-auto my-6 border border-neutral-border rounded-xl">
          <table className="w-full text-left border-collapse text-sm">
            <tbody>
              {node.content?.map((row, i) => (
                <React.Fragment key={i}>{renderNode(row)}</React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "tableRow":
      return (
        <tr className="border-b border-neutral-border/50 last:border-0 hover:bg-neutral-card/30 transition-colors">
          {node.content?.map((cell, i) => (
            <React.Fragment key={i}>{renderNode(cell)}</React.Fragment>
          ))}
        </tr>
      );

    case "tableHeader":
      return (
        <th className="px-4 py-3 bg-neutral-card font-semibold text-text-primary border-r border-neutral-border/50 last:border-r-0">
          {node.content?.map((child, i) => (
            <React.Fragment key={i}>{renderNode(child)}</React.Fragment>
          ))}
        </th>
      );

    case "tableCell":
      return (
        <td className="px-4 py-3 border-r border-neutral-border/50 last:border-r-0 text-text-secondary">
          {node.content?.map((child, i) => (
            <React.Fragment key={i}>{renderNode(child)}</React.Fragment>
          ))}
        </td>
      );

    case "horizontalRule":
      return <hr className="my-8 border-t border-neutral-border/50" />;

    default:
      // Fallback for custom nodes (like highlighted boxes or embedded examples)
      if (node.type === "highlightedNote" || node.type === "callout") {
        return (
          <div className="p-4 my-6 bg-primary/10 border border-primary/20 rounded-2xl flex gap-3 text-text-primary">
            <div className="flex-1">
              {node.content?.map((child, i) => (
                <React.Fragment key={i}>{renderNode(child)}</React.Fragment>
              ))}
            </div>
          </div>
        );
      }
      return null;
  }
}

function renderInline(child: TiptapNode, index: number): React.ReactNode {
  if (child.type !== "text" || !child.text) return null;

  let element: React.ReactNode = child.text;

  if (child.marks) {
    for (const mark of child.marks) {
      if (mark.type === "bold") {
        element = <strong className="font-bold text-text-primary" key={index}>{element}</strong>;
      } else if (mark.type === "italic") {
        element = <em className="italic" key={index}>{element}</em>;
      } else if (mark.type === "underline") {
        element = <u className="underline" key={index}>{element}</u>;
      } else if (mark.type === "strike") {
        element = <span className="line-through" key={index}>{element}</span>;
      } else if (mark.type === "code") {
        element = (
          <code className="px-1.5 py-0.5 rounded bg-neutral-card border border-neutral-border text-emerald-400 font-mono text-sm" key={index}>
            {element}
          </code>
        );
      } else if (mark.type === "highlight") {
        const color = mark.attrs?.color || "rgba(37, 99, 235, 0.25)";
        element = (
          <mark
            style={{ backgroundColor: color }}
            className="px-1 py-0.5 rounded text-text-primary font-medium"
            key={index}
          >
            {element}
          </mark>
        );
      } else if (mark.type === "link") {
        const href = mark.attrs?.href || "#";
        const target = mark.attrs?.target || "_blank";
        element = (
          <a
            href={href}
            target={target}
            rel="noopener noreferrer"
            className="text-primary hover:underline hover:text-primary-hover font-medium transition-colors"
            key={index}
          >
            {element}
          </a>
        );
      }
    }
  }

  return <React.Fragment key={index}>{element}</React.Fragment>;
}

function getRawText(node: TiptapNode): string {
  if (node.type === "text" && node.text) {
    return node.text;
  }
  if (node.content) {
    return node.content.map(getRawText).join("");
  }
  return "";
}
