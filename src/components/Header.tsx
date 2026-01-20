import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import alQuranCalligraphy from '@/assets/al-quran-calligraphy.svg';
import settingsIcon from '@/assets/settings-icon.svg';
import menuIcon from '@/assets/menu-icon.svg';

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

  const { canInstall, install } = usePWAInstall();

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className={`header-gradient px-4 shadow-lg transition-all duration-300 ${isHomePage ? 'py-4' : 'py-6'}`}>
        <div className="container mx-auto flex items-center relative">
          {/* Left Side: Back Button or Menu Icon - Flex 1 to take available space */}
          <div className="flex-1 flex justify-start items-center gap-3 z-10 text-left">
            {showBack ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
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

            {!isHomePage && (
              <div>
                <h1 className="text-lg font-bold text-primary-foreground">{title}</h1>
                {subtitle && (
                  <p className="text-sm text-primary-foreground/80">{subtitle}</p>
                )}
              </div>
            )}
          </div>

          {/* Center: Calligraphy (Centered in flow) - Auto width but constrained */}
          {isHomePage && (
            <div className="flex flex-col items-center justify-center text-center z-10 shrink-0 mx-2">
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
            </div>
          )}

          {/* Right Side: Settings and Install - Flex 1 to balance the left side */}
          <div className="flex-1 flex justify-end items-center gap-2 z-10 text-right">
            {isHomePage && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onSettingsClick}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <img src={settingsIcon} alt="Settings" className="h-6 w-6 brightness-0 invert" />
              </Button>
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
