import React, { useState, useEffect, useRef } from 'react';
import { X, Bell, Flame, Tag, ArrowRight, CheckCheck, Sparkles, MoveRight } from 'lucide-react';
import { useNotificationStore } from '../stores/useNotificationStore';
import { useAuthStore } from '../stores/useAuthStore';

// Individual Swipeable Notification Item
function SwipeableNotificationItem({ notification, onDismiss, onSelectDeal }) {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const itemRef = useRef(null);

  // Touch Handlers
  const handleTouchStart = (e) => {
    startXRef.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startXRef.current;
    if (diff > 0) setDragX(diff);
  };

  const handleTouchEnd = () => {
    if (dragX > 110) {
      setDragX(350);
      setTimeout(() => {
        onDismiss(notification._id);
      }, 200);
    } else {
      setDragX(0);
    }
    setIsDragging(false);
  };

  // Mouse Handlers for Desktop Dragging
  const handleMouseDown = (e) => {
    startXRef.current = e.clientX;
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const diff = e.clientX - startXRef.current;
    if (diff > 0) setDragX(diff);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    if (dragX > 110) {
      setDragX(350);
      setTimeout(() => {
        onDismiss(notification._id);
      }, 200);
    } else {
      setDragX(0);
    }
    setIsDragging(false);
  };

  const opacity = Math.max(0.2, 1 - dragX / 200);

  return (
    <div className="relative overflow-hidden rounded-2xl group select-none font-poppins">
      {/* Background action hint revealed on swipe */}
      <div className="absolute inset-0 bg-[#FF9E00]/15 border border-[#FF9E00]/30 rounded-2xl flex items-center px-4 gap-2 text-[#FF9E00] font-bold text-xs">
        <CheckCheck className="w-4 h-4" />
        <span>Dismissing alert...</span>
      </div>

      {/* Swipeable Card Content */}
      <div
        ref={itemRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          transform: `translateX(${dragX}px)`,
          opacity: opacity,
          transition: isDragging ? 'none' : 'transform 0.25s ease-out, opacity 0.25s ease-out'
        }}
        className="relative bg-[#160D0D] border border-[#F8F6F6]/10 p-4 rounded-2xl cursor-grab active:cursor-grabbing hover:border-[#FF9E00]/35 transition-colors shadow-lg"
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#FF9E00]/15 text-[#FF9E00]">
              <Flame className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FF9E00] text-[#0D0606] font-mono">
              {notification.dealTag || 'DEAL BROADCAST'}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDismiss(notification._id);
            }}
            className="text-[#786E6E] hover:text-[#F8F6F6] p-1 rounded-lg hover:bg-[#201313] transition-colors"
            title="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <h4 className="text-xs sm:text-sm font-bold text-[#F8F6F6] mb-1 font-giliran">{notification.title}</h4>
        <p className="text-xs text-[#B8B0B0] mb-3 leading-relaxed font-poppins">{notification.message}</p>

        <div className="flex items-center justify-between pt-2 border-t border-[#F8F6F6]/10">
          <div className="flex items-center gap-1 text-[10px] text-[#786E6E]">
            <MoveRight className="w-3 h-3 text-[#FF9E00] animate-pulse" />
            <span>Swipe right to dismiss</span>
          </div>
          <button
            onClick={() => onSelectDeal(notification)}
            className="flex items-center gap-1 text-xs font-bold text-[#FF9E00] hover:text-[#FFAE26] group-hover:translate-x-0.5 transition-transform cursor-pointer"
          >
            <span>Shop Deal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NotificationDrawer({ onSelectDeal }) {
  const { notifications, isDrawerOpen, toggleDrawer, dismissNotification, fetchNotifications } = useNotificationStore();
  const { token } = useAuthStore();

  useEffect(() => {
    fetchNotifications();
  }, [token]);

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end font-poppins">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0D0606]/80 backdrop-blur-sm transition-opacity"
        onClick={() => toggleDrawer(false)}
      />

      {/* Slide-over Drawer */}
      <div className="relative w-full max-w-md h-full bg-[#0D0606] border-l border-[#F8F6F6]/10 shadow-2xl flex flex-col z-10 animate-slide-left">
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#F8F6F6]/10 flex items-center justify-between bg-[#140B0B]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FF9E00]/15 text-[#FF9E00]">
              <Bell className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-giliran font-extrabold text-[#F8F6F6] flex items-center gap-2">
                Live Deal Broadcasts
                {notifications.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#FF9E00] text-[#0D0606] font-mono font-black">
                    {notifications.length}
                  </span>
                )}
              </h3>
              <p className="text-xs text-[#B8B0B0]">Real-time push alerts & flash drops</p>
            </div>
          </div>
          <button
            onClick={() => toggleDrawer(false)}
            className="p-2 rounded-xl text-[#B8B0B0] hover:text-[#F8F6F6] hover:bg-[#201313] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions banner */}
        <div className="px-5 py-2.5 bg-[#140B0B] border-b border-[#F8F6F6]/5 flex items-center justify-between text-xs text-[#FF9E00]">
          <span className="flex items-center gap-1.5 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#FF9E00]" />
            Interactive: Drag / swipe card right to dismiss
          </span>
        </div>

        {/* Notifications List */}
        <div className="flex-1 p-5 overflow-y-auto space-y-3.5">
          {notifications.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-12 h-12 rounded-full bg-[#160D0D] border border-[#F8F6F6]/10 flex items-center justify-center mx-auto mb-3 text-[#786E6E]">
                <Bell className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-[#F8F6F6]">All caught up!</p>
              <p className="text-xs text-[#786E6E] mt-1 max-w-xs mx-auto">
                No active broadcasts right now. Stay tuned for flash sales and VIP drop alerts.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <SwipeableNotificationItem
                key={notif._id}
                notification={notif}
                onDismiss={dismissNotification}
                onSelectDeal={(n) => {
                  toggleDrawer(false);
                  if (onSelectDeal) onSelectDeal(n);
                }}
              />
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-[#F8F6F6]/10 bg-[#140B0B] text-center">
          <p className="text-[11px] text-[#786E6E]">
            Broadcasting synchronized across all active shoppers via WebSocket
          </p>
        </div>
      </div>
    </div>
  );
}
