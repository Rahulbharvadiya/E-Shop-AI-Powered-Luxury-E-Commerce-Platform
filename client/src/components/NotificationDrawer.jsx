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
    <div className="relative overflow-hidden rounded-xl group select-none font-sans">
      {/* Background action hint revealed on swipe */}
      <div className="absolute inset-0 bg-[#4F7A5A]/15 border border-[#4F7A5A]/30 rounded-xl flex items-center px-4 gap-2 text-[#4F7A5A] font-bold text-xs">
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
        className="relative bg-[#FFFFFF] border border-[#E7DFD2] p-4 rounded-xl cursor-grab active:cursor-grabbing hover:border-[#B8935A]/50 transition-colors shadow-sm"
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-[#C2603F]/10 text-[#C2603F]">
              <Flame className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#C2603F] text-white font-mono shadow-sm">
              {notification.dealTag || 'DEAL BROADCAST'}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDismiss(notification._id);
            }}
            className="text-[#6B665E] hover:text-[#1F2421] p-1 rounded-md hover:bg-[#FAF6EF] transition-colors cursor-pointer"
            title="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <h4 className="text-xs sm:text-sm font-bold text-[#1E3A34] mb-1 font-serif">{notification.title}</h4>
        <p className="text-xs text-[#6B665E] mb-3 leading-relaxed font-sans">{notification.message}</p>

        <div className="flex items-center justify-between pt-2 border-t border-[#E7DFD2]">
          <div className="flex items-center gap-1 text-[10px] text-[#6B665E]">
            <MoveRight className="w-3 h-3 text-[#C2603F] animate-pulse" />
            <span>Swipe right to dismiss</span>
          </div>
          <button
            onClick={() => onSelectDeal(notification)}
            className="flex items-center gap-1 text-xs font-bold text-[#C2603F] hover:text-[#A44E31] group-hover:translate-x-0.5 transition-transform cursor-pointer"
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
    <div className="fixed inset-0 z-50 flex justify-end font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#142922]/60 backdrop-blur-sm transition-opacity"
        onClick={() => toggleDrawer(false)}
      />

      {/* Slide-over Drawer */}
      <div className="relative w-full max-w-md h-full bg-[#FAF6EF] border-l border-[#E7DFD2] shadow-2xl flex flex-col z-10 animate-slide-left">
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#B8935A]/30 flex items-center justify-between bg-[#1E3A34] text-[#FAF6EF]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-white/10 text-[#B8935A]">
              <Bell className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-[#FAF6EF] flex items-center gap-2">
                Live Deal Broadcasts
                {notifications.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#C2603F] text-white font-mono font-bold shadow-sm">
                    {notifications.length}
                  </span>
                )}
              </h3>
              <p className="text-xs text-[#FAF6EF]/80">Real-time push alerts & flash drops</p>
            </div>
          </div>
          <button
            onClick={() => toggleDrawer(false)}
            className="p-2 rounded-lg text-[#FAF6EF]/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions banner */}
        <div className="px-5 py-2.5 bg-[#142922] border-b border-[#B8935A]/20 flex items-center justify-between text-xs text-[#B8935A]">
          <span className="flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#B8935A]" />
            Interactive: Drag / swipe card right to dismiss
          </span>
        </div>

        {/* Notifications List */}
        <div className="flex-1 p-5 overflow-y-auto space-y-3.5 bg-[#FAF6EF]">
          {notifications.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-12 h-12 rounded-full bg-[#FFFFFF] border border-[#E7DFD2] flex items-center justify-center mx-auto mb-3 text-[#6B665E] shadow-sm">
                <Bell className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-[#1E3A34] font-serif">All caught up!</p>
              <p className="text-xs text-[#6B665E] mt-1 max-w-xs mx-auto">
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
        <div className="p-4 border-t border-[#E7DFD2] bg-[#FFFFFF] text-center">
          <p className="text-[11px] text-[#6B665E]">
            Broadcasting synchronized across all active shoppers via WebSocket
          </p>
        </div>
      </div>
    </div>
  );
}
