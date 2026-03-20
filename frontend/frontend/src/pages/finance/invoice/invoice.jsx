import { useState } from "react";
import "../invoice/invoice.css";

function Invoice() {
  const [invoice, setInvoice] = useState({
    invoiceNumber: "",
    date: "",
    seller: "",
    buyer: "",
    items: [{ description: "", quantity: 1, price: 0 }]
  });

  // handle input change
  const handleChange = (e) => {
    setInvoice({
      ...invoice,
      [e.target.name]: e.target.value
    });
  };

  // handle item change
  const handleItemChange = (index, e) => {
    const newItems = [...invoice.items];
    newItems[index][e.target.name] = e.target.value;
    setInvoice({ ...invoice, items: newItems });
  };

  // add new item
  const addItem = () => {
    setInvoice({
      ...invoice,
      items: [...invoice.items, { description: "", quantity: 1, price: 0 }]
    });
  };

  // calculate total
  const total = invoice.items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  return (
    <div className="invoice-container">
      <h2>Invoice Generator</h2>

      <input name="invoiceNumber" placeholder="Invoice Number" onChange={handleChange} />
      <input name="date" type="date" onChange={handleChange} />
      <input name="seller" placeholder="Seller Info" onChange={handleChange} />
      <input name="buyer" placeholder="Buyer Info" onChange={handleChange} />

      <h3>Items</h3>

      {invoice.items.map((item, index) => (
        <div key={index} className="item-row">
          <input
            name="description"
            placeholder="Description"
            onChange={(e) => handleItemChange(index, e)}
          />
          <input
            name="quantity"
            type="number"
            placeholder="Qty"
            onChange={(e) => handleItemChange(index, e)}
          />
          <input
            name="price"
            type="number"
            placeholder="Price"
            onChange={(e) => handleItemChange(index, e)}
          />
        </div>
      ))}

      <button onClick={addItem}>Add Item</button>

      <h3>Total: ZMW {total}</h3>

      <button onClick={() => window.print()}>Print Invoice</button>
    </div>
  );
}

export default Invoice;