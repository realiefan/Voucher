import React, { useState, useEffect } from "react";
import axios from "axios";
import logo from "/logo.png";
import QRCode from "react-qr-code";
import html2canvas from "html2canvas";
import ApiKeyModal from "./ApiKeyModal"; 

import "./App.css";

function App() {
  // State variables
  const [formData, setFormData] = useState({
    title: "",
    min_withdrawable: "",
    max_withdrawable: "",
    uses: "",
    wait_time: "",
    is_unique: false,
    webhook_url: "",
  });

  const [apiKey, setApiKey] = useState("");
  const [walletUrl, setWalletUrl] = useState("");
  const [links, setLinks] = useState([]);
  const [response, setResponse] = useState("");
  const apiUrl = "https://pay.zapit.live/withdraw/api/v1/links";
  const [balance, setBalance] = useState(null);

  // Modal state variables
  const [isModalOpen, setIsModalOpen] = useState(false);




  // Load the API key and wallet URL from local storage when the component mounts
  useEffect(() => {
    const savedApiKey = localStorage.getItem("apiKey");
    const savedWalletUrl = localStorage.getItem("walletUrl");

    if (savedApiKey) {
      setApiKey(savedApiKey);
      fetchWalletBalance(savedApiKey);
    }

    if (savedWalletUrl) {
      setWalletUrl(savedWalletUrl);
    }

    loadWithdrawLinks();
  }, []);

  // Function to open the modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Function to save the API key and wallet URL to local storage
  const saveToLocalStorage = (newApiKey, newWalletUrl) => {
    localStorage.setItem("apiKey", newApiKey);
    localStorage.setItem("walletUrl", newWalletUrl);
    setApiKey(newApiKey);
    setWalletUrl(newWalletUrl);
    closeModal();
  };

  // Function to fetch the wallet balance using the API key
  async function fetchWalletBalance(apiKey) {
    try {
      const response = await axios.get("https://pay.zapit.live/api/v1/wallet", {
        headers: {
          "X-Api-Key": apiKey,
        },
      });

      if (response.status === 200) {
        const { balance } = response.data;
        const formattedBalance = Math.floor(balance / 1000); // Divide and round down
        setBalance(formattedBalance); // Update the balance state with the formatted value
      } else {
        console.error("Error fetching wallet balance.");
      }
    } catch (error) {
      console.error("Error fetching wallet balance:", error.message);
    }
  }

  // Function to load withdrawal links
  async function loadWithdrawLinks() {
    try {
      const response = await axios.get(apiUrl, {
        headers: {
          "X-Api-Key": apiKey,
        },
      });

      if (response.status === 200) {
        const data = response.data;
        setLinks(data.links);
      } else {
        setResponse("Error: Unable to fetch the links.");
      }
    } catch (error) {
      setResponse("Error: " + error.message);
    }
  }

  // Function to create a withdrawal link
  async function createWithdrawLink() {
    try {
      const response = await axios.post(apiUrl, formData, {
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": apiKey,
        },
      });

      if (response.status === 201) {
        const data = response.data;
        const linkUrl = `lightning:${data.lnurl}`;
        setResponse(`Created Link: ${data.lnurl} (Link URL: ${linkUrl})`);
        loadWithdrawLinks();
      } else {
        setResponse("Error: Unable to create the link.");
      }
    } catch (error) {
      setResponse("Error: " + error.message);
    }
  }

   const downloadQRCode = () => {
     const qrCodeElement = document.getElementById("qr-code");

     if (qrCodeElement) {
       html2canvas(qrCodeElement, { useCORS: true }).then((canvas) => {
         const link = document.createElement("a");
         link.href = canvas.toDataURL("image/png");
         link.download = "qr-code.png";
         link.click();
       });
     }
   };

  return (
    <div className="bg-[#242424]   min-h-screen text-white py-4">
      <div className="container   px-4">
        <img src={logo} alt="Logo" className="mb-4   w-20" />

        {/* Button to open the modal */}

        <div className="absolute top-4 text-sm  font-semibold text-[#f2a900] right-4 ">
          {balance !== null ? `${balance} Sats` : "Loading..."}
          <button
            className=" ml-3 bg-blue-700 text-white rounded-md p-1 text-sm font-semibold"
            onClick={openModal}
          >
            ReFill
          </button>{" "}
        </div>
        <form className="space-y-4 ">
          <div className="flex    flex-col">
            <label htmlFor="title" className="text-white"></label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="Voucher Name"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="bg-[#1a1a1a] text-white   border border-none text-sm font-semibold rounded py-2 px-3 focus:outline-none "
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="min_withdrawable" className="text-white"></label>
            <input
              type="number"
              id="min_withdrawable"
              name="min_withdrawable"
              placeholder="Minimum Withdrawable"
              required
              value={formData.min_withdrawable}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  min_withdrawable: parseInt(e.target.value),
                })
              }
              className="bg-[#1a1a1a]  text-white border border-none rounded text-sm font-semibold py-2 px-3 focus:outline-none"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="max_withdrawable" className="text-white"></label>
            <input
              type="number"
              id="max_withdrawable"
              name="max_withdrawable"
              placeholder="Maximum Withdrawable:"
              required
              value={formData.max_withdrawable}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  max_withdrawable: parseInt(e.target.value),
                })
              }
              className="bg-[#1a1a1a] text-white border border-none rounded text-sm font-semibold py-2 px-3 focus:outline-none"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="uses" className="text-white"></label>
            <input
              type="number"
              id="uses"
              name="uses"
              placeholder="No. of Withdraws"
              required
              value={formData.uses}
              onChange={(e) =>
                setFormData({ ...formData, uses: parseInt(e.target.value) })
              }
              className="bg-[#1a1a1a] text-white border border-none rounded text-sm font-semibold py-2 px-3 focus:outline-none"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="wait_time" className="text-white"></label>
            <input
              type="number"
              id="wait_time"
              placeholder="Wait between Withdraws (sec)"
              name="wait_time"
              required
              value={formData.wait_time}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  wait_time: parseInt(e.target.value),
                })
              }
              className="bg-[#1a1a1a] text-white border border-none text-sm font-semibold rounded py-2 px-3 focus:outline-none"
            />
          </div>

          <div className=" flex  justify-center  ">
            <button
              type="button"
              onClick={createWithdrawLink}
              className="bg-blue-700 text-white py-2  px-4 text-sm font-semibold rounded-md  hover:bg-blue-700"
            >
              <span>Create Voucher</span>
            </button>
          </div>
        </form>
        <div id="response" className="mb-4">
          {response && response.startsWith("Created Link:") ? (
            <div className="mt-4 justify-center flex flex-col items-center">
              {" "}
              {/* Added flex-col and items-center */}
              <h3 className="text-xl font-semibold mb-2">
                QR Code Voucher
              </h3>{" "}
              {/* Added heading */}
              <div className="relative" id="qr-code">
                <QRCode
                  value={response.split("(Link URL: ")[1].slice(0, -1)}
                  size={300} // Set the size of the QR code
                  bgColor="#242424" // Background color
                  fgColor="#FFFFFF" // Foreground color
                  level="H" // Error correction level
                />
              </div>
              <div className="mt-2">
                {" "}
                {/* Adjusted margin-top */}
                <button
                  onClick={downloadQRCode}
                  className="bg-blue-700 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  Download QR Code
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Render the modal */}
      <ApiKeyModal
        isOpen={isModalOpen}
        onClose={closeModal}
        apiKey={apiKey}
        walletUrl={walletUrl}
        onSave={saveToLocalStorage}
      />
    </div>
  );
}

export default App;
