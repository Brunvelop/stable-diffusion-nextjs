import { FaUser, FaBitcoin } from "react-icons/fa";

const UserWalletInfo = ({ address, balanceSats }) => {
  return (
    <div className="fixed top-0 right-0 p-4 flex items-start space-x-2">
      <div className="flex flex-col items-start space-y-1">
        <div className="flex items-center space-x-1">
          <FaUser className="text-green-500" />
          <span className="text-sm font-semibold text-white">
            {`${address.slice(0, 6)}...${address.slice(-4)}`}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <FaBitcoin className="text-yellow-500" />
          <span className="text-sm font-semibold text-white">{balanceSats / 100000000}</span>
        </div>
      </div>
    </div>
  );
};

export default UserWalletInfo;