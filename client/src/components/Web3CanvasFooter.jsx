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
        color: i % 3 === 0 ? '#FF9E00' : i % 3 === 1 ? '#FFAE26' : '#F8F6F6'
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

      // Connect nodes with lines (Web3 Amber mesh)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            const alpha = (1 - dist / 110) * 0.35;
            ctx.strokeStyle = `rgba(255, 158, 0, ${alpha})`;
            ctx.lineWidth = 0.75;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }

        // Mouse connection effect
        const mdx = nodes[i].x - mouse.x;
        const mdy = nodes[i].y - mouse.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

        if (mdist < 140) {
          const malpha = (1 - mdist / 140) * 0.6;
          ctx.strokeStyle = `rgba(255, 174, 38, ${malpha})`;
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
    <footer className="relative w-full bg-[#0D0606] border-t border-[#F8F6F6]/10 pt-16 pb-28 mt-24 overflow-hidden font-poppins">
      
      {/* Interactive Web3 HTML5 Canvas Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-auto opacity-35"
        style={{ height: '100%' }}
      />

      <div className="relative z-10 max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#F8F6F6]/10">
          
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#FF9E00] flex items-center justify-center text-[#0D0606] font-black text-lg shadow-lg shadow-[#FF9E00]/25">
                ⚡
              </div>
              <span className="font-giliran text-2xl font-black text-[#F8F6F6] tracking-tight">
                E<span className="text-[#FF9E00]">·</span>SHOP
              </span>
            </div>
            <p className="text-xs text-[#B8B0B0] leading-relaxed">
              Curating luxury consumer electronics, designer fashion, and home lifestyle collections. Engineered with contextual AI intelligence and instant invoice generation.
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs text-[#FF9E00] font-bold">
              <Shield className="w-4 h-4 stroke-[2.5]" />
              <span>100% Certified Authentic</span>
            </div>
          </div>

          {/* Quick Departments */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F8F6F6] font-giliran">
              Collections
            </h4>
            <ul className="space-y-2 text-xs text-[#B8B0B0]">
              <li>
                <button onClick={() => onSelectCategory && onSelectCategory('mobiles')} className="hover:text-[#FF9E00] transition-colors">
                  Mobiles & Flagships
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory && onSelectCategory('laptops')} className="hover:text-[#FF9E00] transition-colors">
                  Laptops & Workstations
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory && onSelectCategory('audio')} className="hover:text-[#FF9E00] transition-colors">
                  Audio & Sound Systems
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory && onSelectCategory('watches')} className="hover:text-[#FF9E00] transition-colors">
                  Smart Watches & Trackers
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory && onSelectCategory('fashion')} className="hover:text-[#FF9E00] transition-colors">
                  Fashion & Streetwear
                </button>
              </li>
            </ul>
          </div>

          {/* Logistics & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F8F6F6] font-giliran">
              Logistics & Pincode
            </h4>
            <div className="text-xs text-[#B8B0B0] space-y-2 leading-relaxed">
              <p>
                <strong className="text-[#F8F6F6]">Bengaluru Warehouse Hub:</strong><br />
                PIN 560001 (CBD Central Fulfillment)
              </p>
              <p>
                <strong className="text-[#F8F6F6]">Primary Delivery Zone:</strong><br />
                PIN 560035 (Bellandur / Sarjapur Corridor)
              </p>
              <p className="text-[11px] text-[#786E6E]">
                Haversine delivery calculations active for all 6-digit Indian PIN codes.
              </p>
            </div>
          </div>

          {/* Developer & Newsletter */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F8F6F6] font-giliran">
              Haute Newsletter
            </h4>
            <p className="text-xs text-[#B8B0B0]">
              Subscribe for private flash drops, secret promo codes, and weekend specials.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed to E-Shop VIP drops!'); }} className="flex items-center gap-2">
              <input
                type="email"
                required
                placeholder="Enter email address"
                className="w-full bg-[#160D0D] border border-[#F8F6F6]/10 rounded-xl px-3 py-2 text-xs text-[#F8F6F6] placeholder-[#786E6E] focus:outline-none focus:border-[#FF9E00]"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-[#FF9E00] hover:bg-[#FFAE26] text-[#0D0606] font-bold text-xs transition-colors shrink-0 shadow-md cursor-pointer"
              >
                Join
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-wrap items-center justify-between gap-4 text-xs text-[#786E6E]">
          <p>© 2026 E-Shop Technologies Inc. Built with React, Node.js, Socket.IO & Vector PDFKit.</p>
          <div className="flex items-center gap-4">
            <span className="text-[#B8B0B0]">Architected for High-Performance Next-Gen Commerce</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
