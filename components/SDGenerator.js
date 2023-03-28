import Image from "next/image";
import { useState } from "react";
import { AiOutlineLoading } from "react-icons/ai";
import { generateImage, inscribeImage } from "./apiHelpers";

const GeneratedImage = ({ generatedImage, size = 450 }) => (
  <div className={`w-[${size}px] h-[${size}px] relative mb-2`}>
    <Image
      src={`data:image/png;base64,${generatedImage}`}
      alt="Generated image"
      width={size}
      height={size}
      objectFit="cover"
      className="shadow-lg"
    />
  </div>
);

const LoadingIndicator = ({ loading }) => (
  <div className="flex items-center justify-center space-x-2 mt-4">
    <AiOutlineLoading className="animate-spin text-black" size={24} />
    <p className="text-md font-medium text-black">
      {loading.generate
        ? "Generating... please wait up to a minute."
        : loading.inscribe
        ? "Inscribing..."
        : ""}
    </p>
  </div>
);

const Modal = ({ closeModal, status, generatedImage }) => (
  <div
    id="defaultModal"
    tabIndex="-1"
    aria-hidden="true"
    className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center z-50"
  >
    <div
      id="modal-bg"
      className="w-full h-full bg-gray-700 bg-opacity-75 absolute"
    ></div>
    <div className="relative w-full max-w-xl bg-gray-900 rounded-sm shadow-2xl overflow-hidden">
      <button
        onClick={closeModal}
        className="text-gray-200 p-2 absolute top-2 right-2 hover:bg-gray-700 "
      >
        X
      </button>
      <div className="flex flex-col justify-center items-center p-6 ">
        <p className="text-lg font-semibold leading-none text-white mb-6">
          You are about to inscribe this image for eternity
        </p>
        <p className="text-sm leading-none text-white mb-4">
          Request ID: {status.data.id}
        </p>
        <GeneratedImage generatedImage={generatedImage} size={250}/>
        <p className="text-xs leading-none text-white mb-4">
        This process may take minutes or hours to complete, be patient
        </p>
        <InscribeButton status={status} />
      </div>
    </div>
  </div>
);

const Form = ({ handleSubmit, prompt, setPrompt, generatedImage, handleInscribe }) => (
  <form onSubmit={handleSubmit}>
    <textarea
      rows="3"
      type="text"
      id="prompt"
      name="prompt"
      placeholder="Describe your image"
      required
      value={prompt}
      onChange={(e) => setPrompt(e.target.value)}
      className="w-full p-2 border bg-gray-200 border-gray-500 rounded-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
    />
    <div className="flex justify-center mt-4">
      <button
        type="submit"
        className="text-current font-bold bg-yellow-300 px-14 py-1.5 border-4 border-black mr-6 last:mr-0 transition-all duration-200 ease-in transform hover:shadow-[0_05px_05px_rgba(0,0,0,.5)] hover:-translate-y-1 hover:-translate-x-1 active:shadow-none active:translate-x-0 active:translate-y-0"
      >
        Generate
      </button>
      {generatedImage ? (
        <button
          data-modal-target="defaultModal"
          type="submit"
          onClick={handleInscribe}
          className="text-current font-bold bg-yellow-300 px-14 py-1.5 border-4 border-black mr-6 last:mr-0 transition-all duration-200 ease-in transform hover:shadow-[0_05px_05px_rgba(0,0,0,.5)] hover:-translate-y-1 hover:-translate-x-1 active:shadow-none active:translate-x-0 active:translate-y-0"
        >
          Inscribe
        </button>
      ) : null}
    </div>
  </form>
);

const InscribeButton = ({ status }) => {
  const [txid, setTxid] = useState("");

  return (
    <button
      type="submit"
      className="text-current mt-2 font-bold bg-yellow-300 px-14 py-1.5 mr-6 last:mr-0 transition-all duration-200 ease-in transform hover:shadow-[0_05px_05px_rgba(0,0,0,.5)] hover:-translate-y-1 hover:-translate-x-1 active:shadow-none active:translate-x-0 active:translate-y-0"
      onClick={async () => {
        try {
          const txid = await window.unisat.sendBitcoin(
            status.data.segwitAddress,
            parseInt(status.data.amount)
          );
          setTxid(txid);
        } catch (e) {
          setTxid(e.message);
        }
      }}
    >
      Inscribe
    </button>
  );
};

const SDGenerator = ({ address }) => {
  const [prompt, setPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState();
  const [loading, setLoading] = useState({ generate: false, inscribe: false });
  const [status, setStatus] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading({ ...loading, generate: true });

    try {
      const image = await generateImage(prompt);
      setGeneratedImage(image);
    } catch (error) {
      console.error(error.message);
    }
    setLoading({ ...loading, generate: false });
  };

  const handleInscribe = async (e) => {
    e.preventDefault();
    setLoading({ ...loading, inscribe: true });

    try {
      const data = await inscribeImage(address, generatedImage);
      setStatus(data);
      setIsModalOpen(true);
    } catch (error) {
      console.error(error.message);
    }

    setLoading({ ...loading, inscribe: false });
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <main className="flex flex-col justify-center items-center py-16 space-y-6">
      {status && isModalOpen ? (
            <Modal closeModal={closeModal} status={status} generatedImage={generatedImage} />
          ) : null}
      <div className="relative transform bg-white border-4 border-black rounded shadow-[0_15px_15px_rgba(0,0,0,0.99)] p-6">
      {generatedImage ? (
        <>
          <GeneratedImage generatedImage={generatedImage} />
          
        </>
      ) : (
        <p className="text-lg font-semibold mb-4">
          Enter a prompt to generate an image
        </p>
      )}
      <div className="w-full max-w-md">
        <Form handleSubmit={handleSubmit} prompt={prompt} setPrompt={setPrompt} generatedImage={generatedImage} handleInscribe={handleInscribe} />
      </div>

      {loading.generate || loading.inscribe ? (
        <LoadingIndicator loading={loading} />
      ) : null}
    </div>
    </main>
  );
};

export default SDGenerator;