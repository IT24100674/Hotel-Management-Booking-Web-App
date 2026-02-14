import React from 'react';
import { exclusiveOffers } from '../assets/assets';

const ExclusiveOffers = () => {
    return (
        <div className="py-16 bg-gray-50 px-4 md:px-16 lg:px-24">
            <div className="text-center mb-12">
                <h2 className="font-playfair text-3xl md:text-4xl font-bold text-gray-800 mb-4">Exclusive Offers</h2>
                <p className="text-gray-600 max-w-xl mx-auto">Create unforgettable memories with our special packages designed just for you.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {exclusiveOffers.map((offer) => (
                    <div key={offer._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
                        <div className="h-48 overflow-hidden">
                            <img src={offer.image} alt={offer.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-playfair text-xl font-bold text-gray-800">{offer.title}</h3>
                                <span className="bg-rose-100 text-rose-600 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">{offer.priceOff}% OFF</span>
                            </div>
                            <p className="text-gray-600 text-sm mb-4 flex-1">{offer.description}</p>
                            <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                                <span className="text-xs text-gray-500 font-medium">Valid until {offer.expiryDate}</span>
                                <button className="text-indigo-600 font-semibold text-sm hover:text-indigo-800 transition-colors">View Details →</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExclusiveOffers;
