import React from 'react';
import { CreditCard, Banknote, AlertCircle, CheckCircle2 } from 'lucide-react';
import Modal from './Modal';

const PaymentConfirmModal = ({ isOpen, onClose, onConfirm, amount, method }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Payment Collection Verification">
            <div className="text-center space-y-6">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${method === 'Cash' ? 'bg-emerald-100' : 'bg-blue-100'
                    }`}>
                    {method === 'Cash' ? (
                        <Banknote className="w-10 h-10 text-emerald-600" />
                    ) : (
                        <CreditCard className="w-10 h-10 text-blue-600" />
                    )}
                </div>

                <div className="space-y-2">
                    <h4 className="text-2xl font-bold text-gray-900">
                        {method === 'Cash' ? 'Take Cash Money' : 'Process Card Payment'}
                    </h4>
                    <p className="text-gray-500">
                        Please collect the full amount from the guest before proceeding.
                    </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <div className="text-sm text-gray-400 uppercase tracking-widest font-bold mb-1">Total to Collect</div>
                    <div className={`text-4xl font-black ${method === 'Cash' ? 'text-emerald-600' : 'text-blue-600'
                        }`}>
                        ${amount}
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 px-6 py-3 text-white font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-1 ${method === 'Cash'
                                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <CheckCircle2 size={18} />
                            Payment Collected
                        </div>
                    </button>
                </div>

                <p className="text-xs text-gray-400 flex items-center justify-center gap-1.5 pt-2">
                    <AlertCircle size={14} />
                    This will finalize the booking and record a successful payment.
                </p>
            </div>
        </Modal>
    );
};

export default PaymentConfirmModal;
