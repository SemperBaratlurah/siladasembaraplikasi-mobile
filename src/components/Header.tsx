import { useState, useMemo, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Search, Monitor, ChevronDown, FileText, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useMenus, Menu as MenuType } from "@/hooks/useMenus";
import { usePublicSiteSettings } from "@/hooks/usePublicSiteSettings";
import { usePublicSearch, SearchResult } from "@/hooks/usePublicSearch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logo from "@/assets/kelurahan-icon.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { menus, isLoading } = useMenus(true, "header");
  const { settings: siteSettings, isLoading: siteLoading } = usePublicSiteSettings();
  const { searchTerm, setSearchTerm, results, isSearching, noResults } = usePublicSearch();
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultClick = (result: SearchResult) => {
    if (result.type === "service" && result.url) {
      window.open(result.url, "_blank");
    } else if (result.url) {
      if (result.url.startsWith("http")) {
        window.open(result.url, "_blank");
      } else {
        navigate(result.url);
      }
    }
    setIsSearchOpen(false);
    setSearchTerm("");
  };

  const getResultIcon = (result: SearchResult) => {
    if (result.type === "service") {
      return <Layers className="w-4 h-4 text-primary" />;
    }
    return <FileText className="w-4 h-4 text-secondary" />;
  };

  // Organize menus into parent-child structure
  // Filter out "Beranda" from database menus - it's hardcoded
  const { parentMenus, childrenMap } = useMemo(() => {
    const filteredMenus = menus.filter(m => 
      m.slug !== 'beranda' && 
      m.name.toLowerCase() !== 'beranda' &&
      m.url !== '/'
    );
    
    const parents = filteredMenus.filter(m => !m.parent_id);
    const childrenMap = new Map<string, MenuType[]>();
    
    filteredMenus.filter(m => m.parent_id).forEach(child => {
      const parentId = child.parent_id!;
      if (!childrenMap.has(parentId)) {
        childrenMap.set(parentId, []);
      }
      childrenMap.get(parentId)!.push(child);
    });
    
    return { parentMenus: parents, childrenMap };
  }, [menus]);

  const renderNavLink = (menu: MenuType, onClick?: () => void) => {
    const href = menu.url || `/${menu.slug}`;
    const isExternal = menu.url?.startsWith("http") || menu.target === "_blank";

    if (isExternal) {
      return (
        <a
          href={href}
          target={menu.target || "_blank"}
          rel="noopener noreferrer"
          className="text-white/90 hover:text-white font-medium transition-colors"
          onClick={onClick}
        >
          {menu.name}
        </a>
      );
    }

    return (
      <Link
        to={href}
        className="text-white/90 hover:text-white font-medium transition-colors"
        onClick={onClick}
      >
        {menu.name}
      </Link>
    );
  };

  const renderDesktopNavItem = (menu: MenuType) => {
    const children = childrenMap.get(menu.id);
    
    if (children && children.length > 0) {
      // Has children - render as dropdown
      return (
        <DropdownMenu key={menu.id}>
          <DropdownMenuTrigger className="flex items-center gap-1 xl:gap-1.5 text-white/90 hover:text-white font-medium transition-colors outline-none text-sm lg:text-base xl:text-lg">
            {menu.name}
            <ChevronDown className="w-4 h-4 xl:w-5 xl:h-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[180px] xl:min-w-[200px]">
            {children.map(child => {
              const href = child.url || `/${child.slug}`;
              const isExternal = child.url?.startsWith("http") || child.target === "_blank";
              
              return (
                <DropdownMenuItem key={child.id} asChild className="text-sm xl:text-base">
                  {isExternal ? (
                    <a
                      href={href}
                      target={child.target || "_blank"}
                      rel="noopener noreferrer"
                      className="cursor-pointer"
                    >
                      {child.name}
                    </a>
                  ) : (
                    <Link to={href} className="cursor-pointer">
                      {child.name}
                    </Link>
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    // No children - render as simple link
    const href = menu.url || `/${menu.slug}`;
    const isExternal = menu.url?.startsWith("http") || menu.target === "_blank";

    if (isExternal) {
      return (
        <a
          key={menu.id}
          href={href}
          target={menu.target || "_blank"}
          rel="noopener noreferrer"
          className="text-white/90 hover:text-white font-medium transition-colors text-sm lg:text-base xl:text-lg"
        >
          {menu.name}
        </a>
      );
    }

    return (
      <Link
        key={menu.id}
        to={href}
        className="text-white/90 hover:text-white font-medium transition-colors text-sm lg:text-base xl:text-lg"
      >
        {menu.name}
      </Link>
    );
  };

  const renderMobileNavItem = (menu: MenuType, onClick: () => void) => {
    const children = childrenMap.get(menu.id);
    const href = menu.url || `/${menu.slug}`;
    const isExternal = menu.url?.startsWith("http") || menu.target === "_blank";

    return (
      <div key={menu.id}>
        {isExternal ? (
          <a
            href={href}
            target={menu.target || "_blank"}
            rel="noopener noreferrer"
            className="block text-white/90 hover:text-white font-medium py-2 transition-colors"
            onClick={onClick}
          >
            {menu.name}
          </a>
        ) : (
          <Link
            to={href}
            className="block text-white/90 hover:text-white font-medium py-2 transition-colors"
            onClick={onClick}
          >
            {menu.name}
          </Link>
        )}
        
        {/* Render children with indent */}
        {children && children.length > 0 && (
          <div className="pl-4 border-l border-white/20 ml-2">
            {children.map(child => {
              const childHref = child.url || `/${child.slug}`;
              const isChildExternal = child.url?.startsWith("http") || child.target === "_blank";
              
              return isChildExternal ? (
                <a
                  key={child.id}
                  href={childHref}
                  target={child.target || "_blank"}
                  rel="noopener noreferrer"
                  className="block text-white/70 hover:text-white font-medium py-2 transition-colors text-sm"
                  onClick={onClick}
                >
                  {child.name}
                </a>
              ) : (
                <Link
                  key={child.id}
                  to={childHref}
                  className="block text-white/70 hover:text-white font-medium py-2 transition-colors text-sm"
                  onClick={onClick}
                >
                  {child.name}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <header className="gradient-header sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between h-16 md:h-20 xl:h-24">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 xl:gap-4">
            <img 
              src={logo} 
              alt="Logo" 
              className="w-10 h-10 md:w-12 md:h-12 xl:w-14 xl:h-14 object-contain"
            />
            {siteLoading ? (
              <Skeleton className="h-6 w-32 bg-white/20" />
            ) : siteSettings.site_name ? (
              <span className="text-white font-bold text-lg md:text-xl xl:text-2xl tracking-wide">
                {siteSettings.site_name}
              </span>
            ) : null}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 xl:gap-10 2xl:gap-12">
            {/* Hardcoded Beranda - not editable via CMS */}
            <Link
              to="/"
              className="text-white/90 hover:text-white font-medium transition-colors text-sm lg:text-base xl:text-lg"
            >
              Beranda
            </Link>
            
            {isLoading ? (
              <>
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-4 w-16 bg-white/20" />
                ))}
              </>
            ) : (
              parentMenus.map((menu) => renderDesktopNavItem(menu))
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4 xl:gap-6">
            <button className="text-white/80 hover:text-white transition-colors">
              <Monitor className="w-5 h-5 xl:w-6 xl:h-6" />
            </button>
            
            {/* Search Button & Dropdown */}
            <div className="relative" ref={searchRef}>
              <button 
                className="text-white/80 hover:text-white transition-colors"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                <Search className="w-5 h-5 xl:w-6 xl:h-6" />
              </button>

              {/* Search Dropdown */}
              <AnimatePresence>
                {isSearchOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-3 w-80 xl:w-96 bg-card rounded-xl shadow-xl border overflow-hidden z-50"
                  >
                    <div className="p-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Cari layanan atau menu..."
                          className="pl-10 h-10 bg-muted/50 border-0"
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Search Results */}
                    {isSearching && (
                      <div className="border-t">
                        {noResults ? (
                          <div className="p-4 text-center text-muted-foreground text-sm">
                            Tidak ditemukan
                          </div>
                        ) : (
                          <ul className="max-h-64 overflow-y-auto">
                            {results.map((result) => (
                              <li key={`${result.type}-${result.id}`}>
                                <button
                                  onClick={() => handleResultClick(result)}
                                  className="w-full px-4 py-3 flex items-start gap-3 hover:bg-muted transition-colors text-left"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                    {getResultIcon(result)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-foreground truncate text-sm">
                                      {result.name}
                                    </p>
                                    {result.description && (
                                      <p className="text-xs text-muted-foreground truncate">
                                        {result.description}
                                      </p>
                                    )}
                                  </div>
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}

                    {!isSearching && (
                      <div className="p-4 text-center text-muted-foreground text-sm border-t">
                        Ketik untuk mencari layanan...
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link to="/login">
              <Button className="bg-secondary hover:bg-secondary/90 text-white font-semibold px-6 xl:px-8 xl:py-2.5 xl:text-base shadow-button">
                Login
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-navy-dark border-t border-white/10"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
              {/* Mobile Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari layanan..."
                  className="pl-10 h-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>

              {/* Mobile Search Results */}
              {isSearching && (
                <div className="mb-4 bg-white/10 rounded-lg overflow-hidden">
                  {noResults ? (
                    <div className="p-3 text-center text-white/60 text-sm">
                      Tidak ditemukan
                    </div>
                  ) : (
                    <ul>
                      {results.map((result) => (
                        <li key={`${result.type}-${result.id}`}>
                          <button
                            onClick={() => {
                              handleResultClick(result);
                              setIsMenuOpen(false);
                            }}
                            className="w-full px-3 py-2 flex items-center gap-3 hover:bg-white/10 transition-colors text-left"
                          >
                            <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center flex-shrink-0">
                              {getResultIcon(result)}
                            </div>
                            <span className="text-white text-sm truncate">
                              {result.name}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Hardcoded Beranda - not editable via CMS */}
              <Link
                to="/"
                className="block text-white/90 hover:text-white font-medium py-2 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Beranda
              </Link>
              
              {isLoading ? (
                <>
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full bg-white/20" />
                  ))}
                </>
              ) : (
                parentMenus.map((menu) => renderMobileNavItem(menu, () => setIsMenuOpen(false)))
              )}
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                <Button className="bg-secondary hover:bg-secondary/90 text-white font-semibold w-full mt-4">
                  Login
                </Button>
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;