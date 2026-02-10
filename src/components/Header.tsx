import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import alQuranCalligraphy from '@/assets/al-quran-calligraphy.svg';
import settingsIcon from '@/assets/settings-icon.svg';
import menuIcon from '@/assets/menu-icon.svg';
import backIcon from '@/assets/back-icon.svg';
import infoIcon from '@/assets/information-icon.svg';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onSettingsClick: () => void;
  onMenuClick?: () => void;
  showBack?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onSettingsClick,
  onMenuClick,
  showBack = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const scrollDirection = useScrollDirection();

  const { canInstall, install } = usePWAInstall();

  // Determine if header should be hidden based on scroll direction
  const isHeaderHidden = scrollDirection === 'down';

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-transform duration-300 ${isHeaderHidden ? '-translate-y-full' : 'translate-y-0'
        }`}
    >
      <div className={`header-gradient px-0 shadow-lg transition-all duration-300 ${isHomePage ? 'py-4' : 'h-20 flex items-center'}`}>
        <div className={`w-full ${isHomePage ? 'flex justify-center items-center relative min-h-[50px]' : 'grid grid-cols-[1fr_auto_1fr] items-center h-full'}`}>
          {/* Left Side: Back Button or Menu Icon */}
          <div className={`${isHomePage ? 'absolute left-0 top-1/2 -translate-y-1/2' : 'col-start-1'} flex justify-start items-center gap-3 z-20 text-left min-w-0`}>
            {showBack ? (
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-full text-primary-foreground hover:bg-primary-foreground/20 transition-colors"
              >
                <img src={backIcon} alt="Back" className="h-6 w-6 brightness-0 invert" />
              </button>
            ) : isHomePage && onMenuClick ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={onMenuClick}
                className="text-primary-foreground hover:bg-primary-foreground/20"
                title="Navigation"
              >
                <img src={menuIcon} alt="Menu" className="h-6 w-6 brightness-0 invert" />
              </Button>
            ) : null}
          </div>

          {/* Center: Calligraphy (Home) or Title (Other Pages) */}
          <div className={`${isHomePage ? 'w-full px-12' : 'col-start-2'} flex flex-col items-center justify-center text-center z-10`}>
            {isHomePage ? (
              <>
                <img
                  src={alQuranCalligraphy}
                  alt="Al-Quran Al-Kareem"
                  className="h-20 w-auto mb-0 filter brightness-0 invert"
                />
                <div className="flex flex-col items-center gap-0">
                  <h1 className="text-2xl font-bold text-primary-foreground leading-tight whitespace-nowrap">
                    Holy Quran
                  </h1>
                  <p className="text-2xl font-bold text-primary-foreground leading-tight whitespace-nowrap">
                    Luganda and English
                  </p>
                </div>
              </>
            ) : (
              <div>
                <h1 className="text-[30px] font-bold text-primary-foreground leading-none">{title}</h1>
                {subtitle && (
                  <p className="text-sm text-primary-foreground/80 mt-1">{subtitle}</p>
                )}
              </div>
            )}
          </div>

          {/* Right Side: Settings and Install */}
          <div className={`${isHomePage ? 'absolute right-0 top-1/2 -translate-y-1/2' : 'col-start-3'} flex justify-end items-center gap-1 z-20 text-right`}>
            {isHomePage && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/about')}
                  className="text-primary-foreground hover:bg-primary-foreground/20"
                  title="About"
                >
                  <img src={infoIcon} alt="About" className="h-6 w-6 brightness-0 invert" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onSettingsClick}
                  className="text-primary-foreground hover:bg-primary-foreground/20"
                >
                  <img src={settingsIcon} alt="Settings" className="h-6 w-6 brightness-0 invert" />
                </Button>
              </>
            )}
            {canInstall && (
              <Button
                variant="ghost"
                size="icon"
                onClick={install}
                className="text-primary-foreground hover:bg-primary-foreground/20"
                title="Install App"
              >
                <Download className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Decorative pattern */}

    </header>
  );
};
