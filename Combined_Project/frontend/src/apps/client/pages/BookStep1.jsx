import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const BookStep1 = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const workerId = searchParams.get("workerId");
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

  // Calendar mock generation
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const startDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

  useEffect(() => {
    if (workerId) {
      fetch(`/api/workers/${workerId}`)
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Failed to fetch worker");
        })
        .then((data) => {
          setWorker(data);
          // Auto-select first service if available
          if (data && (!selectedService)) {
            // Mock services creation if not strictly in data
            const s = [
              { id: '1', title: "Standard Service", desc: `General ${data.role || "service"}`, price: data.hourly_rate || 20 },
              { id: '2', title: "Premium Service", desc: "Includes additional coordination", price: (data.hourly_rate || 20) + 15 },
              { id: '3', title: "Package Deal", desc: "4-hour event service", price: (data.hourly_rate || 20) * 3.5 }
            ];
            setSelectedService(s[0]);
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [workerId]);

  if (loading) return (
    <main className="flex-1 overflow-y-auto p-6 md:p-8 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Loading booking...</p>
      </div>
    </main>
  );

  const services = worker ? [
    { id: '1', title: "Standard Service", desc: `General ${worker.role || "service"}`, price: worker.hourly_rate || 20 },
    { id: '2', title: "Premium Service", desc: "Includes additional coordination", price: (worker.hourly_rate || 20) + 10 },
    { id: '3', title: "Package Deal", desc: "4-hour event service", price: ((worker.hourly_rate || 20) * 4) * 0.9 }
  ] : [];

  const handleNext = () => {
    if (!selectedService || !selectedDate || !selectedTimeSlot) {
      alert("Please select a service, date, and time.");
      return;
    }

    // Pass data to Step 2
    const params = new URLSearchParams();
    params.append("workerId", workerId);

    navigate(`/book/step-2?${params.toString()}`, {
      state: {
        worker,
        service: selectedService,
        date: selectedDate,
        time: selectedTimeSlot
      }
    });
  };

  if (!worker) {
    return (
      <main className="flex-1 overflow-y-auto p-6 md:p-8 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="flex justify-center">
            <span className="material-symbols-outlined text-6xl text-gray-300">work_off</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Worker Not Found</h2>
          <p className="text-gray-500">The professional you are looking for could not be found or no worker was selected.</p>
          <button
            onClick={() => navigate("/browse-staff")}
            className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors"
          >
            Browse Staff
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Worker Header */}
        <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center gap-4 mb-8">
          <img
            alt={worker.name}
            className="size-16 rounded-full object-cover border-2 border-white dark:border-gray-800"
            src={worker.image_url || "https://via.placeholder.com/150"}
            onError={(e) => { e.target.src = "https://via.placeholder.com/150"; }}
          />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">You are booking:</p>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{worker.name}</h2>
            <p className="text-primary font-medium">{worker.role}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Steps Nav */}
          <div className="md:col-span-1">
            <nav>
              <ul className="space-y-4">
                <li>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-8 rounded-full bg-primary text-white font-bold">1</div>
                    <div>
                      <h3 className="font-bold text-primary">Service & Time</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Select service and date</p>
                    </div>
                  </div>
                </li>
                <li><div className="h-6 w-px bg-gray-200 dark:bg-gray-700 ml-4"></div></li>
                <li>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-bold">2</div>
                    <div>
                      <h3 className="font-semibold text-gray-600 dark:text-gray-300">Details</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Location and instructions</p>
                    </div>
                  </div>
                </li>
                <li><div className="h-6 w-px bg-gray-200 dark:bg-gray-700 ml-4"></div></li>
                <li>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-bold">3</div>
                    <div>
                      <h3 className="font-semibold text-gray-600 dark:text-gray-300">Confirm & Pay</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Review and finalize</p>
                    </div>
                  </div>
                </li>
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3 space-y-8">
            {/* 1. Select Service */}
            <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">1. Select Service</h3>
              <div className="space-y-3">
                {services.map((s) => (
                  <label
                    key={s.id}
                    className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${selectedService?.id === s.id
                      ? "border-primary bg-primary/5 dark:bg-primary/10"
                      : "border-gray-200 dark:border-gray-700 hover:border-primary"
                      }`}
                  >
                    <input
                      checked={selectedService?.id === s.id}
                      onChange={() => setSelectedService(s)}
                      className="form-radio text-primary focus:ring-primary"
                      name="service"
                      type="radio"
                    />
                    <div className="ml-4 flex-grow">
                      <p className="font-semibold text-gray-800 dark:text-gray-100">{s.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{s.desc}</p>
                    </div>
                    <p className="font-bold text-lg text-primary">${Math.round(s.price)}{s.title.includes("Package") ? "" : "/hr"}</p>
                  </label>
                ))}
              </div>
            </div>

            {/* 2. Select Date & Time */}
            <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">2. Select Date & Time</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Calendar */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                      <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <p className="font-semibold">{today.toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                    <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-7 text-center text-sm text-gray-500 dark:text-gray-400">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d} className="font-medium h-8">{d}</div>)}
                    {Array.from({ length: 35 }).map((_, i) => {
                      const day = i - startDay + 1;
                      const isDate = day > 0 && day <= daysInMonth;
                      // Simple mock visual logic
                      const dateStr = isDate ? `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : "";
                      const isSelected = selectedDate === dateStr;

                      return (
                        <div key={i} className="h-8">
                          {isDate && (
                            <button
                              onClick={() => setSelectedDate(dateStr)}
                              className={`size-8 rounded-full flex items-center justify-center transition-colors ${isSelected
                                ? "bg-primary text-white font-bold"
                                : "hover:bg-primary/20"
                                }`}
                            >
                              {day}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Timeslots */}
                <div>
                  <p className="font-semibold mb-4 text-center">Available Timeslots</p>
                  <div className="grid grid-cols-2 gap-3">
                    {["09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setSelectedTimeSlot(t)}
                        className={`px-4 py-2 border rounded-md text-center transition-all ${selectedTimeSlot === t
                          ? "border-primary bg-primary/10 text-primary font-semibold"
                          : "border-gray-300 dark:border-gray-600 hover:border-primary hover:bg-primary/5"
                          }`}
                      >
                        {t}
                      </button>
                    ))}
                    <button disabled className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-center text-gray-400 dark:text-gray-500 cursor-not-allowed">
                      05:00 PM
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={handleNext}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors"
              >
                <span>Continue to Details</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default BookStep1;

