import React, { useState, useEffect } from 'react';
import { Note } from '../types';
import { generateNoteSummary } from '../services/gemini';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Partial<Note>) => Promise<void>;
  initialNote?: Note;
}

const NoteModal: React.FC<NoteModalProps> = ({ isOpen, onClose, onSave, initialNote }) => {
  const [title, setTitle] = useState('');
  const [participants, setParticipants] = useState('');
  const [tags, setTags] = useState('');
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<{ summary?: string, actionItems?: string[] } | null>(null);

  useEffect(() => {
    if (initialNote) {
      setTitle(initialNote.title);
      setParticipants(initialNote.participants.join(', '));
      setTags(initialNote.tags.join(', '));
      setContent(initialNote.content);
      setGeneratedData({
        summary: initialNote.summary,
        actionItems: initialNote.actionItems
      });
    } else {
      setTitle('');
      setParticipants('');
      setTags('');
      setContent('');
      setGeneratedData(null);
    }
  }, [initialNote, isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    const noteData: Partial<Note> = {
      id: initialNote?.id,
      title,
      content,
      participants: participants.split(',').map(p => p.trim()).filter(Boolean),
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      summary: generatedData?.summary,
      actionItems: generatedData?.actionItems
    };
    await onSave(noteData);
    onClose();
  };

  const handleGenerate = async () => {
    if (!content) return;
    setIsGenerating(true);
    try {
      const result = await generateNoteSummary(content, title);
      setGeneratedData(result);
    } catch (e) {
      console.error(e);
      alert('Failed to generate summary. Please check your API key or try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-3xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">
            {initialNote ? 'Edit Meeting Note' : 'New Meeting Note'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="e.g. Weekly Design Sync"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Participants</label>
              <input
                type="text"
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Comma separated"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Tags</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g. engineering, sprint"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Meeting Notes</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-64 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none leading-relaxed"
              placeholder="Type your meeting notes here..."
            />
          </div>

          {/* AI Section */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-primary-300 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                AI Insights
              </h3>
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !content}
                className="px-3 py-1.5 text-xs font-semibold rounded-md bg-gradient-to-r from-primary-600 to-accent-600 text-white hover:from-primary-500 hover:to-accent-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-500/20"
              >
                {isGenerating ? 'Generating...' : 'Generate Summary'}
              </button>
            </div>

            {generatedData ? (
              <div className="space-y-4 animate-fadeIn">
                <div className="bg-slate-900/50 p-3 rounded-lg border border-white/5">
                  <p className="text-sm text-slate-300 leading-relaxed">{generatedData.summary}</p>
                </div>
                {generatedData.actionItems && generatedData.actionItems.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Action Items</h4>
                    <ul className="space-y-2">
                      {generatedData.actionItems.map((item, idx) => (
                        <li key={idx} className="flex items-start text-sm text-slate-300">
                           <span className="w-1.5 h-1.5 bg-accent-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                           {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 text-sm">
                Write some notes and click generate to get an AI summary.
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex justify-end space-x-3 bg-slate-900/50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-200 transition-colors shadow-lg shadow-white/10"
          >
            Save Note
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteModal;
