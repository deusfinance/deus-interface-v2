import React from 'react'

export default function RightArrow({ size, ...rest }: { size?: number; [x: string]: any }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="44" height="35" viewBox="0 0 44 35" fill="none" {...rest}>
      <path
        d="M42.3752 16.1134L25.9334 0.999999L22.9164 3.77323L35.7163 15.539L0.999999 15.539L0.999999 19.4609L35.7164 19.4609L22.9164 31.2268L25.9334 34L42.3752 18.8866C43.2083 18.1208 43.2083 16.8792 42.3752 16.1134Z"
        fill="#1D1D1D"
        stroke="#2C2C2C"
        strokeLinecap="square"
        strokeLinejoin="round"
      />
    </svg>
  )
}
