import React, { useState, useEffect } from "react";
import axios from "axios";
import QRCode from "react-qr-code";

function ApiKeyModal({ isOpen, onClose, apiKey, walletUrl, onSave }) {
  const [newApiKey, setNewApiKey] = useState(apiKey);
  const [newWalletUrl, setNewWalletUrl] = useState(walletUrl);
  const [customAmount, setCustomAmount] = useState("");
  const [paymentResponse, setPaymentResponse] = useState(null);
  const [creatingPayment, setCreatingPayment] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showWebsite, setShowWebsite] = useState(false);

  useEffect(() => {
    setNewApiKey(apiKey);
    setNewWalletUrl(walletUrl);
  }, [isOpen, apiKey, walletUrl]);

  const handleSave = () => {
    onSave(newApiKey, newWalletUrl);
  };

  const createPaymentLink = async () => {
    try {
      setCreatingPayment(true);
      setErrorMessage("");

      const response = await axios.post(
        "https://pay.zapit.live/api/v1/payments",
        {
          out: false,
          amount: customAmount ? customAmount * 100 : 10000,
          memo: "Zapit Refill",
          expiry: 3600,
          unit: "sats",
          webhook: "https://your-webhook-url.com",
          internal: false,
        },
        {
          headers: {
            "X-Api-Key": newApiKey,
          },
        }
      );

      if (response.status === 201) {
        const { payment_hash, payment_request } = response.data;
        setPaymentResponse({ payment_hash, payment_request });
      } else {
        setErrorMessage("Error creating payment.");
      }
    } catch (error) {
      setErrorMessage("Error creating payment: " + error.message);
    } finally {
      setCreatingPayment(false);
    }
  };

  const openLightningWallet = (paymentRequest) => {
    const lightningWalletURL = `lightning:${paymentRequest}`;
    window.location.href = lightningWalletURL;
  };

    const openWebsite = () => {
      setShowWebsite(true);
    };

    // Function to close the website iframe
    const closeWebsite = () => {
      setShowWebsite(false);
    };

  return (
    isOpen && (
      <div className="fixed inset-0 flex items-center  justify-center z-50">
        <div className="fixed inset-0  bg-black opacity-70"></div>
        <div className="bg-[#242424] text-white min-w-full min-h-full  rounded-lg p-6 z-10">
          <h2 className="text-2xl font-semibold mt-5 mb-4">Account & Refill</h2>
          <div className="mb-4">
            <input
              type="password"
              placeholder="Zapit Login Key"
              value={newApiKey}
              onChange={(e) => setNewApiKey(e.target.value)}
              className="bg-[#1a1a1a] border border-none rounded py-2 text-sm font-semibold px-3 focus:outline-none focus:border-blue-600 mb-1 w-full text-white"
            />
          </div>
          <div className="mb-4">
            <input
              type="password"
              placeholder="Zapit Wallet URL"
              value={newWalletUrl}
              onChange={(e) => setNewWalletUrl(e.target.value)}
              className="bg-[#1a1a1a] border border-none rounded py-2 text-sm font-semibold px-3 focus:outline-none focus:border-blue-600  w-full text-white"
            />
          </div>

          <div className="flex space-x-3  justify-center">
            <button
              onClick={handleSave}
              className=" text-white mt-2 center text-sm px-2 bg-purple-600 py-1  rounded   hover-bg-blue-700"
            >
              <span className=" text-sm text-gary-500 font-semibold">
                {" "}
                Login
              </span>
            </button>
            <button
              onClick={openWebsite}
              className="bg-blue-600 text-white py-1 px-3 absolute top-10 right-5 text-sm font-semibold rounded hover:bg-blue-700 mt-2"
            >
              <span className=" text-sm text-gary-500 font-semibold">
                {" "}
                Signup
              </span>
            </button>

            <div className=" space-x-3  justify-end">
              <button
                onClick={onClose}
                className="bg-gray-500 text-white mt-4 text-sm  absolute top-0 right-4 rounded-full   hover-bg-blue-700 "
              >
                <svg
                  width="30px"
                  height="30px"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    opacity="0.5"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="#1C274C"
                    stroke-width="1.5"
                  />
                  <path
                    d="M14.5 9.50002L9.5 14.5M9.49998 9.5L14.5 14.5"
                    stroke="#1C274C"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="justify-center mt-5 text-center">
            <input
              type="number"
              placeholder="Refill Amount (Sats)"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="flex-grow bg-[#1a1a1a] border text-sm font-semibold border-none rounded py-2 px-3 focus:outline-none focus:border-blue-600 text-white"
            />

            <button
              onClick={createPaymentLink}
              className={`bg-blue-600 text-white ml-2 py-1.5 px-2 text-sm font-semibold rounded hover:bg-blue-700 mt-2 ${
                creatingPayment ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={creatingPayment}
            >
              {creatingPayment ? "Loading..." : "Refill"}
            </button>

            {errorMessage && (
              <div className="text-red-500 mt-2">{errorMessage}</div>
            )}

            <div className="">
              {paymentResponse && (
                <div className="mt-4 flex justify-center">
                  <a
                    href={`lightning:${paymentResponse.payment_request}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.preventDefault();
                      openLightningWallet(paymentResponse.payment_request);
                    }}
                  >
                    <QRCode
                      value={paymentResponse.payment_request}
                      size={300}
                    />
                  </a>
                </div>
              )}
            </div>
          </div>
          {showWebsite && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div className="fixed inset-0  bg-black opacity-70"></div>
              <div className="bg-gray-500   text-black min-w-full min-h-full rounded-lg  z-10">
                <button
                  onClick={closeWebsite}
                  className="absolute top-2 right-2 bg-gray-300 rounded-full text-lg font-semibold"
                >
                  <svg
                    width="30px"
                    height="30px"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      opacity="0.5"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="#1C274C"
                      stroke-width="1.5"
                    />
                    <path
                      d="M14.5 9.50002L9.5 14.5M9.49998 9.5L14.5 14.5"
                      stroke="#1C274C"
                      stroke-width="1.5"
                      stroke-linecap="round"
                    />
                  </svg>
                </button>
                <div className="h-screen">
                  <iframe
                    src="https://signup.zapit.live/"
                    title="Website"
                    className="w-full h-full  rounded-md "
                  ></iframe>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  );
}

export default ApiKeyModal;
