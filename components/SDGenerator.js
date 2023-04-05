import Image from "next/image";
import { useState } from "react";
import { AiOutlineLoading } from "react-icons/ai";
import YellowButton from "./YellowButton";
import { generateImage, inscribeImage } from "../utils/apiHelpers";

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

const Modal = ({ closeModal, status, generatedImage, txid, setTxid }) => (
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
        {txid === "" ? (
          <>
            <p className="text-lg font-semibold leading-none text-white mb-6">
              You are about to inscribe this image for eternity
            </p>
            <p className="text-sm leading-none text-white mb-4">
              Request ID: {status.data.id}
            </p>
            <GeneratedImage generatedImage={generatedImage} size={250} />
            <p className="text-xs leading-none text-white mb-4">
              This process may take minutes or hours to complete, be patient
            </p>
            <InscribeButton status={status} setTxid={setTxid} />
          </>
        ) : (
          <>
            <p className="text-lg font-semibold leading-none text-white mb-6">
              Your image is now inscribed for eternity!
            </p>
            <GeneratedImage generatedImage={generatedImage} size={250} />
            <p className="text-sm leading-none text-white mb-4">
              <a
                href={`https://mempool.space/tx/${txid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-yellow-300 underline"
              >
                Transaction
              </a>
            </p>
            <p className="text-sm leading-none text-white mb-4">
              The inscription may take minutes to hours to appear in your
              wallet, please be patient.
            </p>

            <p className="text-sm leading-none text-white mb-4">
              ID: {status.data.id}
            </p>
          </>
        )}
      </div>
    </div>
  </div>
);

const Form = ({
  prompt,
  generatedImage,
  handleGenerateSubmit,
  handlePromptChange,
  handleInscribeClick,
}) => (
  <form onSubmit={handleGenerateSubmit}>
    <textarea
      rows="3"
      type="text"
      id="prompt"
      name="prompt"
      placeholder="Describe your image"
      required
      value={prompt}
      onChange={handlePromptChange}
      className="w-full p-2 border bg-gray-200 border-gray-500 rounded-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
    />
    <div className="flex justify-center mt-4">
      <YellowButton>Generate</YellowButton>
      {generatedImage ? (
        <YellowButton
          data-modal-target="defaultModal"
          onClick={handleInscribeClick}
        >
          Inscribe
        </YellowButton>
      ) : null}
    </div>
  </form>
);

const InscribeButton = ({ status, setTxid }) => {
  const handleBitcoinSended = async (txid) => {
    setTxid(txid);
  };

  return (
    <YellowButton
      type="submit"
      onClick={async () => {
        try {
          const txid = await window.unisat.sendBitcoin(
            status.data.segwitAddress,
            parseInt(status.data.amount)
          );
          handleBitcoinSended(txid);
        } catch (e) {
          console.log(e.message);
        }
      }}
    >
      Inscribe
    </YellowButton>
  );
};

const SDGenerator = ({ address }) => {
  const [prompt, setPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState();
  const [loading, setLoading] = useState({ generate: false, inscribe: false });
  const [status, setStatus] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [txid, setTxid] = useState("");

  const handleGenerateSubmit = async (e) => {
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

  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };

  const handleInscribeClick = async (e) => {
    e.preventDefault();
    setLoading({ ...loading, inscribe: true });

    try {
      const data = await inscribeImage(address, generatedImage);
      setStatus(data);
      console.log("status", data);
      setIsModalOpen(true);
    } catch (error) {
      console.error(error.message);
    }

    setLoading({ ...loading, inscribe: false });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTxid("");
  };

  return (
    <main className="flex flex-col justify-center items-center py-16 space-y-6">
      {status && isModalOpen ? (
        <Modal
          closeModal={closeModal}
          status={status}
          generatedImage={generatedImage}
          txid={txid}
          setTxid={setTxid}
        />
      ) : null}
      <div className="relative transform backdrop-blur-[3px] backdrop-hue-rotate-90 border-4 border-black rounded shadow-[0_15px_15px_rgba(0,0,0,0.99)] p-6">
        {/* backdrop-blur-[3px] backdrop-hue-rotate-90 */}
        {generatedImage ? (
          <>
            <GeneratedImage generatedImage={generatedImage} />
          </>
        ) : (
          <p className="text-lg font-semibold mb-4 text-white">
            Enter a prompt to generate an image
          </p>
        )}
        <div className="w-full max-w-md">
          <Form
            handleGenerateSubmit={handleGenerateSubmit}
            handlePromptChange={handlePromptChange}
            prompt={prompt}
            generatedImage={generatedImage}
            handleInscribeClick={handleInscribeClick}
          />
        </div>

        {loading.generate || loading.inscribe ? (
          <LoadingIndicator loading={loading} />
        ) : null}
      </div>
    </main>
  );
};

export default SDGenerator;
