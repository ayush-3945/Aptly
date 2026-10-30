import { useEffect } from 'react';

/**
 * Custom hook to update document title and meta description dynamically.
 * Restores previous metadata upon unmount.
 *
 * @param {string} title - Page title (e.g. 'Explore Jobs' or 'ATS Pipeline')
 * @param {string} [description] - Optional meta description
 */
export default function usePageMeta(title, description) {
  useEffect(() => {
    const prevTitle = document.title;
    const baseTitle = 'Aptly.AI';
    document.title = title ? `${title} • ${baseTitle}` : baseTitle;

    let metaDesc = document.querySelector('meta[name="description"]');
    const prevDesc = metaDesc ? metaDesc.getAttribute('content') : '';

    if (description) {
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', description);
    }

    return () => {
      document.title = prevTitle;
      if (metaDesc && prevDesc) {
        metaDesc.setAttribute('content', prevDesc);
      }
    };
  }, [title, description]);
}
