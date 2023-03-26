import Head from 'next/head'
import Image from "next/image";
import styles from '../styles/Home.module.css'
import { useState } from 'react';

const HeadComponent = () => {
  return (
    <Head>
      <title>Typeart</title>
      <meta name="description" content="Stable Diffusion Bitcoin" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
};

const Banner = () => {
  return (
    <div className={styles.banner}>
      <p>🚨 Attention: Due to high traffic, our servers may have slower performance.</p>
    </div>
  );
};

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <a
        href="https://www.banana.dev/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Powered by{' '}
        <span className={styles.logo}>
          <Image src="/banana.svg" alt="Banana Logo" width={72} height={16} />
        </span>
      </a>
    </footer>
  );
};

const SDGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async(e) => {
    e.preventDefault();
    setLoading(true);

    const response = await fetch("/api/diffusion", {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: prompt }),
    });

    const data = await response.json();
    setLoading(false);
    setImage(data.modelOutputs[0].image_base64);
  };

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>
        Stable Diffusion
      </h1>

      {image ? <div className = {styles.image}><Image src = {`data:image/png;base64,${image}`} alt = "Generated image" layout = "fill" objectFit = "cover"></Image> </div> 
      : <p className={styles.description}> Enter a prompt to generate an image. </p>}

      {loading ? <p>Loading... please wait up to a minute.</p> : null}

      <div className={styles.diffusion}>
        <form onSubmit = {handleSubmit}>
          
          <textarea 
          rows = "3"
          type="text" 
          id="prompt" 
          name="prompt" 
          placeholder = "Enter a prompt" 
          required 
          value = {prompt} 
          onChange = {e => setPrompt(e.target.value)} 
          />
          
          <div className = {styles.generatebuttonroot}>
            <button type = "submit" className = {styles.generatebutton}>Generate</button>
          </div>
        </form>
      </div>
    </main>
  );
};


const Home = () => {
  return (
    <div className={styles.container}>
      <HeadComponent/>
      <Banner/>
      <SDGenerator/>
      <Footer/>
    </div>
  )
}

export default Home;
