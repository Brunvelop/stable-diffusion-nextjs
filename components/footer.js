import Image from "next/image";

const Footer = () => {
  return (
    <footer className="w-full fixed bottom-0 text-center font-medium py-4">
      <a
        href="https://www.banana.dev/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Socials:{" "}
        <span>
          <Image
            src="/banana.svg"
            alt="Banana Logo"
            width={72}
            height={16}
          />
        </span>
      </a>
    </footer>
  );
};

export default Footer;