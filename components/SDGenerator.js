import Image from "next/image";
import { useState } from "react";
import { AiOutlineLoading } from "react-icons/ai";
import { generateImage, inscribeImage } from "./apiHelpers";

const GeneratedImage = ({ generatedImage, size = 450 }) => (
  <div className={`w-[${size}px] h-[${size}px] relative p-6 m-4`}>
    <Image
      src={`data:image/png;base64,${generatedImage}`}
      alt="Generated image"
      layout="fill"
      objectFit="cover"
      className="rounded-lg shadow-lg"
    />
  </div>
);

const LoadingIndicator = ({ loading }) => (
  <div className="flex items-center space-x-2">
    <AiOutlineLoading className="animate-spin text-purple-500" size={24} />
    <p className="text-md font-medium text-purple-500">
      {loading.generate
        ? "Loading... please wait up to a minute."
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
    <div className="relative w-full max-w-xl bg-gray-900 rounded-lg shadow-2xl overflow-hidden">
      <button
        onClick={closeModal}
        className="text-gray-200 p-2 absolute top-2 right-2 hover:bg-gray-700 rounded-md"
      >
        X
      </button>
      <div className="flex flex-col justify-center items-center p-6 ">
        <p className="text-lg font-semibold leading-none text-white">
          Request ID: {status.data.id}
        </p>
        <GeneratedImage generatedImage={generatedImage} size={250}/>
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
      placeholder="Enter a prompt"
      required
      value={prompt}
      onChange={(e) => setPrompt(e.target.value)}
      className="w-full p-2 border bg-gray-900 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
    />
    <div className="flex justify-center mt-4">
      <button
        type="submit"
        className="px-4 py-2 text-white font-semibold bg-purple-500 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
      >
        Generate
      </button>
      {generatedImage ? (
        <button
          data-modal-target="defaultModal"
          type="submit"
          onClick={handleInscribe}
          className="px-4 py-2 ml-4 text-white font-semibold bg-orange-500 rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
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
      className="px-4 py-2 text-white font-semibold bg-orange-500 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
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
      {generatedImage ? (
        <>
          <GeneratedImage generatedImage={generatedImage} />
          {status && isModalOpen ? (
            <Modal closeModal={closeModal} status={status} generatedImage={generatedImage} />
          ) : null}
        </>
      ) : (
        <p className="text-lg font-semibold">
          Enter a prompt to generate an image.
        </p>
      )}

      {loading.generate || loading.inscribe ? (
        <LoadingIndicator loading={loading} />
      ) : null}

      <div className="w-full max-w-md">
        <Form handleSubmit={handleSubmit} prompt={prompt} setPrompt={setPrompt} generatedImage={generatedImage} handleInscribe={handleInscribe} />
      </div>
    </main>
  );
};

export default SDGenerator;