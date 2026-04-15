'use client';

import { useState, useRef, useEffect } from 'react';

interface AddToCalendarButtonProps {
  event: {
    title: string;
    description: string;
    location: string;
    startDate: string;
    endDate?: string;
  };
}

export default function AddToCalendarButton({ event }: AddToCalendarButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const stripHtml = (html: string) => {
    if (typeof document === 'undefined') return html;
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const formatIcsDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toISOString().replace(/-|:|\.\d+/g, '');
  };

  const handleDownloadIcs = () => {
    const start = formatIcsDate(event.startDate);
    // If no end date, set it to 1 hour after start
    const end = event.endDate 
      ? formatIcsDate(event.endDate) 
      : formatIcsDate(new Date(new Date(event.startDate).getTime() + 3600000).toISOString());
    
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Czech Rocket Society//NONSGML Event//EN',
      'BEGIN:VEVENT',
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${stripHtml(event.description).replace(/\n/g, '\\n')}`,
      `LOCATION:${event.location}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsOpen(false);
  };

  const handleGoogleCalendar = () => {
    const start = formatIcsDate(event.startDate);
    const end = event.endDate 
      ? formatIcsDate(event.endDate) 
      : formatIcsDate(new Date(new Date(event.startDate).getTime() + 3600000).toISOString());
    
    const url = new URL('https://www.google.com/calendar/render');
    url.searchParams.append('action', 'TEMPLATE');
    url.searchParams.append('text', event.title);
    url.searchParams.append('details', stripHtml(event.description));
    url.searchParams.append('location', event.location);
    url.searchParams.append('dates', `${start}/${end}`);
    
    window.open(url.toString(), '_blank');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 bg-aurora-cyan hover:bg-aurora-cyan/90 text-deep-space font-bold rounded-2xl transition-all duration-300 shadow-lg shadow-aurora-cyan/20 flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Přidat do kalendáře
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-cosmic-black/95 backdrop-blur-xl border border-stellar-white/20 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <button 
            onClick={handleGoogleCalendar}
            className="w-full px-6 py-4 text-left text-stellar-white hover:bg-aurora-cyan/10 transition-colors flex items-center gap-3 border-b border-stellar-white/10"
          >
            <svg className="w-5 h-5 text-aurora-cyan" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,4H18V2H16V4H8V2H6V4H5C3.89,4 3,4.9 3,6V20A2,2 0 0,0 5,22H19A2,2 0 0,0 21,20V6A2,2 0 0,0 19,4M19,20H5V10H19V20M19,8H5V6H19V8Z" />
            </svg>
            <span className="font-medium">Google Kalendář</span>
          </button>
          <button 
            onClick={handleDownloadIcs}
            className="w-full px-6 py-4 text-left text-stellar-white hover:bg-aurora-cyan/10 transition-colors flex items-center gap-3"
          >
            <svg className="w-5 h-5 text-aurora-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4 4m4 4V4" />
            </svg>
            <span className="font-medium">Stáhnout .ics soubor</span>
          </button>
        </div>
      )}
    </div>
  );
}
