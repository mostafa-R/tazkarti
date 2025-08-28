import { Calendar, Facebook, Instagram, Twitter } from "lucide-react";
import { useTranslation } from "react-i18next";

function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Brand Section */}
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="p-2 bg-blue-600 rounded-xl">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <span className="text-3xl font-bold">{t("footer.brand")}</span>
          </div>

          <p className="text-gray-400 mb-8 leading-relaxed max-w-2xl mx-auto">
            {t("footer.description")}
          </p>

          {/* Social Media Links */}
          <div className="flex justify-center space-x-4 mb-8">
            <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-all duration-300 transform hover:scale-110">
              <Facebook className="h-5 w-5 text-white" />
            </div>
            <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center cursor-pointer hover:bg-blue-500 transition-all duration-300 transform hover:scale-110">
              <Twitter className="h-5 w-5 text-white" />
            </div>
            <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center cursor-pointer hover:bg-pink-600 transition-all duration-300 transform hover:scale-110">
              <Instagram className="h-5 w-5 text-white" />
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-gray-700 pt-8">
            <p className="text-gray-400 text-sm">
              {t("footer.copyright", { year: new Date().getFullYear() })}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
