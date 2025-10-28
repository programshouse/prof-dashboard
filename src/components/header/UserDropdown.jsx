// src/components/layout/UserDropdown.jsx
import React, { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { useAuthStore } from "../../stors/useAuthStore";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { admin, logout } = useAuthStore(); // ✅ get admin directly from store

  const toggleDropdown = () => setIsOpen((v) => !v);
  const closeDropdown = () => setIsOpen(false);

  const name = admin?.name || "Admin";
  const email = admin?.email || "No email";


  return (
    <div className="relative">
      {/* Main dropdown toggle */}
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dropdown-toggle dark:text-gray-400"
      >
        {/* <span className="mr-3 overflow-hidden rounded-full h-11 w-11 bg-gray-100">
          <img
            src={avatar}
            alt={name}
            className="object-cover w-full h-full"
          />
        </span> */}

        <span className="block mr-1 font-medium text-theme-sm">{name}</span>

        <svg
          className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Dropdown content */}
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <div>
          <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
            {name}
          </span>
          <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
            {email}
          </span>
        </div>

        {/* Logout button */}
        <button
          onClick={() => {
            logout();
            closeDropdown();
          }}
          className="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300 w-full text-left"
        >
          Sign out
        </button>
      </Dropdown>
    </div>
  );
}
