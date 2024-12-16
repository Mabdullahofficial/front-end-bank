import { useState, useEffect } from "react";
import api from "../utils"; // Axios instance with base URL
import Header from "../Headers/Header";
import rightsideimage from "../assets/bsesPhotos.png";
import axios from "axios";

const Bank = () => {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [lineItems, setLineItems] = useState([]);
  const [paymentDetails, setPaymentDetails] = useState(null);

  const [isDeletingInvoice, setIsDeletingInvoice] = useState(false);
  const [isDeletingLineItem, setIsDeletingLineItem] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  const [isEditingLineItem, setIsEditingLineItem] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [fees, setFees] = useState("");
  const [hours, setHours] = useState("");
  const [amount, setAmount] = useState("");
  const [editItem, setEditItem] = useState(null);
  
  async function fetchInvoices() {
    try {
      const response = await api.get("/invoices");
      setInvoices(response.data);
      if (response.data.length > 0) {
        setSelectedInvoice(response.data[0]); // Set the first invoice as default
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  }

  useEffect(() => {
    fetchInvoices();
  }, []);

  const openModalForEdit = (item) => {
    setEditItem(item);
    setDescription(item.serviceId.name);
    setFees(item.serviceId.fee);
    setHours(item.hoursDays);
    setAmount(item.amount);
    setIsModalOpen(true);
  };
  // Fetch Line Items and Payment Details When Selected Invoice Changes
  useEffect(() => {
    if (!selectedInvoice) return;

    // Fetch Line Items
    async function fetchLineItems() {
      try {
        const response = await api.get(`/invoicelineitems`);
        setLineItems(response.data);
      } catch (error) {
        console.error("Error fetching line items:", error);
      }
    }

    // Fetch Payment Details
    async function fetchPaymentDetails() {
      try {
        const response = await api.get(
          `/paymentdetails?clientId=${selectedInvoice.clientId._id}`
        );
        setPaymentDetails(response?.data[0]);
      } catch (error) {
        console.error("Error fetching payment details:", error);
      }
    }

    fetchLineItems();
    fetchPaymentDetails();
  }, [selectedInvoice]);

  // Handle Invoice Deletion
  async function handleDeleteInvoice(id) {
    setIsDeletingInvoice(true);
    try {
      await api.delete(`/invoices/${id}`);
      const updatedInvoices = invoices.filter((invoice) => invoice._id !== id);
      setInvoices(updatedInvoices);
      setSelectedInvoice(
        updatedInvoices.length > 0 ? updatedInvoices[0] : null
      );
      setIsDeletingInvoice(false);
    } catch (error) {
      console.error("Error deleting invoice:", error);
      setIsDeletingInvoice(false);
    }
  }

  // Handle Line Item Deletion
  async function handleDeleteLineItem(id) {
    setIsDeletingLineItem(true);
    try {
      await api.delete(`/invoicelineitems/${id}`);
      const updatedLineItems = lineItems.filter((item) => item._id !== id);
      setLineItems(updatedLineItems);
      setIsDeletingLineItem(false);
    } catch (error) {
      console.error("Error deleting line item:", error);
      setIsDeletingLineItem(false);
    }
  }


  async function updateService(id, updatedService) {
    try {
      await api.put(`/services/${id}`, updatedService);
    } catch (error) {
      console.error("Error updating service:", error);
    }
  }

  async function handleEditLineItem(updatedItem) {
    try {
      const url = `http://localhost:3003/api/invoicelineitems/${updatedItem._id}`;
      console.log("Sending PUT request to:", url, updatedItem);

      // Ensure headers are correct if needed
      const response = await axios.put(url, updatedItem, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Response from backend:", response);

      const updatedLineItems = lineItems.map((item) =>
        item._id === response.data._id ? response.data : item
      );
      setLineItems(updatedLineItems);
      setIsEditingLineItem(false);
    } catch (error) {
      if (error.response) {
        console.error("Error response:", error.response); // More detailed error
      } else if (error.request) {
        console.error("Error request:", error.request);
      } else {
        console.error("Error message:", error.message);
      }
    }
  }

  const handleSave = async () => {
    console.log(editItem);
    if (editItem) {
      // Construct the updated item with the new values
      const updatedItem = {
        invoiceNumber: editItem.invoiceNumber._id,
        serviceId: editItem.serviceId._id,
        hoursDays: hours,
        amount: amount,
        _id: editItem._id,
      };

      await updateService(editItem.serviceId._id, {
        name: description,
        fee: fees,
      });

      // Call the function to handle the update
      handleEditLineItem(updatedItem);

      // Close the modal after saving the changes
      setIsModalOpen(false);
    }
  };



  // add Users Items and end 
  async function HandleAddser(updatedItem) {
    try {
      const url = `http://localhost:3003/api/invoicelineitems/${updatedItem._id}`;
      console.log("Sending PUT request to:", url, updatedItem);

      // Ensure headers are correct if needed
      const response = await axios.put(url, updatedItem, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Response from backend:", response);

      const updatedLineItems = lineItems.map((item) =>
        item._id === response.data._id ? response.data : item
      );
      setLineItems(updatedLineItems);
      setIsEditingLineItem(false);
    } catch (error) {
      if (error.response) {
        console.error("Error response:", error.response); // More detailed error
      } else if (error.request) {
        console.error("Error request:", error.request);
      } else {
        console.error("Error message:", error.message);
      }
    }
  }

 
  const handleSavedData = async () => {
    console.log(editItem);
    if (editItem) {
      // Construct the updated item with the new values
      const updatedItem = {
        invoiceNumber: editItem.invoiceNumber._id,
        serviceId: editItem.serviceId._id,
        hoursDays: hours,
        amount: amount,
        _id: editItem._id,
      };

      await updateService(editItem.serviceId._id, {
        name: description,
        fee: fees,
      });

      // Call the function to handle the update
      HandleAddser(updatedItem);

      // Close the modal after saving the changes
      setIsModalOpen(false);
    }
  };

  // end Add User//

  return (
    <>
      <Header />
      <div className="w-full h-auto flex flex-col items-center">
        <div className="w-[95%]">
          {/* Invoice Selection */}
          <div className="flex justify-between items-center my-4">
            <h1 className="text-2xl font-bold">Invoices</h1>
            <select
              value={selectedInvoice?._id || ""}
              onChange={(e) =>
                setSelectedInvoice(
                  invoices.find((inv) => inv._id === e.target.value)
                )
              }
              className="border p-2 rounded"
            >
              {invoices.map((invoice) => (
                <option key={invoice._id} value={invoice._id}>
                  {invoice.invoice_number}
                </option>
              ))}
            </select>
          </div>

          {/* Invoice and Client Details */}
          <div className="flex flex-col sm:flex-row flex-1 justify-center items-start gap-8 p-4">
            {/* Left Side */}
            <div className="left-side flex flex-col items-start gap-6 p-4 w-full sm:w-1/2">
              <div className="heading">
                <h1 className="bg-black text-white w-10 p-1">Bank</h1>
                <h1 className="font-semibold text-4xl sm:text-6xl mt-4">
                  INVOICE
                </h1>
              </div>

              {selectedInvoice && (
                <>
                  <div className="container flex flex-col sm:flex-row gap-4">
                    <div>
                      <h2 className="text-blue-500 font-semibold">
                        INVOICE NUMBER
                      </h2>
                      <p>{selectedInvoice.invoice_number}</p>
                    </div>
                    <div>
                      <h2 className="text-blue-500 font-semibold">
                        DATE OF ISSUE
                      </h2>
                      <p>
                        {new Date(
                          selectedInvoice.date_of_issue
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <h2 className="text-blue-500 font-semibold">DUE DATE</h2>
                      <p>
                        {new Date(
                          selectedInvoice.due_date
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Client Details */}
                  {selectedInvoice.clientId && (
                    <div>
                      <h1 className="text-slate-300">BILLED TO</h1>
                      <h2 className="font-semibold">
                        {selectedInvoice.clientId.name}
                      </h2>
                      <h4 className="font-semibold">Parent/ Guardian</h4>
                      <h5 className="font-extrabold text-xl sm:text-2xl">
                        {selectedInvoice.clientId.guardian}
                      </h5>
                      <p>{selectedInvoice.clientId.address}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Right Side */}
            <div className="right-side flex flex-col gap-4 w-full sm:w-1/2">
              <div className="right-image">
                <img
                  src={rightsideimage}
                  className="w-full"
                  alt="Right Side Image"
                />
              </div>

              {/* Organization Details */}
              {selectedInvoice?.organizationId && (
                <div className="heading-right">
                  <h1 className="text-left text-slate-700 font-medium">
                    {selectedInvoice.organizationId.name}
                  </h1>
                  <h2 className="text-black font-semibold">
                    {selectedInvoice.organizationId.address}
                  </h2>
                  <h3 className="text-black font-semibold">
                    Terms: {selectedInvoice.organizationId.terms}
                  </h3>
                </div>
              )}
            </div>
          </div>

          <div className="w-full p-4">
            <h1 className="text-2xl font-bold mb-4">Services Summary</h1>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-200 bg-white shadow-lg">
                <thead>
                  <tr className="bg-gray-200 text-gray-700">
                    <th className="border border-gray-300 px-4 py-2 text-left text-blue-500">
                      Description
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-slate-400">
                      Fee
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-slate-400">
                      HRS./DAYS
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-slate-400">
                      Amount
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-100">
                      <td className="border border-gray-300 px-4 py-2">
                        {item.serviceId.name}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        RS {item.serviceId.fee}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {item.hoursDays}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        RS {item.amount}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 flex gap-2">
                        <button
                          onClick={() => openModalForEdit(item)}
                          className="bg-green-500 text-white px-2 py-1 rounded-md"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteLineItem(item._id)}
                          className="bg-red-500 text-white px-2 py-1 rounded-md"
                        >
                          Delete
                        </button>
                        <button
        className="bg-blue-700 text-white px-2 py-1 rounded-md"
        onClick={() => setIsModalOpen(true)}
      >
        Add Users
      </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
              <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50 z-50">
                <div className="bg-white p-6 rounded-md shadow-lg max-w-lg mx-auto">
                  <div className="space-y-4 mb-6">
                    <h2 className="text-black-500 font-semibold">
                      Description
                    </h2>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter Your Description"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      value={fees}
                      onChange={(e) => setFees(e.target.value)}
                      placeholder="Enter Your Fees"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                      placeholder="Enter Your Hrs./Days"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter Your Amount"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={handleSave}
                      className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsModalOpen(false)} // Close the modal without saving
                      className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>


          {/* add user modal */}
          {isModalOpen && (
              <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50 z-50">
                <div className="bg-white p-6 rounded-md shadow-lg max-w-lg mx-auto">
                  <div className="space-y-4 mb-6">
                    <h2 className="text-black-500 font-semibold">
                      Description
                    </h2>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter Your Description"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      value={fees}
                      onChange={(e) => setFees(e.target.value)}
                      placeholder="Enter Your Fees"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                      placeholder="Enter Your Hrs./Days"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter Your Amount"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={handleSavedData}
                      className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setIsModalOpen(false)} // Close the modal without saving
                      className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* end Add userModal */}

          {/* Totals Section */}
          <div>
          {selectedInvoice && (
            <div className="container-total flex items-center justify-between mt-4">
              <div className="left-side">
                <h1 className="text-blue-500">INVOICE TOTAL</h1>
                <h2>RS {selectedInvoice.total}</h2>
              </div>
              <div className="right-side flex items-center gap-4">
                <h2 className="text-xl font-bold text-blue-500">SUB TOTAL</h2>
                <h3>RS {selectedInvoice.subtotal}</h3>
              </div>
            </div>
          )}

          {/* Payment Details Section */}
          {paymentDetails && (
            <div className="left-payment mt-8">
              <h1 className="font-bold text-lg mb-2 text-blue-500">
                Payment Details
              </h1>
              <h2 className="text-gray-700 font-semibold">
                AC Holder: {paymentDetails.account_holder}
              </h2>
              <h3 className="text-gray-700 font-semibold">
                Bank Name: {paymentDetails.bank_name}
              </h3>
              <h4 className="text-gray-700 font-semibold">
                Account No: {paymentDetails.account_number}
              </h4>
              <h5 className="text-gray-700 font-semibold">
                IBAN: {paymentDetails.IBAN}
              </h5>
            </div>
          )}

          {/* Terms and Penalty Section */}
          <div className="container-term-left w-full flex flex-col sm:items-center md:flex-row md:items-center justify-between gap-6 p-4 border-t border-gray-300 mt-4">
            <div className="left-terms md:w-1/2 text-center md:text-left w-[40%]">
              <h1 className="text-xl font-semibold mb-2 text-blue-500">
                Terms and Conditions
              </h1>
              <p className="text-gray-600 leading-relaxed font-semibold">
                Kindly be aware that all fees paid for our products/services are
                non-refundable. This policy applies to all transactions.
              </p>
            </div>
            <div className="right-terms w-full sm:w-auto md:w-[20%]">
              <h1 className="text-xl font-semibold mb-2 text-blue-500">
                Penalty
              </h1>
              <p className="text-gray-600 leading-relaxed font-semibold">
                A penalty of 1000/- applies from the 7th day, escalating daily
                until the outstanding amount is settled.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Bank;
