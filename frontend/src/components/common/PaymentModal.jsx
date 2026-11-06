import React, { useState } from 'react';
import Modal from './Modal';
import { CreditCard, Smartphone, Building, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const PaymentModal = ({ isOpen, onClose, amount, orderDetails, onPaymentSuccess, onPaymentFailure }) => {
  const [method, setMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('123');
  const [upiId, setUpiId] = useState('testuser@okhdfcbank');

  const handlePay = (shouldSucceed = true) => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      if (shouldSucceed) {
        const mockPaymentData = {
          razorpay_payment_id: `pay_test_${Date.now()}`,
          razorpay_order_id: `order_test_${Date.now()}`,
          razorpay_signature: `sig_sandbox_verified_${Date.now()}`,
        };
        onPaymentSuccess(mockPaymentData);
      } else {
        onPaymentFailure('Payment was declined by issuing bank (Sandbox Simulation)');
      }
    }, 1500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Razorpay Sandbox Checkout" maxWidth="max-w-md">
      <div className="space-y-5">
        {/* Merchant & Amount Banner */}
        <div className="bg-gradient-to-r from-navy-900 to-navy-800 text-white p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
            <span className="flex items-center gap-1">
              <ShieldCheck size={14} className="text-emerald-400" /> Razorpay Test Mode
            </span>
            <span>256-bit Encryption</span>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <div>
              <p className="text-xs text-slate-300">Amount to Pay</p>
              <h2 className="text-2xl font-black text-white">{formatCurrency(amount)}</h2>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 bg-brand-orange/30 text-orange-200 rounded border border-brand-orange/40">
              Sandbox
            </span>
          </div>
        </div>

        {/* Payment Methods Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => setMethod('card')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-md transition-all ${
              method === 'card' ? 'bg-white text-navy-900 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            <CreditCard size={14} /> Card
          </button>
          <button
            type="button"
            onClick={() => setMethod('upi')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-md transition-all ${
              method === 'upi' ? 'bg-white text-navy-900 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            <Smartphone size={14} /> UPI / QR
          </button>
          <button
            type="button"
            onClick={() => setMethod('netbanking')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-md transition-all ${
              method === 'netbanking' ? 'bg-white text-navy-900 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            <Building size={14} /> Netbanking
          </button>
        </div>

        {/* Tab Content */}
        {method === 'card' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Test Card Number</label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-600 focus:border-transparent font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Expiry Date</label>
                <input
                  type="text"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-600 focus:border-transparent font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">CVV</label>
                <input
                  type="password"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-600 focus:border-transparent font-mono"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-400">Preloaded with Razorpay test card. No real money charged.</p>
          </div>
        )}

        {method === 'upi' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Virtual Payment Address (VPA / UPI ID)</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-600 font-mono"
              />
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
              Instant sandbox UPI verification enabled.
            </div>
          </div>
        )}

        {method === 'netbanking' && (
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">Select Bank</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank'].map((bank, i) => (
                <div
                  key={bank}
                  className={`p-2.5 border rounded-lg cursor-pointer text-center font-medium ${
                    i === 0 ? 'border-navy-600 bg-navy-50 text-navy-900 font-bold' : 'border-slate-200'
                  }`}
                >
                  {bank}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 space-y-2">
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => handlePay(true)}
            className="w-full py-3 bg-brand-orange hover:bg-brand-orangeHover text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Processing Sandbox Payment...
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                Simulate Successful Payment ({formatCurrency(amount)})
              </>
            )}
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={() => handlePay(false)}
            className="w-full py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <AlertCircle size={14} /> Simulate Declined / Failed Payment
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentModal;
