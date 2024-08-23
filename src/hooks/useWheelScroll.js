import { useEffect, useRef } from "react";

export function useWheelScroll() {
  const imagePreviewRef = useRef(null);

  useEffect(() => {
    const imagePreviewElement = imagePreviewRef.current;
    if (imagePreviewElement) {
      imagePreviewElement.addEventListener("wheel", handleWheelScroll);

      return () => {
        imagePreviewElement.removeEventListener("wheel", handleWheelScroll);
      };
    }
  }, []);

  const handleWheelScroll = (event) => {
    if (imagePreviewRef.current) {
      event.preventDefault();
      imagePreviewRef.current.scrollLeft += event.deltaY;
    }
  };

  return imagePreviewRef;
}
