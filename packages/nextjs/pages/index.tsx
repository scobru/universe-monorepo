import Head from "next/head";
import type { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>◯ U N I V E R S E </title>
        <meta name="description" content="Lines Open Board" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <div className="flex min-w-fit flex-col mx-auto flex-grow pt-10 text-base-content">
        <div className="max-w-3xl text-center my-2">
          <h1 className="text-center mb-8">
            <span className="block text-6xl font-bold">◯ U N I V E R S E </span>
          </h1>
          <h1 className="text-4xl font-bold mb-20">Decentralized Investment platform</h1>
          <p className="text-2xl  mb-2">
            Welcome to Universe, a decentralized investment platform that enables you to invest in the most promising
            DeFi projects and earn passive income. Our index funds offer the optimal way to invest in DeFi, ensuring the
            highest possible returns.
          </p>
          <p className="text-xl  mb-2">
            Our Farm section offers a range of farming pools, where you can earn passive income by participating in the
            most popular DeFi protocols.
          </p>
        </div>
      </div>
    </>
  );
};

export default Home;
