import type { PlaceSuggestion } from './types';
import './PlaceSuggestionList.css';

interface PlaceSuggestionListProps {
  items: PlaceSuggestion[];
  activeIndex: number;
  onSelect: (item: PlaceSuggestion) => void;
}

export function PlaceSuggestionList({ items, activeIndex, onSelect }: PlaceSuggestionListProps) {
  if (items.length === 0) return null;

  return (
    <ul className="suggestion-list" role="listbox">
      {items.map((item, i) => (
        <li
          key={item.placeId}
          className={`suggestion-item ${i === activeIndex ? 'suggestion-item--active' : ''}`}
          role="option"
          id={`suggestion-${i}`}
          aria-selected={i === activeIndex}
          onMouseDown={() => onSelect(item)}
        >
          <span className="suggestion-item__primary">{item.primaryText}</span>
          <span className="suggestion-item__secondary">{item.secondaryText}</span>
        </li>
      ))}
    </ul>
  );
}
