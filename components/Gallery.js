import React from "react";
import Image from "next/image";

const Gallery = () => {
  const images = [
    "https://cryptopunks.app/cryptopunks/cryptopunk6801.png",
    "https://cryptopunks.app/cryptopunks/cryptopunk6801.png",
    "https://cryptopunks.app/cryptopunks/cryptopunk6801.png",
    "https://cryptopunks.app/cryptopunks/cryptopunk6801.png",
    "https://cryptopunks.app/cryptopunks/cryptopunk6801.png",
    "https://cryptopunks.app/cryptopunks/cryptopunk6801.png",
    "https://cryptopunks.app/cryptopunks/cryptopunk6801.png",
    "https://cryptopunks.app/cryptopunks/cryptopunk6801.png",
    "https://cryptopunks.app/cryptopunks/cryptopunk6801.png",
    "https://cryptopunks.app/cryptopunks/cryptopunk6801.png",
    "https://cryptopunks.app/cryptopunks/cryptopunk6801.png",
    "https://cryptopunks.app/cryptopunks/cryptopunk6801.png",
    "https://cryptopunks.app/cryptopunks/cryptopunk6801.png",
    "https://cryptopunks.app/cryptopunks/cryptopunk6801.png",
    "https://cryptopunks.app/cryptopunks/cryptopunk6801.png",
    "https://cryptopunks.app/cryptopunks/cryptopunk6801.png",
  ];
  const size = 200;
  return (
    <div className="flex flex-col items-center mb-20">
      <p className="text-lg font-semibold mb-4 text-white">Last Inscritions</p>
      <div className="grid grid-cols-4 gap-4 w-full justify-center">
        {images.map((image, index) => (
          <div
            key={index}
            className="relative transform backdrop-blur-[3px] backdrop-hue-rotate-90 border-4 border-black rounded shadow-[0_15px_15px_rgba(0,0,0,0.99)] p-2 flex flex-col items-center"
          >
            <p className="text-white mb-2 font-bold"># {index + 1000000}</p>
            <Image
              src={image}
              alt={`Generated image ${index}`}
              width={size}
              height={size}
              objectFit="cover"
              className="shadow-lg"
            />
            {/* <p className="text-white mt-2">Description {index + 1}</p> */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;
