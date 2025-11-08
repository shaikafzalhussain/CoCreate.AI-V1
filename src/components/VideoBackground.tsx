const VideoBackground = ({ isLanding = false }) => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className={`absolute inset-0 w-full h-full object-cover ${isLanding ? 'opacity-40' : 'opacity-30'}`}
      >
        <source src="/background.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/80" />
    </div>
  );
};

export default VideoBackground;
