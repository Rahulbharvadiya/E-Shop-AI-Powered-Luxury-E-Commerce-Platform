import React, { useEffect, useRef } from 'react';
import { Github, Linkedin, Mail, Shield, Zap, Sparkles, Send } from 'lucide-react';

export default function Web3CanvasFooter({ onSelectCategory }) {
  const canvasRef = useRef(null);

  // Interactive Web3 Canvas Particle / Blockchain Node Network in #FF9E00 and #F8F6F6
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    const numNodes = Math.floor(width / 22);
    const nodes = [];

    for (let i = 0; i < numNodes; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2 + 1,
        color: i % 3 === 0 ? '#B8935A' : i % 3 === 1 ? '#C2603F' : '#FAF6EF'
      });
    }

    let mouse = { x: -1000, y: -1000 };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    canvas.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Connect nodes with lines (Brass Gold mesh)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            const alpha = (1 - dist / 110) * 0.35;
            ctx.strokeStyle = `rgba(184, 147, 90, ${alpha})`;
            ctx.lineWidth = 0.75;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }

        // Mouse connection effect (Terracotta glow)
        const mdx = nodes[i].x - mouse.x;
        const mdy = nodes[i].y - mouse.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

        if (mdist < 140) {
          const malpha = (1 - mdist / 140) * 0.6;
          ctx.strokeStyle = `rgba(194, 96, 63, ${malpha})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }

      // Draw particle dots
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();

        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <footer className="relative w-full bg-[#1E3A34] text-[#FAF6EF] border-t border-[#B8935A]/35 pt-16 pb-28 mt-24 overflow-hidden font-sans">
      
      {/* Interactive Web3 HTML5 Canvas Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-auto opacity-30"
        style={{ height: '100%' }}
      />

      <div className="relative z-10 max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#B8935A]/25">
          
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-[6px] bg-[#C2603F] flex items-center justify-center text-white font-black text-lg shadow-sm">
                ⚡
              </div>
              <span className="font-serif text-2xl font-bold text-[#FAF6EF] tracking-tight">
                E<span className="text-[#C2603F]">·</span>SHOP
              </span>
            </div>
            <p className="text-xs text-[#FAF6EF]/80 leading-relaxed font-sans">
              Curating luxury consumer electronics, designer fashion, and home lifestyle collections. Engineered with contextual AI intelligence and instant invoice generation.
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs text-[#B8935A] font-bold font-sans">
              <Shield className="w-4 h-4 stroke-[2.5]" />
              <span>100% Certified Authentic</span>
            </div>
          </div>

          {/* Quick Departments */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#FAF6EF] font-serif">
              Collections
            </h4>
            <ul className="space-y-2 text-xs text-[#FAF6EF]/75 font-sans">
              <li>
                <button onClick={() => onSelectCategory && onSelectCategory('mobiles')} className="hover:text-[#B8935A] transition-colors cursor-pointer">
                  Mobiles & Flagships
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory && onSelectCategory('laptops')} className="hover:text-[#B8935A] transition-colors cursor-pointer">
                  Laptops & Workstations
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory && onSelectCategory('audio')} className="hover:text-[#B8935A] transition-colors cursor-pointer">
                  Audio & Sound Systems
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory && onSelectCategory('watches')} className="hover:text-[#B8935A] transition-colors cursor-pointer">
                  Smart Watches & Trackers
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory && onSelectCategory('fashion')} className="hover:text-[#B8935A] transition-colors cursor-pointer">
                  Fashion & Streetwear
                </button>
              </li>
            </ul>
          </div>

          {/* Logistics & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#FAF6EF] font-serif">
              Logistics & Pincode
            </h4>
            <div className="text-xs text-[#FAF6EF]/80 space-y-2 leading-relaxed font-sans">
              <p>
                <strong className="text-[#FAF6EF]">Bengaluru Warehouse Hub:</strong><br />
                PIN 560001 (CBD Central Fulfillment)
              </p>
              <p>
                <strong className="text-[#FAF6EF]">Primary Delivery Zone:</strong><br />
                PIN 560035 (Bellandur / Sarjapur Corridor)
              </p>
              <p className="text-[11px] text-[#FAF6EF]/60">
                Haversine delivery calculations active for all 6-digit Indian PIN codes.
              </p>
            </div>
          </div>

          {/* Developer & Newsletter */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#FAF6EF] font-serif">
              Haute Newsletter
            </h4>
            <p className="text-xs text-[#FAF6EF]/80 font-sans">
              Subscribe for private flash drops, secret promo codes, and weekend specials.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed to E-Shop VIP drops!'); }} className="flex items-center gap-2">
              <input
                type="email"
                required
                placeholder="Enter email address"
                className="w-full bg-[#142922] border border-[#B8935A]/35 rounded-[6px] px-3 py-2 text-xs text-[#FAF6EF] placeholder-[#FAF6EF]/50 focus:outline-none focus:border-[#B8935A] font-sans"
              />
              <button
                type="submit"
                className="btn-cta px-3.5 py-2 rounded-[6px] bg-[#C2603F] hover:bg-[#A44E31] text-white font-bold text-xs uppercase tracking-wider transition-colors shrink-0 shadow-sm cursor-pointer"
              >
                Join
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-wrap items-center justify-between gap-4 text-xs text-[#FAF6EF]/65 font-sans">
          <p>© 2026 E-Shop Technologies Inc. Built with React, Node.js, Socket.IO & Vector PDFKit.</p>
          <div className="flex items-center gap-4">
            <span className="text-[#FAF6EF]/85">Architected for High-Performance Next-Gen Commerce</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
