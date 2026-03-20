import React, { useState } from "react";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import Alert from "../../../components/ui/Alert";

const fakeBillingData = {
  cardHolder: "John Doe",
  cardNumber: "**** **** **** 1234",
  expiryDate: "12/26",
  billingAddress: "123 Main St, New York, NY, 10001",
  city: "New York",
  country: "USA",
  zipCode: "10001",
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function BillingInfo() {
  const [billingInfo, setBillingInfo] = useState(fakeBillingData);
  const [editing, setEditing] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBillingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const setHandleEditing = async () => {
    const timestamp = new Date().getTime();
    const orderId = `0012${timestamp}`;
    const amount = 3000000;

    // Redirect tới backend, backend sẽ trả URL VNPay đã encode và có hash
    window.location.href = `${API_BASE_URL}/payment/pay?orderId=${orderId}&amount=${amount}`;
  };

  const handleSave = () => {
    // Thử giả lập save thành công
    setAlert({
      type: "success",
      message: "Billing info updated successfully!",
    });
    setEditing(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Billing Information</h2>

      {alert && <Alert type={alert.type}>{alert.message}</Alert>}

      <div className="space-y-4">
        <Input
          label="Card Holder"
          name="cardHolder"
          value={billingInfo.cardHolder}
          onChange={handleChange}
          disabled={!editing}
        />
        <Input
          label="Card Number"
          name="cardNumber"
          value={billingInfo.cardNumber}
          onChange={handleChange}
          disabled={!editing}
        />
        <Input
          label="Expiry Date"
          name="expiryDate"
          value={billingInfo.expiryDate}
          onChange={handleChange}
          disabled={!editing}
        />
        <Input
          label="Billing Address"
          name="billingAddress"
          value={billingInfo.billingAddress}
          onChange={handleChange}
          disabled={!editing}
        />
        <Input
          label="City"
          name="city"
          value={billingInfo.city}
          onChange={handleChange}
          disabled={!editing}
        />
        <Input
          label="Country"
          name="country"
          value={billingInfo.country}
          onChange={handleChange}
          disabled={!editing}
        />
        <Input
          label="ZIP Code"
          name="zipCode"
          value={billingInfo.zipCode}
          onChange={handleChange}
          disabled={!editing}
        />
      </div>

      <div className="mt-6 flex justify-end gap-2">
        {editing ? (
          <>
            <Button onClick={handleSave}>Save</Button>
            <Button onClick={() => setEditing(false)} variant="secondary">
              Cancel
            </Button>
          </>
        ) : (
          <Button onClick={() => setHandleEditing(true)}>Edit</Button>
        )}
      </div>
    </div>
  );
}
