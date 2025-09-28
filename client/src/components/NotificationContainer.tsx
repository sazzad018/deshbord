import { useNotifications } from "@/contexts/NotificationContext";
import NotificationPopup from "./NotificationPopup";
import { useLocation } from "wouter";

export default function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications();
  const [location] = useLocation();

  // Handle viewing payment details by redirecting to payment management
  const handleViewDetails = () => {
    // If not already on payment management page, redirect there
    if (!location.includes('/payment-management')) {
      window.location.href = '/payment-management';
    }
  };

  return (
    <>
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          style={{ 
            position: 'fixed',
            top: `${20 + (index * 120)}px`, // Stack notifications vertically
            right: '20px',
            zIndex: 9999 - index // Higher notifications get higher z-index
          }}
        >
          <NotificationPopup
            notification={notification}
            onDismiss={removeNotification}
            onViewDetails={handleViewDetails}
          />
        </div>
      ))}
    </>
  );
}