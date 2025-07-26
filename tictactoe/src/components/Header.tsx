import { ConnectButton } from "@xellar/kit";
import { useNavigate } from "react-router-dom";
import { ConnectedButton } from "./ConnectedButton";
import { type Address } from "viem";
import { useState } from "react";
import { Menu, X, Gamepad2 } from "lucide-react";

function Header() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="w-full sticky z-50 top-0 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer select-none"
          onClick={() => navigate("/")}
          onCopy={(e) => e.preventDefault()}
        >
          <Gamepad2 className="text-orange-500 w-6 h-6" />
          <h1 className="text-2xl font-bold text-orange-600 tracking-tight">
            Tic-tac-toe
          </h1>
        </div>

        {/* Desktop Wallet Button */}
        <div className="hidden md:flex items-center space-x-4">
          <ConnectButton.Custom>
            {({ openConnectModal, account, isConnected, openProfileModal }) => {
              if (!isConnected) {
                return (
                  <button
                    className="bg-orange-500 hover:bg-orange-600 transition text-white px-4 py-2 rounded-lg text-sm font-medium"
                    onClick={openConnectModal}
                  >
                    Connect Wallet
                  </button>
                );
              }
              return (
                <ConnectedButton
                  address={account?.address as Address}
                  onClick={openProfileModal}
                />
              );
            }}
          </ConnectButton.Custom>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-orange-600"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Wallet Menu */}
      <div
        className={`md:hidden px-4 py-2 transition-all duration-300 ease-in-out ${
          menuOpen
            ? "max-h-32 opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <ConnectButton.Custom>
          {({ openConnectModal, account, isConnected, openProfileModal }) => {
            if (!isConnected) {
              return (
                <button
                  className="w-full bg-orange-500 hover:bg-orange-600 transition text-white px-4 py-2 rounded-md text-sm font-medium"
                  onClick={openConnectModal}
                >
                  Connect Wallet
                </button>
              );
            }
            return (
              <ConnectedButton
                address={account?.address as Address}
                onClick={openProfileModal}
              />
            );
          }}
        </ConnectButton.Custom>
      </div>
    </header>
  );
}

export default Header;
