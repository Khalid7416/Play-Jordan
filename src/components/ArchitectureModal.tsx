import React, { useState } from 'react';
import { 
  PROJECT_GRAPH_ASCII, 
  SQL_DATABASE_SCHEMA, 
  STANDALONE_LANDING_PAGE_HTML, 
  STANDALONE_OTP_MODAL_HTML, 
  STANDALONE_OTP_LOGIC_JS,
  GITHUB_VERSIONING_GUIDE
} from '../data/architectureDoc';
import { 
  FolderTree, 
  Database, 
  Code, 
  FileCode, 
  Copy, 
  Check, 
  Sparkles,
  ExternalLink,
  BookOpen,
  GitBranch
} from 'lucide-react';

export const ArchitectureModal: React.FC = () => {
  const [activeDocTab, setActiveDocTab] = useState<'graph' | 'sql' | 'landing_html' | 'otp_html' | 'otp_js' | 'github'>('graph');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (content: string, key: string) => {
    navigator.clipboard.writeText(content);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const getActiveContent = () => {
    switch (activeDocTab) {
      case 'graph':
        return {
          title: 'Project Folder Structure & Modular Architecture Graph',
          content: PROJECT_GRAPH_ASCII,
          language: 'markdown',
          description: 'Production folder hierarchy including portals, RBAC routes, and components.',
        };
      case 'sql':
        return {
          title: 'Comprehensive PostgreSQL Relational Schema & RBAC Policies',
          content: SQL_DATABASE_SCHEMA,
          language: 'sql',
          description: 'Complete SQL DDL for Users, OTP verifications, Facilities, Courts, Bookings, Loyalty Ledger, and Streak Triggers.',
        };
      case 'landing_html':
        return {
          title: 'Customer Landing Page (Pure HTML5 & Tailwind CSS)',
          content: STANDALONE_LANDING_PAGE_HTML,
          language: 'html',
          description: 'Standalone HTML5 and Tailwind CSS layout for Jordan facilities directory.',
        };
      case 'otp_html':
        return {
          title: 'Phone SMS OTP Verification Modal (HTML & Tailwind CSS)',
          content: STANDALONE_OTP_MODAL_HTML,
          language: 'html',
          description: 'Accessible 6-digit verification modal with Jordanian carrier styling.',
        };
      case 'otp_js':
        return {
          title: 'SMS OTP Verification State Machine (Vanilla JavaScript)',
          content: STANDALONE_OTP_LOGIC_JS,
          language: 'javascript',
          description: 'Complete client-side OTP logic with 60s cooldown timer, auto-focus, paste, and validation.',
        };
      case 'github':
        return {
          title: 'GitHub Setup & Multi-Version Branching Strategy',
          content: GITHUB_VERSIONING_GUIDE,
          language: 'bash',
          description: 'Step-by-step instructions to push to your GitHub repo and manage version tags and feature branches.',
        };
    }
  };

  const doc = getActiveContent();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 mb-8 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Developer Deliverables & System Architecture</span>
          </div>
          <h1 className="text-3xl font-black font-heading">
            PlayJo System Blueprint & Code Exports
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Review the complete technical architecture graph, production PostgreSQL schema with RBAC and triggers, and standalone HTML/Tailwind/JS code templates.
          </p>
        </div>

        <button
          onClick={() => handleCopy(doc.content, activeDocTab)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-emerald-600/30 shrink-0 cursor-pointer"
        >
          {copiedKey === activeDocTab ? (
            <>
              <Check className="w-4 h-4 text-emerald-200" />
              <span>Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy Current Code</span>
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveDocTab('graph')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeDocTab === 'graph'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FolderTree className="w-4 h-4 text-emerald-400" />
          <span>1. Folder Structure Graph</span>
        </button>

        <button
          onClick={() => setActiveDocTab('sql')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeDocTab === 'sql'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4 text-emerald-400" />
          <span>2. Relational SQL Schema</span>
        </button>

        <button
          onClick={() => setActiveDocTab('landing_html')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeDocTab === 'landing_html'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Code className="w-4 h-4 text-emerald-400" />
          <span>3. Landing Page (HTML/Tailwind)</span>
        </button>

        <button
          onClick={() => setActiveDocTab('otp_html')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeDocTab === 'otp_html'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileCode className="w-4 h-4 text-emerald-400" />
          <span>4. OTP Modal (HTML)</span>
        </button>

        <button
          onClick={() => setActiveDocTab('otp_js')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeDocTab === 'otp_js'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>5. OTP Logic (JavaScript)</span>
        </button>

        <button
          onClick={() => setActiveDocTab('github')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeDocTab === 'github'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <GitBranch className="w-4 h-4 text-emerald-400" />
          <span>6. GitHub & Version Management</span>
        </button>
      </div>

      {/* Code Display Container */}
      <div className="bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
        {/* Top bar */}
        <div className="bg-slate-900/90 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-white">{doc.title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{doc.description}</p>
          </div>
          <span className="text-[10px] uppercase font-mono font-bold bg-slate-800 text-emerald-400 px-2 py-1 rounded">
            {doc.language}
          </span>
        </div>

        {/* Code Content */}
        <div className="p-6 overflow-x-auto max-h-[650px] scrollbar-thin">
          <pre className="text-xs font-mono text-emerald-300 leading-relaxed whitespace-pre selection:bg-emerald-900 selection:text-white">
            {doc.content}
          </pre>
        </div>
      </div>
    </div>
  );
};
