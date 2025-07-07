import React from 'react';
import { FaSearch, FaLock, FaRegSmile } from 'react-icons/fa';

const UiTestPage = () => {
  const radius = 100; // Circle radius
  const centers = [
    { x: 320, y: 120 },
    { x: 860, y: 120 },
    { x: 1400, y: 120 },
  ];

  return (
    <section className="w-full flex flex-col items-center bg-[#fcfaf7] py-16 overflow-x-auto">
      <h2 className="text-5xl font-bold text-neutral-900 mb-16">How It Works</h2>
      <div className="relative flex items-start justify-center w-full min-w-[1500px]" style={{ maxWidth: 1500, minHeight: 360 }}>
        {/* Wavy SVG Arrows */}
        <svg
          width="1500"
          height="220"
          className="absolute top-[120px] left-0 pointer-events-none"
          viewBox="0 0 1500 220"
          style={{ zIndex: 2 }}
        >
          {/* Arrow 1: Browse -> Secure */}
          <path
            d="
              M 420 120
              C 480 60, 600 60, 660 120
            "
            stroke="#a76024"
            strokeWidth="10"
            strokeDasharray="24 14"
            fill="none"
            markerEnd="url(#arrowhead1)"
          />
          {/* Arrow 2: Secure -> Enjoy */}
          <path
            d="
              M 960 120
              C 1020 60, 1140 60, 1300 120
            "
            stroke="#a76024"
            strokeWidth="10"
            strokeDasharray="24 14"
            fill="none"
            markerEnd="url(#arrowhead1)"
          />
          <defs>
            <marker
              id="arrowhead1"
              markerWidth="7"
              markerHeight="7"
              refX="3.5"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0,0 7,3.5 0,7 2,3.5" fill="#a76024" />
            </marker>
          </defs>
        </svg>

        {/* Steps */}
        <div className="flex flex-row items-end justify-between w-full relative z-10" style={{ maxWidth: 1500 }}>
          {/* Step 1 */}
          <div
            className="flex flex-col items-center"
            style={{ position: "absolute", left: centers[0].x - radius, top: 0 }}
          >
            <div className="w-[200px] h-[200px] rounded-full border-4 border-[#ff6a2b] bg-[#fceee0] shadow-lg flex items-center justify-center mb-6">
              <FaSearch className="text-[70px] text-[#ff6a2b]" />
            </div>
            <div className="text-[2rem] font-bold text-[#99582a] text-center mb-2">
              Browse & Discover
            </div>
          </div>
          {/* Step 2 */}
          <div
            className="flex flex-col items-center"
            style={{ position: "absolute", left: centers[1].x - radius, top: 0 }}
          >
            <div className="w-[200px] h-[200px] rounded-full border-4 border-[#ff6a2b] bg-[#fceee0] shadow-lg flex items-center justify-center mb-6">
              <FaLock className="text-[70px] text-[#ff6a2b]" />
            </div>
            <div className="text-[2rem] font-bold text-[#99582a] text-center mb-2">
              Secure Purchase
            </div>
          </div>
          {/* Step 3 */}
          <div
            className="flex flex-col items-center"
            style={{ position: "absolute", left: centers[2].x - radius, top: 0 }}
          >
            <div className="w-[200px] h-[200px] rounded-full border-4 border-[#ff6a2b] bg-[#fceee0] shadow-lg flex items-center justify-center mb-6">
              <FaRegSmile className="text-[70px] text-[#ff6a2b]" />
            </div>
            <div className="text-[2rem] font-bold text-[#99582a] text-center mb-2">
              Enjoy the Event
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UiTestPage;
