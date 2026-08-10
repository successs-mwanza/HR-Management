// File: src/components/Invoice.js
import { useState } from "react";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
function Invoice() {
  const [invoice, setInvoice] = useState({
    invoiceNumber: "",
    date: "",
    dueDate: "",
    seller: "",
    buyer: "",
    paymentTerms: "",
    taxRate: 0,
    notes: "",
    items: [{ description: "", quantity: 1, price: 0 }]
  });

  // handle input change
  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.name === "taxRate") value = Number(value);

    setInvoice({
      ...invoice,
      [e.target.name]: value
    });
  };

  // handle item change
  const handleItemChange = (index, e) => {
    const newItems = [...invoice.items];
    let value = e.target.value;
    if (e.target.name === "quantity" || e.target.name === "price") value = Number(value);

    newItems[index][e.target.name] = value;
    setInvoice({ ...invoice, items: newItems });
  };

  // add new item
  const addItem = () => {
    setInvoice({
      ...invoice,
      items: [...invoice.items, { description: "", quantity: 1, price: 0 }]
    });
  };

  // calculations
  const subtotal = invoice.items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );
  const taxAmount = (subtotal * invoice.taxRate) / 100;
  const total = subtotal + taxAmount;

  // POST invoice to backend
  const handleSubmit = async () => {
    try {
      const response = await fetch("http://192.168.122.131:8080/api/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...invoice,
          subtotal,
          tax: taxAmount,
          totalAmount: total
        })
      });

      if (!response.ok) throw new Error("Failed");

      const data = await response.json();
      setInvoice({ ...invoice, invoiceNumber: data.invoiceNumber });

      alert("Invoice saved successfully!");
    } catch (error) {
      console.error(error);
      alert("Error saving invoice");
    }
  };

  // Generate PDF frontend
  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("INVOICE", 90, 15);

    doc.setFontSize(11);
    doc.text(`Invoice #: ${invoice.invoiceNumber || "N/A"}`, 14, 25);
    doc.text(`Date: ${invoice.date}`, 14, 32);
    doc.text(`Due Date: ${invoice.dueDate}`, 14, 39);
    doc.text(`Payment Terms: ${invoice.paymentTerms}`, 14, 46);
    doc.text(`Seller: ${invoice.seller}`, 14, 53);
    doc.text(`Buyer: ${invoice.buyer}`, 14, 60);

    const tableData = invoice.items.map(item => [
      item.description,
      item.quantity,
      `ZMW ${item.price}`
    ]);

    autoTable(doc, {
      startY: 70,
      head: [["Description", "Qty", "Price"]],
      body: tableData
    });

    const finalY = doc.lastAutoTable.finalY + 10;

    doc.text(`Subtotal: ZMW ${subtotal.toFixed(2)}`, 14, finalY);
    doc.text(`Tax: ZMW ${taxAmount.toFixed(2)}`, 14, finalY + 7);
    doc.text(`Total: ZMW ${total.toFixed(2)}`, 14, finalY + 14);

    doc.text(`Notes: ${invoice.notes || ""}`, 14, finalY + 25);

    doc.save(`invoice-${invoice.invoiceNumber || "new"}.pdf`);
  };

  return (
    <div className="invoice-wrapper">
      <div className="invoice-card">

        {/* Display invoice number */}
        {invoice.invoiceNumber && (
          <div className="invoice-number-display">
            Invoice #: <strong>{invoice.invoiceNumber}</strong>
          </div>
        )}

        <h2 className="title">Invoice</h2>

        <div className="grid-2">
          <input
            name="date"
            type="date"
            value={invoice.date}
            onChange={handleChange}
          />
          <input
            name="dueDate"
            type="date"
            value={invoice.dueDate}
            onChange={handleChange}
          />
          <input
            name="paymentTerms"
            placeholder="Payment Terms"
            value={invoice.paymentTerms}
            onChange={handleChange}
          />
        </div>

        <div className="grid-2">
          <input
            name="seller"
            placeholder="Seller Info"
            value={invoice.seller}
            onChange={handleChange}
          />
          <input
            name="buyer"
            placeholder="Buyer Info"
            value={invoice.buyer}
            onChange={handleChange}
          />
        </div>

        <div className="grid-1">
          <input
            name="taxRate"
            type="number"
            placeholder="Tax Rate (%)"
            value={invoice.taxRate}
            onChange={handleChange}
          />
        </div>

        <h3 className="section-title">Items</h3>

        {invoice.items.map((item, index) => (
          <div key={index} className="item-row">
            <input
              name="description"
              placeholder="Description"
              value={item.description}
              onChange={(e) => handleItemChange(index, e)}
            />
            <input
              name="quantity"
              type="number"
              placeholder="Qty"
              value={item.quantity}
              onChange={(e) => handleItemChange(index, e)}
            />
            <input
              name="price"
              type="number"
              placeholder="Price"
              value={item.price}
              onChange={(e) => handleItemChange(index, e)}
            />
          </div>
        ))}

        <button className="btn add-btn" onClick={addItem}>
          + Add Item
        </button>

        <div className="totals">
          <div><span>Subtotal:</span> ZMW {subtotal.toFixed(2)}</div>
          <div><span>Tax:</span> ZMW {taxAmount.toFixed(2)}</div>
          <div className="total"><span>Total:</span> ZMW {total.toFixed(2)}</div>
        </div>

        <textarea
          name="notes"
          placeholder="Notes..."
          value={invoice.notes}
          onChange={handleChange}
        />

        <div className="actions">
          <button className="btn primary" onClick={handleSubmit}>Save Invoice</button>
          <button className="btn secondary" onClick={() => window.print()}>Print</button>
          <button className="btn success" onClick={downloadPDF}>Download PDF</button>
        </div>
      </div>
    </div>
  );
}

export default Invoice;