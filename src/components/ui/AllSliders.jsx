import React, { useState, useEffect } from "react";
import { useDataStore } from "../../stors/useDataStore.js";

export default function AllSlidersPage() {
  const { getAllSliders, showSlider, updateSlider, deleteSlider, message } = useDataStore((state) => state); // Accessing the functions from the store
  const [sliders, setSliders] = useState([]); // State to store sliders
  const [loading, setLoading] = useState(false); // Loading state
  const [selectedSlider, setSelectedSlider] = useState(null); // To view a single slider
  const [updatePayload, setUpdatePayload] = useState({ image: "" }); // Payload for updating a slider

  useEffect(() => {
    const fetchSliders = async () => {
      setLoading(true);
      try {
        const { data } = await getAllSliders(); // Fetch all sliders
        setSliders(data); // Set the fetched sliders in the state
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSliders();
  }, [getAllSliders]);

  const handleShow = async (id) => {
    const slider = await showSlider(id); // Fetch the single slider details
    setSelectedSlider(slider);
  };

  const handleUpdate = async (id) => {
    const updatedSlider = await updateSlider(id, updatePayload); // Update slider
    if (updatedSlider) {
      setSliders((prev) =>
        prev.map((slider) => (slider.id === id ? updatedSlider : slider))
      );
    }
  };

  const handleDelete = async (id) => {
    await deleteSlider(id); // Delete slider
  };

  return (
    <div className="min-h-screen bg-brand-25">
      <header className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-3xl font-bold text-brand-700">All Sliders</h1>
        <p className="text-brand-600">View, update, and delete sliders</p>
      </header>

      <main className="mx-auto max-w-4xl px-4 pb-16">
        {message && <div className="text-green-600 font-semibold">{message}</div>} {/* Display message */}

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-3 pr-4 font-semibold">ID</th>
                  <th className="py-3 pr-4 font-semibold">Image</th>
                  <th className="py-3 pr-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sliders.length > 0 ? (
                  sliders.map((slider) => (
                    <tr key={slider.id} className="border-b last:border-b-0">
                      <td className="py-3 pr-4 align-middle">{slider.id}</td>
                      <td className="py-3 pr-4 align-middle">
                        {slider.image ? (
                          <img
                            src={slider.image}
                            alt={`Slider Image ${slider.id}`}
                            className="h-12 w-12 object-cover rounded-md"
                          />
                        ) : (
                          <span>No Image</span>
                        )}
                      </td>
                      <td className="py-3 pr-4 align-middle">
                        <button
                          onClick={() => handleShow(slider.id)}
                          className="px-3 py-1 rounded-lg font-semibold border border-blue-500 text-blue-500 hover:bg-blue-50"
                        >
                          Show
                        </button>
                        <button
                          onClick={() => handleDelete(slider.id)}
                          className="px-3 py-1 rounded-lg font-semibold border border-red-500 text-red-500 hover:bg-red-50 ml-2"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="py-3 pr-4 text-center">
                      No sliders available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Show slider details */}
        {selectedSlider && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold">Slider Details</h3>
            <p>ID: {selectedSlider.id}</p>
            <p>Image: {selectedSlider.image || "No Image"}</p>
            {/* Add a form or fields for updating the slider */}
            <input
              type="text"
              value={updatePayload.image}
              onChange={(e) => setUpdatePayload({ image: e.target.value })}
              placeholder="Update Image URL"
              className="mt-2 px-3 py-2 border rounded"
            />
            <button
              onClick={() => handleUpdate(selectedSlider.id)}
              className="ml-2 px-3 py-2 rounded-md bg-blue-600 text-white"
            >
              Update Slider
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
