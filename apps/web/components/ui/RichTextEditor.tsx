'use client';

import { useEditor, EditorContent, useEditorState, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

function MenuBar({ editor }: { editor: Editor | null }) {
  // Force re-render on every transaction so stored marks (e.g. bold toggled on empty line) update buttons
  useEditorState({
    editor: editor as Editor | null,
    selector: ({ editor: e }) => e?.state.storedMarks ?? e?.state.selection.$head.marks(),
  });

  if (!editor) return null;

  const btnClass = (active: boolean) =>
    `p-1.5 rounded transition-colors ${
      active
        ? 'bg-aurora-cyan/20 text-aurora-cyan'
        : 'text-stellar-white/80 hover:text-aurora-cyan hover:bg-stellar-white/5'
    }`;

  return (
    <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-cosmic-blue/30 bg-deep-space/50">
      {/* Headers */}
      <select
        className="bg-transparent text-stellar-white/80 text-sm border border-cosmic-blue/30 rounded px-1.5 py-1 mr-1 cursor-pointer hover:border-aurora-cyan/50 focus:outline-none"
        value={
          editor.isActive('heading', { level: 1 }) ? '1' :
          editor.isActive('heading', { level: 2 }) ? '2' :
          editor.isActive('heading', { level: 3 }) ? '3' : '0'
        }
        onChange={(e) => {
          const level = parseInt(e.target.value);
          if (level === 0) {
            editor.chain().focus().setParagraph().run();
          } else {
            editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run();
          }
        }}
      >
        <option value="0">Odstavec</option>
        <option value="1">Nadpis 1</option>
        <option value="2">Nadpis 2</option>
        <option value="3">Nadpis 3</option>
      </select>

      <div className="w-px h-5 bg-cosmic-blue/30 mx-1" />

      {/* Text formatting */}
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive('bold'))} title="Tučné">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive('italic'))} title="Kurzíva">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={btnClass(editor.isActive('underline'))} title="Podtržené">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={btnClass(editor.isActive('strike'))} title="Přeškrtnuté">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="12" x2="20" y2="12"/><path d="M17.5 7.5c0-2-1.5-3.5-5.5-3.5S6.5 5.5 6.5 7.5c0 4 11 4 11 8 0 2-1.5 3.5-5.5 3.5S6.5 17.5 6.5 15.5"/></svg>
      </button>

      <div className="w-px h-5 bg-cosmic-blue/30 mx-1" />

      {/* Lists */}
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive('bulletList'))} title="Odrážkový seznam">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor"/><circle cx="4" cy="12" r="1.5" fill="currentColor"/><circle cx="4" cy="18" r="1.5" fill="currentColor"/></svg>
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive('orderedList'))} title="Číselný seznam">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="20" y2="6"/><line x1="10" y1="12" x2="20" y2="12"/><line x1="10" y1="18" x2="20" y2="18"/><text x="2" y="8" fontSize="7" fill="currentColor" stroke="none" fontFamily="sans-serif">1</text><text x="2" y="14" fontSize="7" fill="currentColor" stroke="none" fontFamily="sans-serif">2</text><text x="2" y="20" fontSize="7" fill="currentColor" stroke="none" fontFamily="sans-serif">3</text></svg>
      </button>

      <div className="w-px h-5 bg-cosmic-blue/30 mx-1" />

      {/* Block elements */}
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btnClass(editor.isActive('blockquote'))} title="Citace">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C9.591 11.69 11 13.188 11 15c0 1.933-1.567 3.5-3.5 3.5-1.147 0-2.18-.498-2.917-1.179zM14.583 17.321C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C19.591 11.69 21 13.188 21 15c0 1.933-1.567 3.5-3.5 3.5-1.147 0-2.18-.498-2.917-1.179z"/></svg>
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={btnClass(editor.isActive('codeBlock'))} title="Blok kódu">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
      </button>

      <div className="w-px h-5 bg-cosmic-blue/30 mx-1" />

      {/* Link */}
      <button
        type="button"
        onClick={() => {
          if (editor.isActive('link')) {
            editor.chain().focus().unsetLink().run();
          } else {
            const url = window.prompt('URL odkazu:');
            if (url) {
              editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
            }
          }
        }}
        className={btnClass(editor.isActive('link'))}
        title="Odkaz"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
      </button>

      <div className="w-px h-5 bg-cosmic-blue/30 mx-1" />

      {/* Alignment */}
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={btnClass(editor.isActive({ textAlign: 'left' }))} title="Zarovnat vlevo">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg>
      </button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={btnClass(editor.isActive({ textAlign: 'center' }))} title="Zarovnat na střed">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
      </button>

      <div className="w-px h-5 bg-cosmic-blue/30 mx-1" />

      {/* Undo/Redo */}
      <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className={`p-1.5 rounded transition-colors ${editor.can().undo() ? 'text-stellar-white/80 hover:text-aurora-cyan hover:bg-stellar-white/5' : 'text-stellar-white/20 cursor-not-allowed'}`} title="Zpět">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
      </button>
      <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className={`p-1.5 rounded transition-colors ${editor.can().redo() ? 'text-stellar-white/80 hover:text-aurora-cyan hover:bg-stellar-white/5' : 'text-stellar-white/20 cursor-not-allowed'}`} title="Vpřed">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10"/></svg>
      </button>
    </div>
  );
}

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Napište obsah článku...',
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none min-h-[300px] p-4 focus:outline-none',
      },
    },
  });

  // Sync external content changes (e.g. loading article for edit)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  return (
    <div className="rich-editor-wrapper bg-cosmic-black/50 border-2 border-cosmic-blue/30 rounded-lg overflow-hidden focus-within:border-aurora-cyan transition-colors">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
      <style jsx global>{`
        .rich-editor-wrapper .tiptap {
          min-height: 300px;
          padding: 1rem;
          color: rgb(241, 245, 249);
        }

        .rich-editor-wrapper .tiptap:focus {
          outline: none;
        }

        .rich-editor-wrapper .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: rgba(241, 245, 249, 0.4);
          font-style: italic;
          pointer-events: none;
          height: 0;
        }

        .rich-editor-wrapper .tiptap h1 {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 1rem;
          color: rgb(241, 245, 249);
        }

        .rich-editor-wrapper .tiptap h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 0.75rem;
          color: rgb(241, 245, 249);
        }

        .rich-editor-wrapper .tiptap h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
          color: rgb(241, 245, 249);
        }

        .rich-editor-wrapper .tiptap p {
          margin-bottom: 0.75rem;
        }

        .rich-editor-wrapper .tiptap ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 0.75rem;
        }

        .rich-editor-wrapper .tiptap ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-bottom: 0.75rem;
        }

        .rich-editor-wrapper .tiptap li {
          margin-bottom: 0.25rem;
        }

        .rich-editor-wrapper .tiptap blockquote {
          border-left: 4px solid rgb(34, 211, 238);
          padding-left: 1rem;
          margin: 1rem 0;
          color: rgba(241, 245, 249, 0.8);
          font-style: italic;
        }

        .rich-editor-wrapper .tiptap pre {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(34, 211, 238, 0.3);
          border-radius: 0.375rem;
          padding: 1rem;
          overflow-x: auto;
          margin: 1rem 0;
          font-family: 'Courier New', Courier, monospace;
          color: rgb(34, 211, 238);
        }

        .rich-editor-wrapper .tiptap code {
          background: rgba(0, 0, 0, 0.3);
          color: rgb(34, 211, 238);
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: monospace;
          font-size: 0.9em;
        }

        .rich-editor-wrapper .tiptap pre code {
          background: transparent;
          padding: 0;
          border-radius: 0;
        }

        .rich-editor-wrapper .tiptap a {
          color: rgb(34, 211, 238);
          text-decoration: underline;
          cursor: pointer;
        }

        .rich-editor-wrapper .tiptap a:hover {
          color: rgb(103, 232, 249);
        }

        .rich-editor-wrapper .tiptap hr {
          border: none;
          border-top: 1px solid rgba(34, 211, 238, 0.3);
          margin: 2rem 0;
        }
      `}</style>
    </div>
  );
}
