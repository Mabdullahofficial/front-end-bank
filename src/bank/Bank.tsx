import { useState, useEffect } from "react";
import api from "../utils";
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
  const [isModalOpenAdd, setIsModalOpenAdd] = useState(false);
  const [isModalOpenEdit, setIsModalOpenEdit] = useState(false);
  const [name, setName] = useState("");
  const [fee, setFees] = useState("");
  const [hoursDays, setHoursDays] = useState("");
  const [amount, setAmount] = useState("");
  const [editItem, setEditItem] = useState(null);
  const [isPrintOn, setIsPrintOn] = useState(false);

  // Reset form fields function
  const resetFormFields = () => {
    setName("");
    setFees("");
    setHoursDays("");
    setAmount("");
  };

  // Fetch initial invoices
  async function fetchInvoices() {
    try {
      const response = await api.get("/invoices");
      setInvoices(response.data);
      if (response.data.length > 0) {
        setSelectedInvoice(response.data[0]);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  }

  function triggerPrint() {
    window.print();

    setIsPrintOn(false)
  }
  

  // Fetch line items
  async function fetchLineItems() {
    try {
      const response = await api.get(`/invoicelineitems`);
      setLineItems(response.data);
    } catch (error) {
      console.error("Error fetching line items:", error);
    }
  }

  useEffect(() => {
    fetchInvoices();
  }, []);

  const openModalForEdit = (item) => {
    setEditItem(item);
    setName(item.serviceId.name);
    setFees(item.serviceId.fee);
    setHoursDays(item.hoursDays);
    setAmount(item.amount);
    setIsModalOpenEdit(true);
  };

  useEffect(() => {
    if (!selectedInvoice) return;

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

  async function handleDeleteInvoice(id) {
    setIsDeletingInvoice(true);
    try {
      await api.delete(`/invoices/${id}`);
      const updatedInvoices = invoices.filter((invoice) => invoice._id !== id);
      setInvoices(updatedInvoices);
      setSelectedInvoice(updatedInvoices.length > 0 ? updatedInvoices[0] : null);
    } catch (error) {
      console.error("Error deleting invoice:", error);
    } finally {
      setIsDeletingInvoice(false);
    }
  }

  async function handleDeleteLineItem(id) {
    setIsDeletingLineItem(true);
    try {
      await api.delete(`/invoicelineitems/${id}`);
      await fetchLineItems(); // Refresh the line items after deletion
    } catch (error) {
      console.error("Error deleting line item:", error);
    } finally {
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
      await axios.put(url, updatedItem, {
        headers: { "Content-Type": "application/json" }
      });
      
      await fetchLineItems(); // Refresh the line items after edit
      setIsEditingLineItem(false);
    } catch (error) {
      console.error("Error updating line item:", error);
    }
  }

  const handleSave = async () => {
    if (editItem) {
      const updatedItem = {
        invoiceNumber: editItem.invoiceNumber._id,
        serviceId: editItem.serviceId._id,
        hoursDays: hoursDays,
        amount: amount,
        _id: editItem._id,
      };

      await updateService(editItem.serviceId._id, {
        name: name,
        fee: fee,
      });

      await handleEditLineItem(updatedItem);
      setIsModalOpenEdit(false);
      resetFormFields();
    }
  };

  async function handleAddUser(newUser) {
    try {
      const url = `http://localhost:3003/api/services/add`;
      await axios.post(url, newUser, {
        headers: { "Content-Type": "application/json" }
      });
      
      // Reset form and refresh data
      resetFormFields();
      setIsModalOpenAdd(false);
      await fetchLineItems();
    } catch (error) {
      console.error("Error adding user:", error);
    }
  }

  const handleAddData = async () => {
    const newUser = {
      invoiceNumber: "INV-1",
      name,
      fee,
      hoursDays,
      amount,
    };
    await handleAddUser(newUser);
  };

  const handleCloseAddModal = () => {
    setIsModalOpenAdd(false);
    resetFormFields();
  };



  const handlePrintDownload = async () => {
    try {
      // First make API call to generate PDF
      const response = await api.get('/generate-pdf', { responseType: 'blob' });
      
      // Create blob URL
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const pdfUrl = window.URL.createObjectURL(pdfBlob);
      
      // Trigger download
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = 'invoice.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Open in new tab
      window.open(pdfUrl, '_blank');
      
      // Clean up
      window.URL.revokeObjectURL(pdfUrl);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };
  
  

  return (
    <>
      {!isPrintOn && <Header />}
      <div className="w-full h-auto flex flex-col items-center">
        <div className="w-[95%]">
          {/* Invoice Selection */}
          {!isPrintOn && <div className="flex justify-between items-center my-4">
            <h1 className="text-2xl font-bold">Invoices</h1>
            <select
              value={selectedInvoice?._id || ""}
              onChange={(e) => setSelectedInvoice(
                invoices.find((inv) => inv._id === e.target.value)
              )}
              className="border p-2 rounded"
            >
              {invoices.map((invoice) => (
                <option key={invoice._id} value={invoice._id}>
                  {invoice.invoice_number}
                </option>
              ))}
            </select>
          </div>}

          {/* Invoice Details Section */}
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
                      <h2 className="text-blue-500 font-semibold">INVOICE NUMBER</h2>
                      <p>{selectedInvoice.invoice_number}</p>
                    </div>
                    <div>
                      <h2 className="text-blue-500 font-semibold">DATE OF ISSUE</h2>
                      <p>{new Date(selectedInvoice.date_of_issue).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <h2 className="text-blue-500 font-semibold">DUE DATE</h2>
                      <p>{new Date(selectedInvoice.due_date).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {selectedInvoice.clientId && (
                    <div>
                      <h1 className="text-slate-300">BILLED TO</h1>
                      <h2 className="font-semibold">{selectedInvoice.clientId.name}</h2>
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
                <img src={rightsideimage} className="w-full" alt="Right Side Image" />
              </div>

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

          {/* Services Summary Table */}
          <div className="w-full p-4">
            <h1 className="text-2xl font-bold mb-4">Services Summary</h1>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-200 bg-white shadow-lg">
                <thead>
                  <tr className="bg-gray-200 text-gray-700">
                    <th className="border border-gray-300 px-4 py-2 text-left text-blue-500">Description</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-slate-400">Fee</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-slate-400">HRS./DAYS</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-slate-400">Amount</th>
                    {!isPrintOn &&<th className="border border-gray-300 px-4 py-2 text-left text-slate-400">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, index) => (
                    <tr key={item._id || index} className="hover:bg-gray-100">
                      <td className="border border-gray-300 px-4 py-2">{item.serviceId?.name}</td>
                      <td className="border border-gray-300 px-4 py-2">RS {item.serviceId?.fee}</td>
                      <td className="border border-gray-300 px-4 py-2">{item?.hoursDays}</td>
                      <td className="border border-gray-300 px-4 py-2">RS {item?.amount}</td>
                      {!isPrintOn &&<td className="border border-gray-300 px-4 py-2 flex gap-2">
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
                          onClick={() => setIsModalOpenAdd(true)}
                        >
                          Add Users
                        </button>
                      </td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Edit Modal */}
            {isModalOpenEdit && (
              <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50 z-50">
                <div className="bg-white p-6 rounded-md shadow-lg max-w-lg mx-auto">
                  <div className="space-y-4 mb-6">
                    <h2 className="text-black-500 font-semibold">Description</h2>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter Your Description"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      value={fee}
                      onChange={(e) => setFees(e.target.value)}
                      placeholder="Enter Your Fees"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      value={hoursDays}
                      onChange={(e) => setHoursDays(e.target.value)}
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
                      onClick={() => {
                        setIsModalOpenEdit(false);
                        resetFormFields();
                      }}
                      className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Add User Modal */}
            {isModalOpenAdd && (
              <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50">
                <div className="bg-white p-6 rounded-md max-w-lg mx-auto">
                  <div className="space-y-4 mb-6">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter Your Description"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      value={fee}
                      onChange={(e) => setFees(e.target.value)}
                      placeholder="Enter Your Fees"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      value={hoursDays}
                      onChange={(e) => setHoursDays(e.target.value)}
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
                      onClick={handleAddData}
                      className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Add
                    </button>
                    <button
                      onClick={handleCloseAddModal}
                      className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Totals Section */}
        <div>
          {selectedInvoice && (
            <div className="flex items-center justify-between ml-9 mr-10">
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

          {/* Payment Details */}
          {paymentDetails && (
            <div className="left-payment ml-9 mt-5">
              <h1 className="font-bold text-lg mb-2 text-blue-500">Payment Details</h1>
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

          {/* Terms and Penalty */}
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


    <div className="flex items-center justify-center mb-4">
  <button
    className="bg-red-500 text-white rounded-md p-2 cursor-pointer hover:bg-red-900"
    onClick={()=> {
      setIsPrintOn(prev => !prev);
      setTimeout(() => triggerPrint(), 0)
    }}
  >
    Print
  </button>
</div>




        </div>
      </div>
    </>
  );
};

export default Bank;