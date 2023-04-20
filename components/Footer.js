import { FaTwitter, FaDiscord } from "react-icons/fa";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="w-full fixed bottom-0 text-center font-medium py-4 flex justify-between items-center">
      <div className="flex justify-center">
        <a href="https://twitter.com/TypeartOrg" target="_blank" rel="noopener noreferrer">
          <FaTwitter className="text-yellow-300 mx-2" size="1.5rem" />
        </a>
        <a href="https://discord.gg/6j4TV2fegV" target="_blank" rel="noopener noreferrer">
          <FaDiscord className="text-yellow-300 mx-2" size="1.5rem" />
        </a>
      </div>
      <div className="flex">
        <Link href="/terms-and-conditions">
          <a
            target="_blank"
            rel="noopener noreferrer"
            className="text-white mx-2 text-xs"
          >
            Terms & Conditions
          </a>
        </Link>
        <Link href="/privacy-policy">
          <a
            target="_blank"
            rel="noopener noreferrer"
            className="text-white mx-2 text-xs"
          >
            Privacy Policy
          </a>
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
