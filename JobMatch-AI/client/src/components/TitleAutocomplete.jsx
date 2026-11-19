import React, { useState, useRef, useEffect, useMemo, useId } from 'react';
import { Briefcase, Sparkles } from 'lucide-react';
import { JOB_TITLES, POPULAR_JOB_TITLES } from '../utils/jobTitles';

/**
 * Normalizes a string by lowercasing and stripping whitespace and punctuation.
 */
function normalizeForMatch(str) {
  if (!str) return '';
  return str.toLowerCase().replace(/[\s\.\-\/_]+/g, '');
}

/**
 * Renders text with the matched query substring highlighted in bold teal.
 */
function renderHighlightedText(text, query) {
  if (!query || !query.trim()) {
    return <span>{text}</span>;
  }

  const trimmedQuery = query.trim();

  // 1. Direct case-insensitive match
  const directIdx = text.toLowerCase().indexOf(trimmedQuery.toLowerCase());
  if (directIdx !== -1) {
    const before = text.slice(0, directIdx);
    const match = text.slice(directIdx, directIdx + trimmedQuery.length);
    const after = text.slice(directIdx + trimmedQuery.length);
    return (
      <span>
        {before}
        <strong style={{ fontWeight: 700, color: 'var(--accent-teal, #0F6B5C)' }}>{match}</strong>
        {after}
      </span>
    );
  }

  // 2. Word or flexible space-agnostic match
  try {
    const chars = trimmedQuery
      .replace(/[\s\.]/g, '')
      .split('')
      .map((c) => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

    if (chars.length > 0) {
      const pattern = chars.join('[\\s\\.]*');
      const regex = new RegExp(`(${pattern})`, 'i');
      const match = text.match(regex);
      if (match && match.index !== undefined) {
        const start = match.index;
        const len = match[0].length;
        return (
          <span>
            {text.slice(0, start)}
            <strong style={{ fontWeight: 700, color: 'var(--accent-teal, #0F6B5C)' }}>
              {text.slice(start, start + len)}
            </strong>
            {text.slice(start + len)}
          </span>
        );
      }
    }
  } catch (_e) {}

  return <span>{text}</span>;
}

/**
 * TitleAutocomplete Component
 * Single-value job title autocomplete with ranked suggestions and full keyboard/mouse navigation.
 *
 * @param {Object} props
 * @param {string} props.value - Currently typed title
 * @param {Function} props.onChange - Change handler receiving event { target: { value } }
 * @param {string} [props.placeholder] - Input placeholder
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {boolean} [props.required=false] - Required attribute
 * @param {string} [props.className] - CSS class
 * @param {Object} [props.inputStyle] - Inline styles for input
 * @param {Object} [props.containerStyle] - Inline styles for wrapper
 * @param {string} [props.id] - Optional ID
 * @param {string} [props.name] - Optional name
 */
export default function TitleAutocomplete({
  value = '',
  onChange,
  placeholder = 'e.g. Senior Full-Stack Engineer',
  disabled = false,
  required = false,
  className = '',
  inputStyle = {},
  containerStyle = {},
  id,
  name,
}) {
  const generatedId = useId();
  const inputId = id || `title-ac-${generatedId}`;
  const listboxId = `${inputId}-listbox`;

  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Compute filtered & ranked suggestions using useMemo
  const { items, isPopular } = useMemo(() => {
    const trimmed = (value || '').trim();

    // 1. On empty: immediately show 10 POPULAR_JOB_TITLES
    if (!trimmed) {
      return {
        items: POPULAR_JOB_TITLES,
        isPopular: true,
      };
    }

    const qLower = trimmed.toLowerCase();
    const cleanQ = normalizeForMatch(trimmed);

    const matches = [];

    for (const title of JOB_TITLES) {
      const tLower = title.toLowerCase();
      const cleanT = normalizeForMatch(title);

      let rank = null;

      // Rank 1: Starts-with (case-insensitive or normalized)
      if (tLower.startsWith(qLower) || cleanT.startsWith(cleanQ)) {
        rank = 1;
      } else {
        // Rank 2: Word-starts-with (e.g. "dev" matches "Backend Developer")
        const words = title.split(/[\s\.\-\/_]+/).filter(Boolean);
        const wordMatch = words.some(
          (w) => w.toLowerCase().startsWith(qLower) || normalizeForMatch(w).startsWith(cleanQ)
        );

        if (wordMatch) {
          rank = 2;
        } else if (tLower.includes(qLower) || cleanT.includes(cleanQ)) {
          // Rank 3: Contains anywhere
          rank = 3;
        }
      }

      if (rank !== null) {
        matches.push({ title, rank, cleanT });
      }
    }

    // Rank ordering:
    // 1. Rank ascending (1 -> 2 -> 3)
    // 2. Exact match first
    // 3. Shorter length first
    // 4. Alphabetical
    matches.sort((a, b) => {
      if (a.rank !== b.rank) return a.rank - b.rank;
      const aExact = a.cleanT === cleanQ ? 0 : 1;
      const bExact = b.cleanT === cleanQ ? 0 : 1;
      if (aExact !== bExact) return aExact - bExact;
      if (a.title.length !== b.title.length) return a.title.length - b.title.length;
      return a.title.localeCompare(b.title);
    });

    // Show max 8 visible (approx 312px height), scrollable up to 20
    const top20 = matches.slice(0, 20).map((m) => m.title);

    return {
      items: top20,
      isPopular: false,
    };
  }, [value]);

  // Outside click listener
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, []);

  // Scroll active option into view when navigating with arrow keys
  useEffect(() => {
    if (isOpen && selectedIndex >= 0 && listRef.current) {
      const activeOption = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (activeOption) {
        activeOption.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex, isOpen]);

  // Handler to select a title
  const handleSelect = (selectedTitle) => {
    if (typeof onChange === 'function') {
      const syntheticEvent = {
        target: { value: selectedTitle, name: name || id },
        currentTarget: { value: selectedTitle, name: name || id },
      };
      syntheticEvent[Symbol.toPrimitive] = () => selectedTitle;
      syntheticEvent.toString = () => selectedTitle;
      onChange(syntheticEvent);
    }

    setIsOpen(false);
    setSelectedIndex(-1);

    // Keep focus in input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleInputChange = (e) => {
    if (typeof onChange === 'function') {
      onChange(e);
    }
    setSelectedIndex(-1);
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setSelectedIndex(0);
      } else if (items.length > 0) {
        setSelectedIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setSelectedIndex(items.length - 1);
      } else if (items.length > 0) {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
      }
    } else if (e.key === 'Enter') {
      if (isOpen && selectedIndex >= 0 && selectedIndex < items.length) {
        e.preventDefault();
        handleSelect(items[selectedIndex]);
      } else if (isOpen) {
        // Close dropdown and retain custom text
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    } else if (e.key === 'Tab') {
      if (isOpen && selectedIndex >= 0 && selectedIndex < items.length) {
        e.preventDefault();
        handleSelect(items[selectedIndex]);
      } else {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        ...containerStyle,
      }}
    >
      <input
        ref={inputRef}
        id={inputId}
        name={name}
        type="text"
        role="combobox"
        aria-expanded={isOpen && items.length > 0}
        aria-haspopup="listbox"
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-activedescendant={
          selectedIndex >= 0 ? `${inputId}-opt-${selectedIndex}` : undefined
        }
        autoComplete="off"
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={className || 'form-input'}
        style={{
          width: '100%',
          backgroundColor: 'var(--bg-card, #FFFFFF)',
          color: 'var(--text-primary, #1A1A18)',
          border: '1px solid var(--border-default, #E0DDD5)',
          borderRadius: 'var(--radius-sm, 6px)',
          transition: 'var(--transition)',
          ...inputStyle,
        }}
      />

      {/* Autocomplete Dropdown */}
      {isOpen && items.length > 0 && (
        <div
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label="Job title suggestions"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 9999,
            backgroundColor: 'var(--bg-card, #FFFFFF)',
            border: '1px solid var(--border-default, #E0DDD5)',
            borderRadius: 'var(--radius-sm, 6px)',
            boxShadow: '0 10px 25px -4px rgba(20, 20, 20, 0.14), 0 4px 10px rgba(0, 0, 0, 0.05)',
            maxHeight: '312px', // Approx 8 visible items (38px each), scrollable up to 20
            overflowY: 'auto',
            padding: '0.35rem 0',
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          {/* Popular Roles Header when input is empty */}
          {isPopular && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.45rem 0.85rem 0.35rem',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'var(--accent-teal, #0F6B5C)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                borderBottom: '1px solid var(--border-default, #E0DDD5)',
                marginBottom: '0.2rem',
              }}
            >
              <Sparkles size={12} />
              <span>Popular roles</span>
            </div>
          )}

          {/* Suggested Titles */}
          {items.map((titleItem, index) => {
            const isSelected = selectedIndex === index;
            return (
              <div
                key={titleItem}
                id={`${inputId}-opt-${index}`}
                role="option"
                data-index={index}
                aria-selected={isSelected}
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevents input blur on mobile & desktop
                  handleSelect(titleItem);
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleSelect(titleItem);
                }}
                onMouseEnter={() => setSelectedIndex(index)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.55rem 0.85rem',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  backgroundColor: isSelected
                    ? 'var(--accent-teal-light, #E6F4F1)'
                    : 'transparent',
                  color: isSelected
                    ? 'var(--accent-teal, #0F6B5C)'
                    : 'var(--text-primary, #1A1A18)',
                  borderLeft: isSelected
                    ? '3px solid var(--accent-teal, #0F6B5C)'
                    : '3px solid transparent',
                  fontWeight: isSelected ? 600 : 400,
                  transition: 'background-color 0.1s ease, color 0.1s ease',
                }}
              >
                <Briefcase
                  size={14}
                  style={{
                    color: isSelected ? 'var(--accent-teal, #0F6B5C)' : 'var(--text-muted, #73726C)',
                    flexShrink: 0,
                  }}
                />
                <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {renderHighlightedText(titleItem, value)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
