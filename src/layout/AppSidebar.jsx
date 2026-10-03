import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  MdPerson,
  MdWork,
  MdBusiness,
  MdArticle,
  MdDescription,
  MdGroups,
  MdBuild,
} from "react-icons/md";
import { ChevronDownIcon } from "../icons";
import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";

const navItems = [
  { name: "Profile", icon: <MdPerson />, path: "/who-am-i" },
  { name: "Workshops", icon: <MdWork />, path: "/workshop" },
  { name: "Services", icon: <MdBusiness />, path: "/services" },
  { name: "Tools", icon: <MdBuild />, path: "/tools" },
  { name: "Blogs", icon: <MdArticle />, path: "/blogs" },
  { name: "Settings", icon: <MdDescription />, path: "/settings" },
  { name: "Subscribes", icon: <MdGroups />, path: "/subscribers" },
];

const AppSidebar = () => {
  const {
    isExpanded,
    isMobileOpen,
    isMobile,
    isHovered,
    setIsHovered,
  } = useSidebar();

  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState(null);

  const isActive = useCallback(
    (path) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
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

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location.pathname, isActive]);

  const handleSubmenuToggle = (index) => {
    setOpenSubmenu((prev) => (prev === index ? null : index));
  };

  /*
   * Mobile:
   * sidebar مفتوح = اعرض الاسم دائماً
   *
   * Desktop:
   * اعرض الاسم لو expanded أو hover
   */
  const showLabels = isMobile
    ? isMobileOpen
    : isExpanded || isHovered;

  const baseItem =
    "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-colors text-white hover:bg-white/15";

  const baseIcon =
    "menu-item-icon-size flex min-w-[24px] items-center justify-center text-xl text-white";

  const baseText =
    "menu-item-text whitespace-nowrap text-white";

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50
        flex flex-col
        border-r border-white/10
        bg-brand-600
        text-white
        transition-all duration-300 ease-in-out

        ${
          isMobile
            ? "w-[290px]"
            : isExpanded || isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }

        ${
          isMobile
            ? isMobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
            : "translate-x-0"
        }
      `}
      onMouseEnter={() => {
        if (!isMobile && !isExpanded) {
          setIsHovered(true);
        }
      }}
      onMouseLeave={() => {
        if (!isMobile) {
          setIsHovered(false);
        }
      }}
    >
      <div className="flex h-full min-h-0 flex-col pt-16">

        {/* ================= LOGO ================= */}
        <div className="flex w-full shrink-0 items-center justify-center px-4 py-8">
          <Link
            to="/"
            className="flex w-full items-center justify-center"
          >
            <img
              src="/images/logo/profLogo.png"
              alt="Prof MSE"
              className={`block object-contain transition-all duration-300 ${
                showLabels
                  ? "h-auto w-[100px]"
                  : "h-auto w-[60px]"
              }`}
            />
          </Link>
        </div>

        {/* ================= NAVIGATION ================= */}
        <nav className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto px-1 pb-6">
          <ul className="flex flex-col gap-3">
            {navItems.map((nav, index) => (
              <li key={nav.name} className="w-full">

                {nav.subItems ? (
                  <button
                    type="button"
                    onClick={() => handleSubmenuToggle(index)}
                    className={`
                      ${baseItem}
                      ${showLabels ? "justify-start" : "justify-center"}
                    `}
                  >
                    <span className={baseIcon}>
                      {nav.icon}
                    </span>

                    {showLabels && (
                      <span className={baseText}>
                        {nav.name}
                      </span>
                    )}

                    {showLabels && (
                      <ChevronDownIcon
                        className={`
                          ml-auto h-5 w-5 shrink-0
                          text-white
                          transition-transform duration-200
                          ${
                            openSubmenu === index
                              ? "rotate-180"
                              : ""
                          }
                        `}
                      />
                    )}
                  </button>
                ) : (
                  nav.path && (
                    <Link
                      to={nav.path}
                      className={`
                        ${baseItem}

                        ${
                          showLabels
                            ? "justify-start"
                            : "justify-center"
                        }

                        ${
                          isActive(nav.path)
                            ? "bg-white/20"
                            : ""
                        }
                      `}
                    >
                      <span className={baseIcon}>
                        {nav.icon}
                      </span>

                      {showLabels && (
                        <span className={baseText}>
                          {nav.name}
                        </span>
                      )}
                    </Link>
                  )
                )}

                {/* ================= SUBMENU ================= */}
                {nav.subItems && showLabels && (
                  <div
                    className={`
                      overflow-hidden
                      transition-all duration-300
                      ${
                        openSubmenu === index
                          ? "max-h-[500px] opacity-100"
                          : "max-h-0 opacity-0"
                      }
                    `}
                  >
                    <ul className="ml-9 mt-2 space-y-1">
                      {nav.subItems.map((subItem) => (
                        <li key={subItem.name}>
                          <Link
                            to={subItem.path}
                            className={`
                              ${baseItem}

                              ${
                                isActive(subItem.path)
                                  ? "bg-white/20"
                                  : ""
                              }
                            `}
                          >
                            <span className={baseText}>
                              {subItem.name}
                            </span>

                            <span className="ml-auto flex items-center gap-1">
                              {subItem.new && (
                                <span className="menu-dropdown-badge">
                                  new
                                </span>
                              )}

                              {subItem.pro && (
                                <span className="menu-dropdown-badge">
                                  pro
                                </span>
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

          {/* ================= WIDGET ================= */}
          {showLabels && (
            <div className="mt-6">
              <SidebarWidget />
            </div>
          )}
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;