import React from "react";
import { Button } from "../ui/button";
import { offlineService } from "../../services/offlineService";

export default function MobileNavigationBar() {
  const [networkStatus, setNetworkStatus] = React.useState(
    offlineService.isOnline(),
  );

  React.useEffect(() => {
    const handleNetworkChange = () => {
      setNetworkStatus(offlineService.isOnline());
    };

    window.addEventListener("online", handleNetworkChange);
    window.addEventListener("offline", handleNetworkChange);

    return () => {
      window.removeEventListener("online", handleNetworkChange);
      window.removeEventListener("offline", handleNetworkChange);
    };
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center p-2 z-10">
      <Button
        variant="ghost"
        className="flex flex-col items-center text-xs py-1 h-auto"
        onClick={() => (window.location.href = "/mobile/assessments")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        <span>Home</span>
      </Button>

      <Button
        variant="ghost"
        className="flex flex-col items-center text-xs py-1 h-auto"
        onClick={() => (window.location.href = "/mobile/sync")}
      >
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12a9 9 0 0 1-9 9c-2.39 0-4.68-.94-6.4-2.6"></path>
            <path d="M3 12a9 9 0 0 1 9-9c2.39 0 4.68.94 6.4 2.6"></path>
            <path d="m7 17-4-4 4-4"></path>
            <path d="m17 7 4 4-4 4"></path>
          </svg>
          <div
            className={`absolute -top-1 -right-1 h-2 w-2 rounded-full ${networkStatus ? "bg-green-500" : "bg-red-500"}`}
          ></div>
        </div>
        <span>Sync</span>
      </Button>

      <Button
        variant="ghost"
        className="flex flex-col items-center text-xs py-1 h-auto"
        onClick={() => (window.location.href = "/mobile/new-assessment")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14"></path>
          <path d="M5 12h14"></path>
        </svg>
        <span>New</span>
      </Button>

      <Button
        variant="ghost"
        className="flex flex-col items-center text-xs py-1 h-auto"
        onClick={() => (window.location.href = "/mobile/profile")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        <span>Profile</span>
      </Button>
    </div>
  );
}
