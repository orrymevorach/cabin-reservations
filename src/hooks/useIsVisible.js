// https://stackoverflow.com/questions/45514676/react-check-if-element-is-visible-in-dom
import { useState, useEffect } from 'react';

export default function useIsVisible(ref) {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    if (ref.current) {
      const observer = new IntersectionObserver(([entry]) =>
        setIntersecting(entry.isIntersecting)
      );
      observer.observe(ref.current);
      // Remove the observer as soon as the component is unmounted
      return () => {
        observer.disconnect();
      };
    }
  }, [ref]);

  return isIntersecting;
}
