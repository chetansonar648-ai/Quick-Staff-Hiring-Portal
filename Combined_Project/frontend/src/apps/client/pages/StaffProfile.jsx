import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const StaffProfile = () => {
  console.log('StaffProfile component mounted!');
  const { id } = useParams();
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWorkerDetails = async () => {
      try {
        console.log('Fetching worker details for ID:', id);
        const token = localStorage.getItem('token') || localStorage.getItem('qs_token');
        console.log('Token:', token ? 'Present' : 'Missing');

        const response = await fetch(`/api/workers/${id}`, {
          headers: {
            "Content-Type": "application/json",
            ...(token && { "Authorization": `Bearer ${token}` })
          }
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error("Worker not found");
        }

        const data = await response.json();
        console.log('Worker data:', data);
        setWorker(data);
      } catch (err) {
        console.error("Error fetching worker details:", err);
        setError("Failed to load worker details.");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkerDetails();
  }, [id]);

  if (loading) {
    return (
      <main className="flex-1 overflow-y-auto p-6 md:p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Loading profile...</p>
        </div>
      </main>
    );
  }

  if (error || !worker) {
    return (
      <main className="flex-1 overflow-y-auto p-6 md:p-8 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="flex justify-center">
            <span className="material-symbols-outlined text-6xl text-gray-300">person_off</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Profile Not Found</h2>
          <p className="text-gray-500">{error || "We couldn't find the staff profile you're looking for."}</p>
          <button
            onClick={() => navigate("/client/browse-staff")}
            className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors"
          >
            Browse Staff
          </button>
        </div>
      </main>
    );
  }

  // Construct services based on worker data
  const services = [
    { title: "Standard Service", desc: `General ${worker.role || "service"}`, price: `$${worker.hourly_rate || 0}/hr` },
    { title: "Premium Service", desc: "Includes additional coordination", price: `$${(worker.hourly_rate || 0) + 10}/hr` },
    { title: "Full Day", desc: "8 hours block", price: `$${(worker.hourly_rate || 0) * 7.5}` } // Discounted
  ];

  return (
    <main className="flex-1 overflow-y-auto p-6 md:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <img
                alt={worker.name}
                className="size-32 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg flex-shrink-0"
                src={worker.image_url}
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/150?text=No+Image";
                }}
              />
              <div className="flex-grow space-y-3">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{worker.name}</h2>
                    <p className="text-lg text-primary font-medium">{worker.role}</p>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500 mt-2 sm:mt-0">
                    <span className="material-symbols-outlined !text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      star
                    </span>
                    <span className="text-lg font-bold text-gray-700 dark:text-gray-200">{parseFloat(worker.rating || 0).toFixed(1)}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">({worker.rating_count || 0} reviews)</span>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  {worker.description || "No description available for this worker."}
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => navigate(`/client/book/step-1?workerId=${worker.id}`)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <span className="material-symbols-outlined">calendar_add_on</span>
                    <span>Book Now</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      if (confirm("Save this worker to your list?")) {
                        try {
                          const response = await fetch(`/api/saved-workers/${worker.id}`, {
                            method: "POST",
                            headers: { "x-user-id": "mock-user-id" }
                          });
                          if (response.ok) {
                            alert("Worker saved successfully!");
                          } else {
                            alert("Worker already saved or error occurred.");
                          }
                        } catch (e) {
                          console.error(e);
                          alert("Failed to save worker.");
                        }
                      }
                    }}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="material-symbols-outlined">bookmark_add</span>
                    <span>Add to Saved</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <Section title="About Me">
            {worker.about || worker.description || "No detailed information available."}
          </Section>

          <Section title="Experience & Skills">
            <div className="flex flex-wrap gap-3">
              {worker.skills && Array.isArray(worker.skills) && worker.skills.length > 0 ? (
                worker.skills.map((skill, index) => (
                  <span key={index} className="bg-primary/10 text-primary text-sm font-medium px-3 py-1.5 rounded-full">
                    {skill.skill_name || skill}
                  </span>
                ))
              ) : (
                <span className="text-gray-500">No specific skills listed.</span>
              )}
            </div>
          </Section>

          <Section title="Portfolio / Gallery">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {worker.portfolio && Array.isArray(worker.portfolio) && worker.portfolio.length > 0 ? (
                worker.portfolio.map((img, index) => (
                  <img key={index} alt="Portfolio" className="rounded-lg object-cover aspect-square" src={img.image_url || img} />
                ))
              ) : (
                <p className="text-gray-500 col-span-full">No portfolio items available.</p>
              )}
            </div>
          </Section>

          <Section title={`Client Reviews (${worker.reviews?.length || 0})`}>
            <div className="space-y-6">
              {worker.reviews && Array.isArray(worker.reviews) && worker.reviews.length > 0 ? (
                worker.reviews.map((r, index) => (
                  <div key={index}>
                    <div className="flex items-start gap-4">
                      <img alt={r.client_name || "Client"} className="size-10 rounded-full object-cover" src={r.client_image || "https://via.placeholder.com/40?text=U"} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-800 dark:text-gray-100">{r.client_name || "Anonymous"}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{r.created_at ? new Date(r.created_at).toLocaleDateString() : "Recent"}</p>
                          </div>
                          <div className="flex items-center gap-1 text-yellow-500">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span
                                key={i}
                                className={`material-symbols-outlined !text-base ${i < r.rating ? "" : "text-gray-300"}`}
                                style={{ fontVariationSettings: "'FILL' 1" }}
                              >
                                star
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">{r.comment}</p>
                      </div>
                    </div>
                    {index < worker.reviews.length - 1 && <div className="border-t border-gray-200 dark:border-gray-700 mt-6"></div>}
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No reviews yet.</p>
              )}
            </div>
            {worker.reviews && worker.reviews.length > 0 && (
              <div className="mt-6 text-center">
                <button className="font-semibold text-primary hover:underline">Show More Reviews</button>
              </div>
            )}
          </Section>
        </div>

        <div className="space-y-8">
          <Section title="Services Offered">
            <div className="space-y-4">
              {services.map((s) => (
                <div key={s.title} className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-100">{s.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{s.desc}</p>
                  </div>
                  <p className="font-bold text-lg text-primary">{s.price}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Availability Calendar">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <p className="font-semibold">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
              <div className="grid grid-cols-7 text-center text-sm text-gray-500 dark:text-gray-400">
                <div className="font-medium">Su</div>
                <div className="font-medium">Mo</div>
                <div className="font-medium">Tu</div>
                <div className="font-medium">We</div>
                <div className="font-medium">Th</div>
                <div className="font-medium">Fr</div>
                <div className="font-medium">Sa</div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-sm">
                {Array.from({ length: 35 }).map((_, i) => {
                  const today = new Date();
                  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
                  const day = i - firstDayOfMonth + 1;
                  const date = new Date(today.getFullYear(), today.getMonth(), day);
                  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

                  const isDate = day > 0 && day <= daysInMonth;

                  // Check availability from worker data
                  let isAvailable = false;
                  if (isDate && worker.availability) {
                    const dayOfWeek = date.getDay(); // 0-6
                    const availEntry = worker.availability.find(
                      (a) => a.day_of_week === dayOfWeek || a.day_of_week === String(dayOfWeek)
                    );
                    if (availEntry && availEntry.is_available) {
                      isAvailable = true;
                    }
                  }

                  let content = isDate ? day : "";
                  let className = "py-1 flex items-center justify-center";

                  if (isDate) {
                    if (isAvailable) {
                      className += " bg-primary/10 text-primary font-bold rounded-full size-8 mx-auto";
                    } else {
                      className += " text-gray-400 dark:text-gray-600";
                    }
                  } else {
                    className += " text-gray-400 dark:text-gray-500 opacity-0";
                  }

                  return (
                    <div key={i} className={className}>
                      {content}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-primary/20"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-red-500"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Booked</span>
                </div>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </main>
  );
};

const Section = ({ title, children }) => (
  <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
    <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{title}</h3>
    {children}
  </div>
);

export default StaffProfile;