import React from "react";
import "./InvoicePrint.css";

const InvoicePrint = React.forwardRef(({ invoice, settings }, ref) => {
  if (!invoice) return null;

  return (
    <div ref={ref} className="print-container">
      {/* Header */}
      <div className="print-header">
        <div className="store-info">
          <h1>{settings?.store_name || "My Billing Store"}</h1>
          <p>{settings?.address || "123 Business Road, City, State, 12345"}</p>
          <p>Phone: {settings?.phone || "+91 98765 43210"}</p>
          {settings?.gstin && <p>GSTIN: {settings.gstin}</p>}
        </div>
        <div className="invoice-info">
          <h2>INVOICE</h2>
          <table>
            <tbody>
              <tr>
                <td>Invoice No:</td>
                <td><strong>{invoice.invoice_no}</strong></td>
              </tr>
              <tr>
                <td>Date:</td>
                <td>{new Date(invoice.created_at).toLocaleDateString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <hr />

      {/* Customer Info */}
      <div className="customer-section">
        <h3>Bill To:</h3>
        <p><strong>{invoice.customer_name || "Walk-in Customer"}</strong></p>
        {invoice.customer_address && <p>{invoice.customer_address}</p>}
        {invoice.customer_phone && <p>Phone: {invoice.customer_phone}</p>}
      </div>

      {/* Items Table */}
      <table className="print-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Item</th>
            <th className="text-right">Price</th>
            <th className="text-center">Qty</th>
            <th className="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>
                {item.name}
                {item.sku && <div className="sku">SKU: {item.sku}</div>}
              </td>
              <td className="text-right">₹{parseFloat(item.unit_price).toFixed(2)}</td>
              <td className="text-center">{item.qty}</td>
              <td className="text-right">₹{parseFloat(item.line_total).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="print-footer">
        <div className="totals-box">
          <div className="row">
            <span>Subtotal:</span>
            <span>₹{parseFloat(invoice.subtotal).toFixed(2)}</span>
          </div>
          {parseFloat(invoice.tax_amount) > 0 && (
            <div className="row">
                <span>Tax (GST):</span>
                <span>₹{parseFloat(invoice.tax_amount).toFixed(2)}</span>
            </div>
          )}
          {parseFloat(invoice.discount_amount) > 0 && (
            <div className="row">
                <span>Discount:</span>
                <span>-₹{parseFloat(invoice.discount_amount).toFixed(2)}</span>
            </div>
          )}
          <div className="row grand-total">
            <span>Grand Total:</span>
            <span>₹{parseFloat(invoice.total).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Footer / Terms */}
      <div className="terms-section">
        <p>Thank you for your business!</p>
        <small>Terms & Conditions apply.</small>
      </div>
    </div>
  );
});

export default InvoicePrint;
