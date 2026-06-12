import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { 
  Bell, 
  Menu, 
  X, 
  LogOut, 
  User, 
  Activity, 
  Calendar, 
  CheckCircle,
  FileText
} from "lucide-react";

interface NavigationProps {
  onNavigate: (page: string) => void;
  activeTab: string;
}

export const Navigation: React.FC<NavigationProps> = ({ onNavigate, activeTab }) => {
  const { currentUser, logout, notifications, markNotificationsRead } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = () => {
    setNotificationsOpen(!notificationsOpen);
    if (!notificationsOpen && unreadCount > 0) {
      markNotificationsRead();
    }
  };

  const [activeSection, setActiveSection] = useState<string>("home");

  React.useEffect(() => {
    if (activeTab !== "landing") {
      setActiveSection("");
      return;
    }

    const sections = ["features", "about", "faq"];

    const handleScroll = () => {
      if (window.scrollY < 120) {
        setActiveSection("home");
        return;
      }

      let currentActive = "home";
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 120) {
            currentActive = sectionId;
            break;
          }
        }
      }
      setActiveSection(currentActive);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("hashchange", handleScroll);

    handleScroll();
    const initialT = setTimeout(handleScroll, 150);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("hashchange", handleScroll);
      clearTimeout(initialT);
    };
  }, [activeTab]);

  const menuItems = [
    { label: "Home", key: "home", action: () => onNavigate("landing") },
    { label: "Features", key: "features", url: "#features" },
    { label: "About Homeopathy", key: "about", url: "#about" },
    { label: "FAQ", key: "faq", url: "#faq" }
  ];

  return (
    <nav id="app_navbar" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center">
            <button 
              onClick={() => onNavigate("landing")}
              className="flex items-center gap-2 group text-left cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-200">
                <Activity className="w-5.5 h-5.5 animate-pulse" />
              </div>
              <div>
                <span className="text-lg font-bold font-display tracking-tight text-slate-900 group-hover:text-teal-600 transition">
                  HomeoCare
                </span>
                <span className="hidden min-[400px]:block text-[9px] text-slate-500 font-medium tracking-wider uppercase">
                  Classical Healing from Home
                </span>
              </div>
            </button>
            
            {/* Desktop Navigation links */}
            <div className="hidden md:flex ml-10 space-x-6 items-center">
              {menuItems.map((item, i) => {
                const isActive = activeTab === "landing" && activeSection === item.key;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      if (item.action) item.action();
                      else {
                        onNavigate("landing");
                        setTimeout(() => {
                          const el = document.querySelector(item.url || "");
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }, 100);
                      }
                    }}
                    className={`text-sm font-semibold cursor-pointer py-1.5 px-3 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 ${
                      isActive
                        ? "text-teal-600 bg-teal-50 font-bold border border-teal-100 shadow-xs"
                        : "text-slate-600 hover:text-teal-600 hover:bg-slate-50"
                    }`}
                    id={`nav_link_${i}`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-4 shrink-0 flex-nowrap">
            {currentUser ? (
              <div className="relative flex items-center gap-1.5 sm:gap-3">
                {/* Active user state dashboard link */}
                <button
                  id="nav_dashboard_btn"
                  onClick={() => onNavigate("dashboard")}
                  className={`text-xs font-semibold p-2 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                    activeTab === "dashboard"
                      ? "bg-teal-600 text-white shadow-lg shadow-teal-100"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900"
                  }`}
                  title="My Dashboard"
                >
                  <User className="w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" />
                  <span className="hidden sm:inline">My Dashboard<span className="hidden lg:inline"> ({currentUser.role})</span></span>
                </button>

                 {/* Notifications Bell */}
                <div className="relative">
                  <button
                    id="notifications_bell_trigger"
                    onClick={handleNotificationClick}
                    className={`p-2 rounded-full cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 relative border ${
                      notificationsOpen
                        ? "bg-teal-50 text-teal-600 border-teal-150 shadow-xs"
                        : "text-slate-500 hover:bg-slate-50 hover:text-teal-600 border-transparent"
                    }`}
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white rounded-full w-4.5 h-4.5 flex items-center justify-center text-[9px] font-bold border-2 border-white animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications list dropdown */}
                  {notificationsOpen && (
                    <div 
                      id="notifications_dropdown"
                      className="absolute right-[-60px] sm:right-0 mt-3.5 w-80 max-w-[calc(100vw-32px)] bg-white border border-slate-150 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
                    >
                      <div className="p-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-800 font-display">Notifications</span>
                        <span className="text-[10px] text-slate-500 font-medium">Auto-Marked Read</span>
                      </div>
                      
                      <div className="max-h-64 overflow-y-auto divide-y divide-slate-150">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-xs text-slate-400">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((not) => (
                            <div 
                              key={not.id} 
                              className={`p-3 text-left transition ${not.isRead ? "bg-white" : "bg-teal-50/40"}`}
                            >
                              <div className="flex gap-2 items-start">
                                <div className="mt-0.5">
                                  {not.type === "success" ? (
                                    <CheckCircle className="w-3.5 h-3.5 text-teal-500" />
                                  ) : (
                                    <Activity className="w-3.5 h-3.5 text-sky-500" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-xs font-semibold text-slate-800 leading-tight">
                                    {not.title}
                                  </h4>
                                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                                    {not.message}
                                  </p>
                                  <span className="block text-[9px] text-slate-400 mt-1">
                                    {new Date(not.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Logout Button */}
                <button
                  id="nav_logout_btn"
                  onClick={() => {
                    logout();
                    onNavigate("landing");
                  }}
                  className="hidden sm:block p-2 rounded-full text-slate-500 hover:bg-rose-50 hover:text-rose-650 transition-all duration-200 hover:scale-105 active:scale-95 border border-transparent hover:border-rose-100 cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  id="nav_login_link"
                  onClick={() => onNavigate("auth")}
                  className={`text-xs font-semibold cursor-pointer py-1.5 px-3 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 ${
                    activeTab === "auth"
                      ? "text-teal-600 bg-teal-50 font-bold border border-teal-100 shadow-xs"
                      : "text-slate-750 hover:text-teal-600 hover:bg-slate-50"
                  }`}
                >
                  Login
                </button>
                <button
                  id="nav_register_link"
                  onClick={() => onNavigate("auth")}
                  className="hidden sm:block bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-200 shadow-xs cursor-pointer hover:scale-105 active:scale-95"
                >
                  Register Now
                </button>
              </div>
            )}

            {/* Mobile menu panel trigger */}
            <div className="flex md:hidden">
              <button
                id="mobile_menu_trigger"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-850 cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div id="mobile_navbar_menu" className="md:hidden bg-white border-b border-slate-100 px-4 pt-2 pb-4 space-y-2">
          {menuItems.map((item, i) => {
            const isActive = activeTab === "landing" && activeSection === item.key;
            return (
              <button
                key={i}
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (item.action) item.action();
                  else {
                    onNavigate("landing");
                    setTimeout(() => {
                      const el = document.querySelector(item.url || "");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }, 100);
                  }
                }}
                className={`block w-full text-left font-semibold py-2 px-3 rounded-lg cursor-pointer transition-all duration-150 ${
                  isActive
                    ? "text-teal-600 bg-teal-50 font-bold border-l-4 border-teal-500"
                    : "text-slate-700 hover:text-teal-600 hover:bg-slate-50"
                }`}
              >
                {item.label}
              </button>
            );
          })}
          {currentUser && (
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <div className="px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                My Account ({currentUser.role})
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate("dashboard");
                }}
                className={`w-full text-left py-2 px-3 font-semibold rounded-lg text-sm cursor-pointer transition-all flex items-center gap-2 ${
                  activeTab === "dashboard"
                    ? "text-teal-600 bg-teal-50 font-bold"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <User className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                  onNavigate("landing");
                }}
                className="w-full text-left py-2 px-3 font-semibold rounded-lg text-sm cursor-pointer transition-all text-rose-600 hover:bg-rose-50 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
          {!currentUser && (
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate("auth");
                }}
                className={`w-full text-center py-2 font-semibold rounded-lg text-sm cursor-pointer transition-all ${
                  activeTab === "auth"
                    ? "text-teal-600 bg-teal-50 font-bold border-l-4 border-teal-500"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate("auth");
                }}
                className={`w-full text-center py-2 font-semibold rounded-lg text-sm cursor-pointer transition-all ${
                  activeTab === "auth"
                    ? "bg-teal-700 text-white font-bold"
                    : "bg-teal-600 text-white hover:bg-teal-700"
                }`}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
