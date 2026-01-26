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
  { name: "Profile", icon: <MdPerson />, path: "/who-am-i" },
  { name: "Workshops", icon: <MdWork />, path: "/workshop" },
  { name: "Services", icon: <MdBusiness />, path: "/services" },
  { name: "Blogs", icon: <MdArticle />, path: "/blogs" },
  { name: "Settings", icon: <MdDescription />, path: "/settings" },
  { name: "Subscribes", icon: <MdGroups />, path: "/subscribers" },
];

const AppSidebar = () => {
  const {
    isExpanded,
    isMobileOpen,
    isMobile, // mobile+tablet (<lg)
    isHovered,
    setIsHovered,
  } = useSidebar();

  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState(null);

  const isActive = useCallback(
    (path) => location.pathname === path,
    [location.pathname]
  );

  // Auto-open submenu if any sub route is active (desktop only)
  useEffect(() => {
    if (isMobile) return;

    let submenuMatched = false;
    navItems.forEach((nav, index) => {
      if (nav.subItems) {
        nav.subItems.forEach((subItem) => {
          if (isActive(subItem.path)) {
            setOpenSubmenu(index);
            submenuMatched = true;
          }
        });
      }
    });
    if (!submenuMatched) setOpenSubmenu(null);
  }, [location, isActive, isMobile]);

  const handleSubmenuToggle = (index) => {
    // disable submenu UX on mobile/tablet (icons only)
    if (isMobile) return;
    setOpenSubmenu((prev) => (prev === index ? null : index));
  };

  // icons-only on mobile/tablet
  const showLabels = !isMobile && (isExpanded || isHovered || isMobileOpen);

  const baseItem =
    "group flex items-center gap-3 rounded-lg px-3 py-2 transition-colors text-white hover:bg-gray-200/30";
  const baseIcon = "menu-item-icon-size text-white";
  const baseText = "menu-item-text text-white";

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-gray-200 bg-brand-600 px-5 text-gray-900 transition-all duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-900 ${
        isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"
      } ${isMobileOpen ? "translate-x-0" : isMobile ? "-translate-x-full" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isMobile && !isExpanded && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
    >
      <div className="pt-16 h-full flex flex-col">
      <div className="flex py-8 lg:justify-center">
        <Link to="/">
          {showLabels ? (
            <>
              <img
                className="dark:hidden"
                src="/images/logo/profLogo.png"
                alt="logo"
                width={100}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images1/logo/logo2-dark.svg"
                alt="logo"
                width={100}
                height={30}
              />
            </>
          ) : (
            <>
              <img
                className="dark:hidden"
                src="/images/logo/profLogo.png"
                alt="logo"
                width={60}
                height={24}
              />
              <img
                className="hidden dark:block"
                src="/images1/logo/logo2-dark.svg"
                alt="logo"
                width={60}
                height={18}
              />
            </>
          )}
        </Link>
      </div>

      <nav className="no-scrollbar flex flex-col overflow-y-auto pb-6 duration-300 ease-linear">
        <ul className="flex flex-col gap-4">
          {navItems.map((nav, index) => (
            <li key={nav.name}>
              {nav.subItems ? (
                <button
                  onClick={() => handleSubmenuToggle(index)}
                  className={`${baseItem} ${showLabels ? "justify-start" : "justify-center"}`}
                >
                  <span className={baseIcon}>{nav.icon}</span>

                  {showLabels && <span className={baseText}>{nav.name}</span>}

                  {showLabels && (
                    <ChevronDownIcon
                      className={`ml-auto h-5 w-5 transition-transform duration-200 text-white ${
                        openSubmenu === index ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>
              ) : (
                nav.path && (
                  <Link
                    to={nav.path}
                    className={`${baseItem} ${
                      showLabels ? "justify-start" : "justify-center"
                    } ${isActive(nav.path) ? "bg-gray-200/40" : ""}`}
                  >
                    <span className={baseIcon}>{nav.icon}</span>
                    {showLabels && <span className={baseText}>{nav.name}</span>}
                  </Link>
                )
              )}

              {/* Submenu: desktop only */}
              {nav.subItems && showLabels && (
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{ display: openSubmenu === index ? "block" : "none" }}
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

        {showLabels ? <SidebarWidget /> : null}
      </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
