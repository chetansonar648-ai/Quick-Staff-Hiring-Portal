import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const BookStep3 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { worker, service, date, time, location: serviceLocation, duration, instructions } = location.state || {};

  // Ensure we have data, otherwise redirect
  React.useEffect(() => {
    if (!worker || !date || !time) {
      navigate("/browse-staff");
    }
  }, [worker, date, time, navigate]);

  if (!worker) return null;

  const workerName = worker.name;
  const workerRole = worker.role;
  const workerImage = worker.image_url;

  const formattedDate = date && time
    ? new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) + ` at ${time}`
    : "";

  const bookingLocation = serviceLocation;
  const bookingInstructions = instructions || "None provided";

  const hourlyRate = worker?.hourly_rate || service?.price || 25;
  const bookingDuration = parseInt(duration || 4);
  const subtotal = hourlyRate * bookingDuration;
  const serviceFee = 10.00;
  const taxes = subtotal * 0.0825;
  const total = subtotal + serviceFee + taxes;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const userId = "mock-user-id";
      const bookingDate = new Date(date).toISOString().split('T')[0];

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId
        },
        body: JSON.stringify({
          worker_id: worker.id,
          service_type: service?.name || worker.role,
          service_description: bookingInstructions,
          booking_date: bookingDate,
          start_time: time,
          duration_hours: bookingDuration,
          location_address: bookingLocation,
          hourly_rate: hourlyRate
        })
      });

      if (response.ok) {
        const data = await response.json();
        navigate("/book/confirm", {
          state: {
            worker,
            serviceLocation: bookingLocation,
            total: total.toFixed(2),
            formattedDate,
            bookingReference: data.booking_reference
          }
        });
      } else {
        const err = await response.json();
        alert(`Booking failed: ${err.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Booking Error:", error);
      alert("An error occurred while creating your booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex-1 overflow-y-auto p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Steps Nav */}
          <div className="md:col-span-1">
            <nav>
              <ul className="space-y-4">
                <li>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-8 rounded-full bg-primary/20 dark:bg-primary/30 text-primary font-bold">
                      <span className="material-symbols-outlined">check</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-600 dark:text-gray-300">Service & Time</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
                    </div>
                  </div>
                </li>
                <li><div className="h-6 w-px bg-gray-200 dark:bg-gray-700 ml-4"></div></li>
                <li>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-8 rounded-full bg-primary/20 dark:bg-primary/30 text-primary font-bold">
                      <span className="material-symbols-outlined">check</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-600 dark:text-gray-300">Details</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
                    </div>
                  </div>
                </li>
                <li><div className="h-6 w-px bg-gray-200 dark:bg-gray-700 ml-4"></div></li>
                <li>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-8 rounded-full bg-primary text-white font-bold">3</div>
                    <div>
                      <h3 className="font-bold text-primary">Confirm & Pay</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Review and finalize</p>
                    </div>
                  </div>
                </li>
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800 space-y-8">

              {/* Booking Summary */}
              <div>
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Booking Summary</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <img
                      alt={workerName}
                      className="size-16 rounded-full object-cover border-2 border-white dark:border-gray-800"
                      src={workerImage}
                      onError={(e) => { e.target.src = "https://via.placeholder.com/150"; }}
                    />
                    <div className="flex-grow">
                      <h4 className="font-bold text-gray-900 dark:text-white">{workerName}</h4>
                      <p className="text-primary font-medium">{workerRole}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{bookingDuration} Hours of Service</p>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-base text-gray-500 dark:text-gray-400 mt-0.5">calendar_today</span>
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300">Date & Time</p>
                        <p className="text-gray-500 dark:text-gray-400">{formattedDate}</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-base text-gray-500 dark:text-gray-400 mt-0.5">location_on</span>
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300">Location</p>
                        <p className="text-gray-500 dark:text-gray-400">{bookingLocation}</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-base text-gray-500 dark:text-gray-400 mt-0.5">notes</span>
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300">Instructions</p>
                        <p className="text-gray-500 dark:text-gray-400 italic">"{bookingInstructions}"</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700"></div>

              {/* Payment Details */}
              <div>
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Payment Details</h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border-2 border-primary bg-primary/5">
                    <label className="flex items-center gap-4 cursor-pointer">
                      <input defaultChecked className="form-radio text-primary focus:ring-primary" name="payment-method" type="radio" />
                      <div className="flex items-center gap-3 flex-grow">
                        <span className="material-symbols-outlined text-2xl">payments</span>
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-gray-200">Cash / Online Payment</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Pay securely or on-site</p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700"></div>

              {/* Cost Breakdown */}
              <div>
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Cost Breakdown</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <p className="text-gray-600 dark:text-gray-300">Service ({bookingDuration} hrs @ ${hourlyRate}/hr)</p>
                    <p className="font-medium text-gray-800 dark:text-gray-200">${subtotal.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-600 dark:text-gray-300">Service Fee</p>
                    <p className="font-medium text-gray-800 dark:text-gray-200">${serviceFee.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-600 dark:text-gray-300">Taxes & Fees</p>
                    <p className="font-medium text-gray-800 dark:text-gray-200">${taxes.toFixed(2)}</p>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                  <div className="flex justify-between font-bold text-lg">
                    <p className="text-gray-900 dark:text-white">Estimated Total</p>
                    <p className="text-primary">${total.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input className="form-checkbox rounded text-primary focus:ring-primary focus:ring-offset-background-light dark:focus:ring-offset-gray-900" type="checkbox" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    I have read and agree to the <a className="font-medium text-primary hover:underline" href="#">Terms and Conditions</a> and <a className="font-medium text-primary hover:underline" href="#">Cancellation Policy</a>.
                  </span>
                </label>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span>Processing...</span>
                  ) : (
                    <>
                      <span>Confirm Booking</span>
                      <span className="material-symbols-outlined">check_circle</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default BookStep3;

