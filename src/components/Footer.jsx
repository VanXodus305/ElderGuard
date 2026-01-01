"use client";

import React from "react";
import { useFontSize } from "./Navbar";

const GlobalFooter = () => {
  const { fontSizeMap, fontSize } = useFontSize();

  return (
    <footer
      className={`bg-gradient-to-r from-emerald-100 to-teal-100 border-t border-emerald-200 py-8 px-6 mt-12 ${fontSizeMap[fontSize]}`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-emerald-700 mb-3">
              About ElderGuard
            </h3>
            <p className="text-emerald-600">
              Protecting seniors from scams and fraudulent messages with
              advanced AI technology.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-emerald-700 mb-3">Safety Features</h3>
            <ul className="space-y-2 text-emerald-600">
              <li>✓ Message Analysis</li>
              <li>✓ Link Verification</li>
              <li>✓ Emergency Contact</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-emerald-300 pt-6 text-center text-emerald-600">
          <p>
            &copy; 2026 ElderGuard. All rights reserved. Protecting our seniors.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default GlobalFooter;
