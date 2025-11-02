import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  MdPerson, 
  MdWork, 
  MdBusiness, 
  MdArticle, 
  MdDescription,
  MdGroups,
} from "react-icons/md";
import { ChevronDownIcon } from "../icons";
import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";

const navItems = [
  { name: "Profile",   icon: <MdPerson />,     path: "/who-am-i" },
  { name: "Workshops", icon: <MdWork />,       path: "/workshop" },
  { name: "Services",  icon: <MdBusiness />,   path: "/services" },
  { name: "Blogs",     icon: <MdArticle />,    path: "/blogs" },
  { name: "Subscribers", icon: <MdGroups />,   path: "/subscribers" },
  { name: "Contact",   icon: <MdDescription />,path: "/settings" },
];

const AppSidebar = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();

  // Alphabetical order
  function getSortedNavItems(items) {
    return [...items].sort((a, b) =>
      (a.name || "").toLowerCase().localeCompare((b.name || "").toLowerCase())
    );
  }

  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState(null);

  const isActive = useCallback(
    (path) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : navItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({ type: menuType, index });
              submenuMatched = true;
            }
          });
        }
      });
    });
    if (!submenuMatched) setOpenSubmenu(null);
  }, [location, isActive]);

  const handleSubmenuToggle = (index) => {
    setOpenSubmenu((prev) => (prev && prev.index === index ? null : { index }));
  };

  // 👉 Unified base classes for items: white text + gray hover
  const baseItem =
    "group flex items-center gap-3 rounded-lg px-3 py-2 transition-colors text-white hover:bg-gray-200/30";
  const baseIcon = "menu-item-icon-size text-white";
  const baseText = "menu-item-text text-white";

  return (
    <aside
      className={`fixed top-0 left-0 z-50 mt-16 flex h-screen flex-col border-r border-gray-200 bg-brand-600 px-5 text-gray-900 transition-all duration-300 ease-in-out lg:mt-0 dark:border-gray-800 dark:bg-gray-900 ${
        isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
          ? "w-[290px]"
          : "w-[90px]"
      } ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex py-8 lg:justify-center">
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="/images/logo/profLogo.png"
                alt="logo2"
                width={100}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images1/logo/logo2-dark.svg"
                alt="logo2"
                width={100}
                height={30}
              />
            </>
          ) : (
            <img
              src="/images/logo/logo2.png"
              alt="logo2"
              width={150}
              height={120}
            />
          )}
        </Link>
      </div>

      <nav className="no-scrollbar flex flex-col overflow-y-auto pb-6 duration-300 ease-linear">
        <ul className="flex flex-col gap-4">
          {getSortedNavItems(navItems).map((nav, index) => (
            <li key={nav.name}>
              {nav.subItems ? (
                <button
                  onClick={() => handleSubmenuToggle(index)}
                  className={`${baseItem} ${
                    !isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"
                  }`}
                >
                  <span className={baseIcon}>{nav.icon}</span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className={baseText}>{nav.name}</span>
                  )}
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <ChevronDownIcon
                      className={`ml-auto h-5 w-5 transition-transform duration-200 text-white ${
                        openSubmenu?.index === index ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>
              ) : (
                nav.path && (
                  <Link
                    to={nav.path}
                    className={`${baseItem} ${
                      !isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"
                    } ${isActive(nav.path) ? "bg-gray-200/40" : ""}`}
                  >
                    <span className={baseIcon}>{nav.icon}</span>
                    {(isExpanded || isHovered || isMobileOpen) && (
                      <span className={baseText}>{nav.name}</span>
                    )}
                  </Link>
                )
              )}

              {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{
                    display: openSubmenu?.index === index ? "block" : "none",
                  }}
                >
                  <ul className="mt-2 ml-9 space-y-1">
                    {nav.subItems.map((subItem) => (
                      <li key={subItem.name}>
                        <Link
                          to={subItem.path}
                          className={`${baseItem} ${
                            isActive(subItem.path) ? "bg-gray-200/40" : ""
                          }`}
                        >
                          <span className={baseText}>{subItem.name}</span>
                          <span className="ml-auto flex items-center gap-1">
                            {subItem.new && (
                              <span className="menu-dropdown-badge">new</span>
                            )}
                            {subItem.pro && (
                              <span className="menu-dropdown-badge">pro</span>
                            )}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>

        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </nav>
    </aside>
  );
};

export default AppSidebar;
