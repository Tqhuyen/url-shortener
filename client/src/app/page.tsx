"use client";

import { useState, FormEvent, ChangeEvent, useCallback, useMemo } from "react";
import Image from "next/image";
import axios, { AxiosResponse, AxiosError } from "axios";
import { GoLink } from "react-icons/go";
import "./globals.css"

export default function Home() {
  const [url, setUrl] = useState<string>("");
  const [requestLoading, setRequestLoading] = useState<boolean>(false);
  const [requestError, setRequestError] = useState<string>("");
  const [shortenUrl, setShortenUrl] = useState<string>("");
  const [copiedText, setCopiedText] = useState<string>("");

  const handleGetShortUrlRequest = useCallback((url: string) => {
    setRequestError("");
    setShortenUrl("");
    setRequestLoading(true);
    console.log(url);
    axios
      .post(`${process.env.NEXT_PUBLIC_SERVER_BASE_URL}/api/shorten`, {
        longUrl: url,
      })
      .then(({ data: response }: AxiosResponse) => {
        console.log(response);
        console.log(response?.success);
        if (response?.success) {
          console.log("url replacement is: ", response?.id);
          setShortenUrl(
            `${process.env.NEXT_PUBLIC_SERVER_BASE_URL}/${response?.id}`
          );
          console.log(response);
        }
      })
      .catch((error: AxiosError<{ error: { message?: string } }>) => {
        setRequestError(
          error?.response?.data?.error?.message ||
            "Server error! please try again later."
        );
      })
      .finally(() => {
        setRequestLoading(false);
      });
  }, []);

  const handleSubmitForm = useCallback(
    (e: FormEvent<HTMLFormElement>): void => {
      e.preventDefault();
      handleGetShortUrlRequest(url);
    },
    [url, handleGetShortUrlRequest]
  );

  const handleTypeUrl = useCallback(
    (e: ChangeEvent<HTMLInputElement>): void => {
      if (shortenUrl) {
        setShortenUrl("");
        setRequestError("");
      }
      setUrl(e?.target?.value || "");
    },
    [shortenUrl]
  );

  const isUrlValid: boolean = useMemo((): boolean => {
    let urlObj;
    try {
      urlObj = new URL(url);
    } catch (_) {
      return false;
    }
    return (
      (urlObj.protocol === "http:" || urlObj.protocol === "https:") &&
      url.match(
        /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
      ) !== null
    );
  }, [url]);

  const handleCopyShortenUrl = useCallback((): void => {
    navigator.clipboard.writeText(shortenUrl).then(() => {
      setCopiedText(shortenUrl);
    });
  }, [shortenUrl]);

  const handlePasteUrl = useCallback((): void => {
    navigator.clipboard.readText().then((text: string) => {
      setUrl(text);
    });
  }, []);

  return (
    <main className="flex min-h-screen flex-col lg:flex-row bg-[url('/bg.svg')] bg-cover bg-bottom">
      <div className="relative flex lg:flex-1 items-center justify-center flex-col">
        <a href="https://hekate.ai/" target="_blank" className="logo">
          hekate
        </a>
        <div className="my-10 lg:my-0 px-5">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-medium text-white">
            Short links, Magical results
          </h1>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-medium text-white">
            Developed by Hekate
          </h1>
          <p className="mt-4 text-sm sm:text-lg xl:text-2xl text-white">
            Your long links will be shortened by a click!
          </p>
        </div>
      </div>

      <div className="flex lg:flex-1 items-center xs:justify-start lg:justify-center">
        <div className="py-5 md:py-12 px-4 md:px-8 rounded-xl bg-white 2xl:w-7/12 xl:w-10/12 w-full lg:w-12/12 2xl:mr-40 xl:mr-30 lg:mr-14 mx-5 lg:mx-0 mb-10 lg:mb-0 mt:10 flex flex-col items-center">
          <div className="bg-customColor p-5 rounded-xl opacity-50">
          <GoLink
            fontSize={30} 
            className="text-white"
          />
          </div>
          <h3 className="text-xl font-medium mt-6 text-gray-600">
            Make a magic link:
          </h3>
          <form className="w-full" onSubmit={handleSubmitForm}>
            <div className="bg-gray-100 mt-10 flex flex-row align-center justify-center rounded-md">
              <input
                disabled={requestLoading}
                type="text"
                placeholder="Enter your link here"
                className="p-3 text-m w-full bg-transparent outline-0 focus:outline-transparent"
                value={url}
                onChange={handleTypeUrl}
              />
              <button className="p-3" type="button" onClick={handlePasteUrl}>
                <Image
                  className="opacity-60 hover:opacity-100 ransition-all duration-200"
                  src="/paste.png"
                  width="30"
                  height="30"
                  alt="paste icon"
                />
              </button>
            </div>
            {!!url && !isUrlValid && (
              <p className="text-xs w-full block text-rose-600 mt-1 opacity-70">
                Please enter a valid URL! e.g. https://google.com
              </p>
            )}
            <button
              type="submit"
              className="disabled:opacity-50 disabled:hover:bg-customColor text-white w-full p-3 rounded-md text-m mt-5 font-medium ransition-all duration-200 bg-customColor hover:bg-[#3a46b1]"
              disabled={!isUrlValid}
            >
              {requestLoading ? "Shortening..." : "Shorten it"}
            </button>
            {requestError && (
              <p className="text-sm w-full block text-rose-600 mt-4 opacity-70">
                {requestError}
              </p>
            )}
          </form>
          {shortenUrl && (
            <div className="bg-gray-100 w-full px-5 py-6 mt-5 rounded-md flex flex-col text-center">
              <h4 className="text-2xl font-semibold text-gray-300">Enjoy:</h4>
              <a
                target="_blank"
                className="mt-5 text-md font-semibold text-gray-600 break-all"
                href={shortenUrl}
              >
                {shortenUrl}
              </a>
              <button
                onClick={handleCopyShortenUrl}
                className="disabled:opacity-50 mt-5 text-gray-500 text-sm"
                disabled={copiedText === shortenUrl}
              >
                {copiedText === shortenUrl ? "Copied!" : "Click to copy"}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
