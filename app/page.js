'use client'
import React, {useState} from "react";
import "daisyui/dist/full.css";

const NFCApp = () => {
    const [message, setMessage] = useState("");
    const [method, setMethod] = useState("");
    const [nfcData, setNfcData] = useState(null);
    const [methodModal, setMethodModal] = useState(false);
    const [scanModal, setScanModal] = useState(false);
    const [successWrite, setSuccessWrite] = useState(false)

    const handleScan = async () => {
        if ("NDEFReader" in window) {
            try {
                setScanModal(true); // نمایش مودال هنگام اسکن
                const ndef = new window.NDEFReader();
                await ndef.scan();
                console.log("Scan started successfully.");

                ndef.onreading = (event) => {
                    const {serialNumber, message} = event;
                    console.log("NFC Tag Serial Number:", serialNumber);
                    for (const record of message.records) {
                        if (record.recordType === "text") {
                            const textDecoder = new TextDecoder(record.encoding);
                            const data = textDecoder.decode(record.data);
                            setNfcData(data);
                            console.log("NFC Tag Data:", data);
                        } else if (record.recordType === "url") {
                            const url = new TextDecoder().decode(record.data);
                            setNfcData(url);
                            console.log("URL Read from NFC Tag:", url);
                        } else if (record.recordType === "email") {
                            const email = new TextDecoder().decode(record.data);
                            setNfcData(email);
                            console.log("Email Read from NFC Tag:", email);
                        }
                    }
                };

                ndef.onreadingerror = () => {
                    console.error("Cannot read data from NFC tag.");
                };
            } catch (error) {
                console.error("Error during NFC scan:", error);
            }
        }
    };

    const handleWrite = async () => {
        if ("NDEFReader" in window) {
            try {
                const ndef = new window.NDEFReader();
                let dataToWrite = "";

                if (method === "url") {
                    dataToWrite = message;
                } else if (method === "text") {
                    dataToWrite = message;
                } else {
                    alert("Please choose a method (URL, or Text) first.");
                    return;
                }

                await ndef.write({
                    records: [{recordType: method, data: dataToWrite}],
                });
                console.log(`Message written to NFC tag: ${dataToWrite}`);
                setSuccessWrite(true)
                setMessage('')
            } catch (error) {
                console.error("Error during NFC write:", error);
            }
        } else {
            alert("NFC is not supported on this device.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-3xl font-bold mb-6 text-blue-600">NFC Reader/Writer</h1>

            <div className="w-full max-w-md p-6 bg-white shadow-md rounded-md">
                {/* دکمه شروع رایت */}
                <button
                    onClick={() => setMethodModal(true)}
                    className="w-full py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition mb-4"
                >
                    Select Method Write
                </button>

                {/* انتخاب متد رایت */}
                {methodModal && (
                    <div className="modal modal-open">
                        <div className="modal-box">
                            <h2 className="text-xl font-bold">Choose Write Method</h2>
                            <div className="mt-4">
                                <button
                                    onClick={() => {
                                        setMethod("url")
                                        setMethodModal(false)
                                    }}
                                    className="w-full py-2 bg-blue-500 text-white rounded-md mb-4"
                                >
                                    URL
                                </button>
                                <button
                                    onClick={() => {
                                        setMethod("text")
                                        setMethodModal(false)
                                    }}
                                    className="w-full py-2 bg-blue-500 text-white rounded-md mb-4"
                                >
                                    Text
                                </button>
                            </div>
                            <div className="modal-action">
                                <button
                                    onClick={() => setMethodModal(false)}
                                    className="btn btn-primary"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* نمایش ورودی مناسب بر اساس انتخاب متد */}
                {method && (
                    <div>
                        <input
                            type="text"
                            placeholder={
                                method === "email"
                                    ? "Enter Email"
                                    : method === "url"
                                        ? "Enter URL"
                                        : "Enter Text"
                            }
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
                        />
                    </div>
                )}

                {/* دکمه شروع اسکن */}
                <button
                    onClick={handleScan}
                    className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition mb-4"
                >
                    Start NFC Scan
                </button>

                {/* مودال برای رید */}
                {scanModal &&
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50 z-50">
                        <div className="modal modal-open">
                            <div className="modal-box">
                                <h2 className="text-xl font-bold">Reading NFC Tag...</h2>
                                <div className="flex justify-center items-center mt-4">
                                    <div className="spinner-border animate-spin text-3xl text-blue-600"></div>
                                </div>
                                <div className="mt-4">

                                    {nfcData ? (
                                        <p className="text-lg font-semibold">Data: {nfcData}</p>
                                    ) : (
                                        <div className={'flex flex-col'}>
                                            <p>Scanning...</p>
                                            <div className={'flex items-center justify-center'}>
                                                <span className="loading loading-dots loading-lg "></span>
                                            </div>
                                        </div>

                                    )}
                                </div>
                                <div className="modal-action">
                                    <button
                                        onClick={() => {
                                            setScanModal(false)
                                            setNfcData(null)
                                        }}
                                        className="btn btn-primary"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                }


                <button
                    onClick={handleWrite}
                    className="w-full py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
                >
                    Write to NFC
                </button>
            </div>
            {
                successWrite &&
                <div>
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50 z-50">
                        <div className="modal modal-open">
                            <div className="modal-box">
                                <div role="alert" className="alert alert-success mt-4">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="#FFFF"
                                        viewBox="0 0 24 24"
                                        className="stroke-info h-6 w-6 shrink-0 ">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    <span className={'text-white'}>Write Successful!</span>
                                </div>
                                <div className="modal-action">
                                    <button
                                        onClick={() => setSuccessWrite(false)}
                                        className="btn btn-primary"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }
            <p className={'text-xs mt-4'}>
                <span className={'px-2'}>
                Created by :
                </span>
                Alireza Mehrakbari,Mahan Fallahnezhad
            </p>
        </div>
    );
};

export default NFCApp;
