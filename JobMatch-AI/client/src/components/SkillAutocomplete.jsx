import React, { useState, useRef, useEffect, useMemo, useId } from 'react';
import { Plus, Sparkles, Check } from 'lucide-react';
import { SKILLS } from '../utils/skillsList';

export const POPULAR_SKILLS = [
  'JavaScript',
  'Python',
  'React',
  'Node.js',
  'SQL',
  'Java',
  'Git',
  'Docker',
  'AWS',
  'MongoDB',
];

/**
 * Normalizes a string by lowercasing and stripping whitespace and periods.
 * Enables matching "nextjs" with "Next.js", "nodejs" with "Node.js", etc.
 */
function normalizeForMatch(str) {
  if (!str) return '';
  return str.toLowerCase().replace(/[\s\.]+/g, '');
}

/**
 * Normalizes a raw skill name to its canonical spelling from SKILLS if found.
 * Example: "react" -> "React", "nextjs" -> "Next.js", "docker" -> "Docker".
 */
export function normalizeSkillName(raw) {
  if (!raw || typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  if (!trimmed) return '';

  // 1. Direct case-insensitive match
  const exact = SKILLS.find((s) => s.toLowerCase() === trimmed.toLowerCase());
  if (exact) return exact;

  // 2. Ignore dots and spaces match (e.g. "nextjs" -> "Next.js")
  const clean = normalizeForMatch(trimmed);
  const cleanMatch = SKILLS.find((s) => normalizeForMatch(s) === clean);
  if (cleanMatch) return cleanMatch;

  return trimmed;
}

/**
 * Renders text with the matched query substring highlighted in bold.
 */
function renderHighlightedText(text, query) {
  if (!query || !query.trim()) {
    return <span>{text}</span>;
  }

  const trimmedQuery = query.trim();

  // Try direct case-insensitive match first
  const directIdx = text.toLowerCase().indexOf(trimmedQuery.toLowerCase());
  if (directIdx !== -1) {
    const before = text.slice(0, directIdx);
    const match = text.slice(directIdx, directIdx + trimmedQuery.length);
    const after = text.slice(directIdx + trimmedQuery.length);
    return (
      <span>
        {before}
        <strong style={{ fontWeight: 700, color: 'var(--accent-teal)' }}>{match}</strong>
        {after}
      </span>
    );
  }

  // If dots/spaces differ (e.g. query "nextjs" for "Next.js"), construct flexible regex
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
            <strong style={{ fontWeight: 700, color: 'var(--accent-teal)' }}>
              {text.slice(start, start + len)}
            </strong>
            {text.slice(start + len)}
          </span>
        );
      }
    }
  } catch (err) {
    // Fallback safely if regex fails
  }

  return <span>{text}</span>;
}

/**
 * SkillAutocomplete Component
 *
 * @param {Object} props
 * @param {Function} props.onAddSkill - Callback invoked with the canonical/added skill string
 * @param {Array<string>} [props.existingSkills=[]] - Array of currently added skills to exclude & prevent duplicates
 * @param {string} [props.placeholder] - Input placeholder
 * @param {string} [props.buttonText="Add"] - Text for the Add button
 * @param {boolean} [props.showButton=true] - Whether to render the Add button
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {string} [props.className] - CSS class for input
 * @param {Object} [props.inputStyle] - Inline styles for input
 * @param {Object} [props.containerStyle] - Inline styles for wrapper
 * @param {string} [props.id] - Optional ID prefix
 */
export default function SkillAutocomplete({
  onAddSkill,
  existingSkills = [],
  placeholder = 'Add a technology or skill (e.g. Next.js)...',
  buttonText = 'Add',
  showButton = true,
  disabled = false,
  className = '',
  inputStyle = {},
  containerStyle = {},
  id,
}) {
  const generatedId = useId();
  const inputId = id || `skill-ac-${generatedId}`;

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Set of normalized existing skills for fast case-insensitive & dot-agnostic duplicate checking
  const existingNormalizedSet = useMemo(() => {
    const set = new Set();
    if (Array.isArray(existingSkills)) {
      existingSkills.forEach((s) => {
        if (typeof s === 'string') {
          set.add(s.toLowerCase());
          set.add(normalizeForMatch(s));
        }
      });
    }
    return set;
  }, [existingSkills]);

  // Compute suggestions via useMemo
  const { suggestions, isPopularList, showCustomOption } = useMemo(() => {
    const trimmed = query.trim();

    // 1. When empty: return popular suggestions that aren't already added
    if (!trimmed) {
      const pop = POPULAR_SKILLS.filter(
        (s) =>
          !existingNormalizedSet.has(s.toLowerCase()) &&
          !existingNormalizedSet.has(normalizeForMatch(s))
      );
      return {
        suggestions: pop,
        isPopularList: true,
        showCustomOption: false,
      };
    }

    const cleanQ = normalizeForMatch(trimmed);
    const qLower = trimmed.toLowerCase();

    const matches = [];

    for (const skill of SKILLS) {
      const cleanS = normalizeForMatch(skill);
      const sLower = skill.toLowerCase();

      // Hide skills already added
      if (existingNormalizedSet.has(sLower) || existingNormalizedSet.has(cleanS)) {
        continue;
      }

      let rank = null;

      // Rank 1: Starts-with (case-insensitive or dot/space-agnostic)
      if (sLower.startsWith(qLower) || cleanS.startsWith(cleanQ)) {
        rank = 1;
      } else {
        // Rank 2: Word-starts-with (e.g. "js" matches "Node.js", "sql" matches "PL/SQL")
        const words = skill.split(/[\s\.\-\/_]+/).filter(Boolean);
        const wordMatch = words.some(
          (w) =>
            w.toLowerCase().startsWith(qLower) ||
            normalizeForMatch(w).startsWith(cleanQ)
        );

        if (wordMatch) {
          rank = 2;
        } else if (cleanS.includes(cleanQ) || sLower.includes(qLower)) {
          // Rank 3: Contains anywhere
          rank = 3;
        }
      }

      if (rank !== null) {
        matches.push({ skill, rank, cleanS });
      }
    }

    // Rank ordering:
    // 1. Rank ascending (1 -> 2 -> 3)
    // 2. Exact match first
    // 3. Shorter length first
    // 4. Alphabetical
    matches.sort((a, b) => {
      if (a.rank !== b.rank) return a.rank - b.rank;
      const aExact = a.cleanS === cleanQ ? 0 : 1;
      const bExact = b.cleanS === cleanQ ? 0 : 1;
      if (aExact !== bExact) return aExact - bExact;
      if (a.skill.length !== b.skill.length) return a.skill.length - b.skill.length;
      return a.skill.localeCompare(b.skill);
    });

    const topSuggestions = matches.slice(0, 20).map((m) => m.skill);

    // Check if the typed query should show a "Add '<typed>' as custom skill" option
    const isExactMatchInList = SKILLS.some(
      (s) =>
        s.toLowerCase() === qLower ||
        normalizeForMatch(s) === cleanQ
    );
    const isAlreadyAdded =
      existingNormalizedSet.has(qLower) ||
      existingNormalizedSet.has(cleanQ);

    const customOption =
      trimmed.length > 0 &&
      !isExactMatchInList &&
      !isAlreadyAdded;

    return {
      suggestions: topSuggestions,
      isPopularList: false,
      showCustomOption: customOption,
    };
  }, [query, existingNormalizedSet]);

  const totalItems = suggestions.length + (showCustomOption ? 1 : 0);

  // Close dropdown on outside click
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

  // Handler to select and commit a skill
  const handleSelectSkill = (rawSkill) => {
    if (!rawSkill || typeof rawSkill !== 'string') return;

    // Handle comma-separated skills if typed/pasted
    if (rawSkill.includes(',')) {
      const parts = rawSkill
        .split(',')
        .map((p) => normalizeSkillName(p))
        .filter(Boolean);

      parts.forEach((part) => {
        const partClean = normalizeForMatch(part);
        const partLower = part.toLowerCase();
        if (
          !existingNormalizedSet.has(partLower) &&
          !existingNormalizedSet.has(partClean)
        ) {
          onAddSkill?.(part);
        }
      });
    } else {
      const canonical = normalizeSkillName(rawSkill);
      const clean = normalizeForMatch(canonical);
      const lower = canonical.toLowerCase();

      if (!existingNormalizedSet.has(lower) && !existingNormalizedSet.has(clean)) {
        onAddSkill?.(canonical);
      }
    }

    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);

    // Keep focus in the input so user can quickly type the next skill
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setSelectedIndex(0);
      } else if (totalItems > 0) {
        setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setSelectedIndex(totalItems - 1);
      } else if (totalItems > 0) {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && selectedIndex >= 0) {
        if (selectedIndex < suggestions.length) {
          handleSelectSkill(suggestions[selectedIndex]);
        } else if (showCustomOption) {
          handleSelectSkill(query.trim());
        }
      } else if (query.trim()) {
        handleSelectSkill(query.trim());
      }
    } else if (e.key === 'Tab') {
      if (isOpen && selectedIndex >= 0) {
        e.preventDefault();
        if (selectedIndex < suggestions.length) {
          handleSelectSkill(suggestions[selectedIndex]);
        } else if (showCustomOption) {
          handleSelectSkill(query.trim());
        }
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setSelectedIndex(-1);
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const listboxId = `${inputId}-listbox`;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'stretch',
        gap: '0.5rem',
        width: '100%',
        ...containerStyle,
      }}
    >
      <div style={{ position: 'relative', flex: 1, display: 'flex' }}>
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          aria-expanded={isOpen && totalItems > 0}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-activedescendant={
            selectedIndex >= 0 ? `${inputId}-opt-${selectedIndex}` : undefined
          }
          autoComplete="off"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={className || 'form-control'}
          style={{
            flex: 1,
            width: '100%',
            padding: '0.6rem 0.85rem',
            fontSize: '0.88rem',
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-sm, 6px)',
            transition: 'var(--transition)',
            ...inputStyle,
          }}
        />

        {/* Suggestions Dropdown */}
        {isOpen && totalItems > 0 && (
          <div
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-label="Skill suggestions"
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
              maxHeight: '312px', // Approx 8 visible items (38px each)
              overflowY: 'auto',
              padding: '0.35rem 0',
              animation: 'fadeIn 0.15s ease-out',
            }}
          >
            {/* Header when showing popular suggestions */}
            {isPopularList && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: 'var(--text-muted, #8A8A86)',
                  borderBottom: '1px solid var(--border-default, #E0DDD5)',
                  marginBottom: '0.2rem',
                }}
              >
                <Sparkles size={12} color="var(--accent-teal, #0F6B5C)" />
                <span>Popular Skills</span>
              </div>
            )}

            {/* Matching / Popular Suggestion Options */}
            {suggestions.map((skill, index) => {
              const isSelected = selectedIndex === index;
              const optionId = `${inputId}-opt-${index}`;

              return (
                <div
                  key={skill}
                  id={optionId}
                  role="option"
                  data-index={index}
                  aria-selected={isSelected}
                  onMouseDown={(e) => {
                    // Prevent blur so click/tap isn't swallowed
                    e.preventDefault();
                    handleSelectSkill(skill);
                  }}
                  onClick={() => handleSelectSkill(skill)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.55rem 0.85rem',
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    color: isSelected ? 'var(--accent-teal, #0F6B5C)' : 'var(--text-primary, #141414)',
                    backgroundColor: isSelected ? 'var(--accent-teal-light, #E6F4F1)' : 'transparent',
                    borderLeft: isSelected ? '3px solid var(--accent-teal, #0F6B5C)' : '3px solid transparent',
                    transition: 'background-color 0.1s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {renderHighlightedText(skill, isPopularList ? '' : query)}
                  </div>
                  {isSelected && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color: 'var(--accent-teal, #0F6B5C)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                      }}
                    >
                      <Check size={12} />
                      Select
                    </span>
                  )}
                </div>
              );
            })}

            {/* Custom Skill Option */}
            {showCustomOption && (
              <div
                id={`${inputId}-opt-${suggestions.length}`}
                role="option"
                data-index={suggestions.length}
                aria-selected={selectedIndex === suggestions.length}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelectSkill(query.trim());
                }}
                onClick={() => handleSelectSkill(query.trim())}
                onMouseEnter={() => setSelectedIndex(suggestions.length)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.6rem 0.85rem',
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  borderTop: suggestions.length > 0 ? '1px solid var(--border-default, #E0DDD5)' : 'none',
                  color: selectedIndex === suggestions.length ? 'var(--accent-teal, #0F6B5C)' : 'var(--text-secondary, #4A4A47)',
                  backgroundColor:
                    selectedIndex === suggestions.length
                      ? 'var(--accent-teal-light, #E6F4F1)'
                      : 'rgba(15, 107, 92, 0.03)',
                  borderLeft:
                    selectedIndex === suggestions.length
                      ? '3px solid var(--accent-teal, #0F6B5C)'
                      : '3px solid transparent',
                  fontWeight: 500,
                }}
              >
                <Plus size={14} color="var(--accent-teal, #0F6B5C)" />
                <span>
                  Add <strong style={{ color: 'var(--accent-teal, #0F6B5C)' }}>"{query.trim()}"</strong> as custom skill
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Optional Add Button */}
      {showButton && (
        <button
          type="button"
          onClick={() => {
            if (query.trim()) {
              handleSelectSkill(query.trim());
            }
          }}
          disabled={disabled || !query.trim()}
          className="btn btn-secondary"
          style={{
            fontSize: '0.85rem',
            padding: '0.55rem 0.95rem',
            whiteSpace: 'nowrap',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            opacity: disabled || !query.trim() ? 0.6 : 1,
            cursor: disabled || !query.trim() ? 'not-allowed' : 'pointer',
          }}
        >
          <Plus size={15} />
          <span>{buttonText}</span>
        </button>
      )}
    </div>
  );
}

