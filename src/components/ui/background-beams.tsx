"use client";
import { cn } from "@/lib/utils";
import React from "react";

export const BackgroundBeams = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "absolute inset-0 z-0 h-full w-full bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black",
        className
      )}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        width="100%"
        height="100%"
        viewBox="0 0 700 700"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#clip0_1_2)">
          <g filter="url(#filter0_f_1_2)">
            <circle
              cx="117.5"
              cy="117.5"
              r="317.5"
              fill="#3b82f6"
              fillOpacity="0.15"
            />
          </g>
          <g filter="url(#filter1_f_1_2)">
            <circle
              cx="582.5"
              cy="582.5"
              r="217.5"
              fill="#1e40af"
              fillOpacity="0.2"
            />
          </g>
          <g filter="url(#filter2_f_1_2)">
            <circle
              cx="350"
              cy="350"
              r="150"
              fill="#60a5fa"
              fillOpacity="0.1"
            />
          </g>
        </g>
        <defs>
          <filter
            id="filter0_f_1_2"
            x="-400"
            y="-400"
            width="1035"
            height="1035"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="BackgroundImageFix"
              result="shape"
            />
            <feGaussianBlur
              stdDeviation="100"
              result="effect1_foregroundBlur_1_2"
            />
          </filter>
          <filter
            id="filter1_f_1_2"
            x="165"
            y="165"
            width="835"
            height="835"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="BackgroundImageFix"
              result="shape"
            />
            <feGaussianBlur
              stdDeviation="100"
              result="effect1_foregroundBlur_1_2"
            />
          </filter>
          <filter
            id="filter2_f_1_2"
            x="100"
            y="100"
            width="500"
            height="500"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="BackgroundImageFix"
              result="shape"
            />
            <feGaussianBlur
              stdDeviation="50"
              result="effect1_foregroundBlur_1_2"
            />
          </filter>
          <clipPath id="clip0_1_2">
            <rect width="700" height="700" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
};
