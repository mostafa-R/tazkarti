import { useState } from "react";

function Tickets({ tickets }) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Available Tickets</h2>
      <div className="mt-4">
        {tickets.map((ticket) => {
          const isSoldOut = ticket.availableQuantity === 0;
          const isLimited =
            ticket.availableQuantity <= 5 && ticket.availableQuantity > 0;
          return (
            <div
              key={ticket._id}
              className="bg-white rounded-lg shadow-md p-4 border hover:shadow-lg transition flex flex-col justify-between mt-3"
            >
              <div>
                <h3 className="text-lg font-bold text-blue-600 mb-1">
                  {ticket.type}
                </h3>
                <p className="text-gray-700 mb-1">💰 Price: ${ticket.price}</p>
                <p className="text-gray-500 mb-1">
                  🎟️ Available: {ticket.availableQuantity}
                </p>
                <p className="text-gray-500 text-sm mb-2">
                  {ticket.description}
                </p>

                {isSoldOut ? (
                  <span className="text-red-600 font-semibold">
                    ❌ Sold Out
                  </span>
                ) : isLimited ? (
                  <span className="text-yellow-600 font-medium">
                    ⚠️ Almost Sold Out
                  </span>
                ) : (
                  <span className="text-green-600 font-medium">
                    ✅ Available
                  </span>
                )}
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>

              <button
                disabled={isSoldOut}
                className={`mt-4 w-full px-4 py-2 text-white font-semibold rounded 
            ${
              isSoldOut
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 transition"
            }`}
              >
                احجز الآن
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Tickets;
