import React from "react";
import RupeeLoader from './RupeeLoader'

export default function PageLoader({ size = 140, fullScreen = false }) {
  return (
    <div className={`page-loader${fullScreen ? ' page-loader--fullscreen' : ''}`}>
      <RupeeLoader size={size} />
    </div>
  )
}
