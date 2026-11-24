(function () {
  function initPortfolioHoverVideos() {
    document.querySelectorAll(".card_image_wraper").forEach(wrapper => {
      const video = wrapper.querySelector(".thumbline_bg_vid video");
      if (!video) return;

      const background = video.closest(".w-background-video");
      if (background) background.removeAttribute("data-autoplay");
      video.autoplay = false;
      video.removeAttribute("autoplay");
      video.muted = true;
      video.playsInline = true;
      video.preload = "none";
      video.pause();

      let isHovered = false;

      const playVideo = () => {
        if (!isHovered || video.error) return;
        video.play().catch(error => {
          if (error.name !== "AbortError") {
            console.warn("Could not play the portfolio card video.", video.currentSrc, error);
          }
        });
      };

      video.addEventListener("loadeddata", playVideo);
      video.addEventListener("canplay", playVideo);
      video.addEventListener("playing", () => {
        if (isHovered) {
          wrapper.classList.add("is-hover-video-playing");
        } else {
          video.pause();
        }
      });
      video.addEventListener("pause", () => {
        wrapper.classList.remove("is-hover-video-playing");
      });
      video.addEventListener("ended", () => {
        if (isHovered && video.loop) playVideo();
      });
      video.addEventListener("error", () => {
        wrapper.classList.remove("is-hover-video-playing");
        console.error("Portfolio card video failed to load.", video.currentSrc, video.error);
      });

      wrapper.addEventListener("pointerenter", () => {
        isHovered = true;
        video.preload = "auto";
        if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) video.load();
        playVideo();
      });
      wrapper.addEventListener("pointerleave", () => {
        isHovered = false;
        video.pause();
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPortfolioHoverVideos, { once: true });
  } else {
    initPortfolioHoverVideos();
  }
})();
