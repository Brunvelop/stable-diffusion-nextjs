import Image from "next/image";
import React, { useEffect, useState, useRef } from "react";

const useIntersectionObserver = (callback, options = {}) => {
  const [node, setNode] = useState(null);
  const observer = useRef(null);

  const disconnect = () => {
    if (observer.current) {
      observer.current.disconnect();
      observer.current = null;
    }
  };

  const observe = () => {
    if (node && callback) {
      disconnect();
      observer.current = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          callback();
        }
      }, options);

      observer.current.observe(node);
    }
  };

  useEffect(() => {
    observe();
    return disconnect;
  }, [node, callback, JSON.stringify(options)]);

  return { ref: setNode };
};

const Gallery = () => {
  const [allImages, setAllImages] = useState([]);
  const [imagesToShow, setImagesToShow] = useState([]);
  const [imagesCount, setImagesCount] = useState(10);
  const size = 200;

  // Función para obtener imágenes desde la API
  const fetchImages = async () => {
    try {
      const res = await fetch("/api/inscriptions");
      const data = await res.json();

      if (data && data.length > 0) {
        setAllImages(data);
        setImagesToShow(data.slice(0, imagesCount));
      }
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // Función para cargar más imágenes cuando se llega al final del scroll
  const loadMore = () => {
    if (imagesCount < allImages.length) {
      setImagesCount((prevImagesCount) => prevImagesCount + 10);
      setImagesToShow(allImages.slice(0, imagesCount + 10));
    }
  };

  // Monitorear el último elemento visible
  const { ref } = useIntersectionObserver(loadMore, { threshold: 0.1 });

  return (
    <div className="flex flex-col items-center mb-20">
      <p className="text-lg font-semibold mb-4 text-white">Last Inscritions</p>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full justify-center">
        {imagesToShow.map((image, index) => (
          <div
            key={index}
            className="relative transform backdrop-blur-[3px] backdrop-hue-rotate-90 border-4 border-black rounded shadow-[0_15px_15px_rgba(0,0,0,0.99)] p-2 flex flex-col items-center"
            ref={index === imagesToShow.length - 1 ? ref : null}
          >
            <p className="text-white mb-2 font-bold"># {image.inscription_number}</p>
            <a href={`https://www.ord.io/${image.id_inscription}`} target="_blank" rel="noopener noreferrer">
              <Image
                src={`https://ordinals.com/content/${image.id_inscription}`}
                alt={`Generated image ${index}`}
                width={size}
                height={size}
                objectFit="cover"
                className="shadow-lg"
              />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;