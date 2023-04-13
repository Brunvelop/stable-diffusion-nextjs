import { FaTwitter, FaDiscord } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="w-full fixed bottom-0 text-center font-medium py-4 flex justify-between items-center">
      <div className="flex justify-center">
        <a href="https://twitter.com/TypeartOrg" target="_blank" rel="noopener noreferrer">
          <FaTwitter className="text-yellow-300 mx-2" size='1.5rem' />
        </a>
        <a href="https://discord.gg/6j4TV2fegV" target="_blank" rel="noopener noreferrer">
          <FaDiscord className="text-yellow-300 mx-2" size='1.5rem' />
        </a>
        
      </div>
      <div className="flex">
        <a
          href="https://www.banana.dev/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white mx-2 text-xs"
        >
          Terms & Conditions
        </a>
        <a
          href="https://www.banana.dev/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white mx-2 text-xs"
        >
          Privacy Policy
        </a>
      </div>
    </footer>
  );
};

export default Footer;
